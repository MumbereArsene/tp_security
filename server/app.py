import os
import time
import random
import threading
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import datetime, timezone, timedelta
from config.config import Config
from models.models import db, User, LoginAttempt, BlockedIP, bcrypt, SecurityAlert

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Database Initialization
with app.app_context():
    db.create_all()
    # Create default admin if not exists
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin', email='admin@soc.local', role='admin')
        admin.set_password('password123')
        db.session.add(admin)
        db.session.commit()

# --- Helper Functions ---
def get_client_ip():
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0]
    return request.remote_addr

def detect_attack(ip, username):
    # Check if IP is already blocked
    blocked = BlockedIP.query.filter_by(ip_address=ip).first()
    if blocked:
        if blocked.blocked_until and blocked.blocked_until > datetime.now(timezone.utc):
            return True, "IP_BLOCKED"
        else:
            db.session.delete(blocked)
            db.session.commit()
    
    # Check last attempts
    recent_failures = LoginAttempt.query.filter_by(
        ip_address=ip, 
        status='FAILED'
    ).filter(LoginAttempt.created_at > datetime.now(timezone.utc) - timedelta(minutes=5)).count()
    
    if recent_failures >= 5:
        # Block IP
        new_block = BlockedIP(
            ip_address=ip, 
            reason=f'Brute force detected for user: {username}', 
            blocked_until=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        alert = SecurityAlert(
            severity='HIGH',
            message=f'IP {ip} blocked after {recent_failures} failed attempts',
            ip_address=ip
        )
        db.session.add(new_block)
        db.session.add(alert)
        db.session.commit()
        
        socketio.emit('new_alert', {
            'severity': 'HIGH',
            'message': alert.message,
            'timestamp': datetime.now(timezone.utc).strftime('%H:%M:%S')
        })
        return True, "BLOCK_TRIGGERED"
    
    return False, None

# --- Simulation Logic ---
def generate_random_attack():
    usernames = ['admin', 'root', 'superuser', 'dev_ops', 'maintenance', 'guest', 'support', 'backup', 'system_auto', 'db_admin']
    passwords = ['123456', 'password', 'admin123', 'qwerty', 'summer2024', 'Guest123!', 'root_pass', 'system_key']
    countries = ['USA', 'China', 'Russia', 'Germany', 'Brazil', 'France', 'Japan', 'India', 'Canada', 'UK']
    ips = [f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}" for _ in range(20)]
    
    with app.app_context():
        while True:
            try:
                ip = random.choice(ips)
                username = random.choice(usernames)
                password = random.choice(passwords)
                country = random.choice(countries)
                
                # Check if IP is blocked
                blocked = BlockedIP.query.filter_by(ip_address=ip).first()
                if blocked and (not blocked.blocked_until or blocked.blocked_until > datetime.now(timezone.utc)):
                    status = 'BLOCKED'
                    detection = 'MEDIUM'
                else:
                    rand = random.random()
                    if rand < 0.005: # 0.5% success
                        status = 'SUCCESS'
                        detection = 'CRITICAL'
                        alert = SecurityAlert(severity='CRITICAL', message=f'Unauthorized success from {ip} on account {username}', ip_address=ip)
                        db.session.add(alert)
                        socketio.emit('new_alert', {'severity': 'CRITICAL', 'message': alert.message, 'timestamp': datetime.now(timezone.utc).strftime('%H:%M:%S')})
                    elif rand > 0.98: # 2% block
                        status = 'BLOCKED'
                        detection = 'HIGH'
                        new_block = BlockedIP(ip_address=ip, reason='Simulated brute force', blocked_until=datetime.now(timezone.utc) + timedelta(minutes=30))
                        db.session.add(new_block)
                    else:
                        status = 'FAILED'
                        detection = 'LOW'
                
                attempt = LoginAttempt(
                    username=username,
                    password_tested=password,
                    ip_address=ip,
                    country=country,
                    status=status,
                    detection_level=detection,
                    user_agent='Hydra/9.5 (Kali Linux)' if random.random() > 0.5 else 'Mozilla/5.0'
                )
                db.session.add(attempt)
                db.session.commit()
                
                # Prepare data for socket
                attack_data = {
                    'id': attempt.id,
                    'timestamp': datetime.now(timezone.utc).strftime('%H:%M:%S'),
                    'username': username,
                    'password': password,
                    'ip': ip,
                    'country': country,
                    'status': status,
                    'detection': detection,
                    'userAgent': attempt.user_agent
                }
                
                socketio.emit('new_attack', attack_data)
                
                # Stats update
                stats = get_current_stats()
                socketio.emit('stats_update', stats)
            except Exception as e:
                print(f"Simulation Error (Recoverable): {e}")
                db.session.rollback()
            
            time.sleep(random.uniform(0.1, 1.5))

def get_current_stats():
    total = LoginAttempt.query.count()
    success = LoginAttempt.query.filter_by(status='SUCCESS').count()
    failed = LoginAttempt.query.filter_by(status='FAILED').count()
    blocked = LoginAttempt.query.filter_by(status='BLOCKED').count()
    ips_blocked = BlockedIP.query.count()
    alerts = SecurityAlert.query.count()
    
    return {
        'totalAttempts': total,
        'successCount': success,
        'failedCount': failed,
        'blockedCount': blocked,
        'ipsBlocked': ips_blocked,
        'alertCount': alerts,
        'attacksPerSecond': round(random.uniform(2.5, 8.4), 1),
        'threatLevel': 'CRITICAL' if alerts > 10 else 'ELEVATED' if alerts > 5 else 'STABLE'
    }

# Start simulation in background thread
threading.Thread(target=generate_random_attack, daemon=True).start()

# --- API Routes ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'msg': 'Username already exists'}), 400
    
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'msg': 'User created successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    ip = get_client_ip()
    user_agent = request.headers.get('User-Agent')
    
    # Check for attack
    is_blocked, reason = detect_attack(ip, username)
    if is_blocked:
        attempt = LoginAttempt(username=username, password_tested=password, ip_address=ip, country='Unknown', status='BLOCKED', detection_level='HIGH', user_agent=user_agent)
        db.session.add(attempt)
        db.session.commit()
        return jsonify({'msg': 'Your IP has been blocked due to suspicious activity'}), 403

    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password):
        attempt = LoginAttempt(username=username, password_tested='********', ip_address=ip, country='Unknown', status='SUCCESS', detection_level='NONE', user_agent=user_agent)
        db.session.add(attempt)
        db.session.commit()
        
        access_token = create_access_token(identity={'username': user.username, 'role': user.role})
        return jsonify(access_token=access_token, user={'username': user.username, 'role': user.role}), 200
    
    # Log failure
    attempt = LoginAttempt(username=username, password_tested=password, ip_address=ip, country='Unknown', status='FAILED', detection_level='LOW', user_agent=user_agent)
    db.session.add(attempt)
    db.session.commit()
    
    # Notify dashboard of "real" attempt
    socketio.emit('new_attack', {
        'timestamp': datetime.now(timezone.utc).strftime('%H:%M:%S'),
        'username': username,
        'password': password,
        'ip': ip,
        'status': 'FAILED',
        'detection': 'LOW'
    })
    
    return jsonify({'msg': 'Bad username or password'}), 401

@app.route('/api/logs', methods=['GET'])
@jwt_required()
def get_logs():
    limit = request.args.get('limit', 50, type=int)
    logs = LoginAttempt.query.order_by(LoginAttempt.created_at.desc()).limit(limit).all()
    return jsonify([{
        'id': l.id,
        'timestamp': datetime.now(timezone.utc).strftime('%H:%M:%S'),
        'username': l.username,
        'password': l.password_tested,
        'ip': l.ip_address,
        'country': l.country,
        'status': l.status,
        'detection': l.detection_level,
        'userAgent': l.user_agent
    } for l in logs])

@app.route('/api/stats', methods=['GET'])
def get_stats():
    return jsonify(get_current_stats())

@app.route('/api/alerts', methods=['GET'])
@jwt_required()
def get_alerts():
    alerts = SecurityAlert.query.order_by(SecurityAlert.created_at.desc()).limit(20).all()
    return jsonify([{
        'id': a.id,
        'severity': a.severity,
        'message': a.message,
        'timestamp': datetime.now(timezone.utc).strftime('%H:%M:%S'),
        'ip': a.ip_address
    } for a in alerts])

@app.route('/api/packets', methods=['GET'])
def get_packets():
    # Simulate Wireshark packet data
    packets = []
    for i in range(10):
        packets.append({
            'no': random.randint(1000, 9999),
            'time': round(random.uniform(0, 10), 4),
            'source': f"192.168.1.{random.randint(2, 254)}",
            'destination': "192.168.1.5",
            'protocol': random.choice(['TCP', 'HTTP', 'TLSv1.2']),
            'length': random.randint(60, 1500),
            'info': random.choice([
                'POST /api/login HTTP/1.1 (application/json)',
                'GET /dashboard HTTP/1.1',
                '401 Unauthorized (application/json)',
                '200 OK (application/json)',
                '[TCP segment of a reassembled PDU]'
            ])
        })
    return jsonify(packets)

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
