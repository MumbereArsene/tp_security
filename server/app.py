import eventlet
eventlet.monkey_patch()

import os
import time
import random
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import datetime, timezone, timedelta
from config.config import Config
from models.models import db, User, LoginAttempt, BlockedIP, bcrypt, SecurityAlert, NetworkPacket, TerminalLog

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet', engineio_logger=False)

SERVER_IP = "192.168.1.5"

# --- HELPERS ---
def get_live_stats():
    """Calculates REAL-TIME statistics directly from the database (Source of Truth)."""
    try:
        total = LoginAttempt.query.count()
        success = LoginAttempt.query.filter_by(status='SUCCESS').count()
        failed = LoginAttempt.query.filter_by(status='FAILED').count()
        blocked = LoginAttempt.query.filter_by(status='BLOCKED').count()
        ips = BlockedIP.query.count()
        alerts = SecurityAlert.query.count()
        
        window = datetime.now(timezone.utc) - timedelta(seconds=5)
        recent = LoginAttempt.query.filter(LoginAttempt.created_at > window).count()
        
        return {
            'totalAttempts': total,
            'successCount': success,
            'failedCount': failed,
            'blockedCount': blocked,
            'ipsBlocked': ips,
            'alertCount': alerts,
            'attacksPerSecond': round(recent / 5.0, 1),
            'threatLevel': 'CRITICAL' if alerts > 10 else 'ELEVATED' if alerts > 5 else 'STABLE',
            'successRatio': f"{success}/{total}" if total > 0 else "0/0"
        }
    except Exception as e:
        print(f"Stats Error: {e}")
        return {}

def emit_detailed_packets(attempt_id, source_ip, username, status):
    ts = datetime.now()
    base_no = attempt_id * 3
    packets = [
        {"no": base_no + 1, "protocol": "TCP", "len": 64, "info": f"{random.randint(49152, 65535)} -> 5000 [SYN]"},
        {"no": base_no + 2, "protocol": "HTTP", "len": 485, "info": f"POST /api/login user={username}"},
        {"no": base_no + 3, "protocol": "HTTP", "len": 210, "info": f"HTTP/1.1 {200 if status == 'SUCCESS' else 401} {status}"}
    ]
    for p in packets:
        pkt = NetworkPacket(packet_no=p['no'], time=ts.strftime('%H:%M:%S'), source=source_ip, destination=SERVER_IP, protocol=p['protocol'], length=p['len'], info=p['info'])
        db.session.add(pkt)
        socketio.emit('new_packet', {"no": p['no'], "time": pkt.time, "source": pkt.source, "destination": pkt.destination, "protocol": pkt.protocol, "length": pkt.length, "info": pkt.info})
    db.session.commit()

# --- DB INITIALIZATION ---
with app.app_context():
    db.create_all()
    User.query.delete() # Ensure clean state
    targets = [('admin', 'admin123', 'admin@soc.local', 'admin'), ('user', 'password', 'user@soc.local', 'user')]
    for username, password, email, role in targets:
        u = User(username=username, email=email, role=role)
        u.set_password(password); db.session.add(u)
    db.session.commit()

# --- ROUTES ---

@app.route('/api/terminal/history', methods=['GET'])
def get_terminal_history():
    logs = TerminalLog.query.order_by(TerminalLog.id.asc()).limit(500).all()
    return jsonify([{'line': l.line, 'timestamp': l.created_at.strftime('%H:%M:%S')} for l in logs]), 200

@app.route('/api/terminal/log', methods=['POST'])
def terminal_log():
    data = request.json
    line = data.get('line', '')
    new_log = TerminalLog(line=line)
    db.session.add(new_log); db.session.commit()
    socketio.emit('new_terminal_log', {'line': line, 'timestamp': datetime.now().strftime('%H:%M:%S')})
    return jsonify({'status': 'ok'}), 200

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username, password = data.get('username'), data.get('password')
    ip = request.headers.get('X-Forwarded-For', request.remote_addr).split(',')[0]
    user_agent = request.headers.get('User-Agent')
    
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        status, code = 'SUCCESS', 200
        token = create_access_token(identity={'username': user.username, 'role': user.role})
        resp_data = {'token': token, 'user': {'username': user.username, 'role': user.role}}
    else:
        status, code = 'FAILED', 401
        resp_data = {'msg': 'Auth Failed'}

    try:
        attempt = LoginAttempt(username=username, password_tested=password if status != 'SUCCESS' else '********', ip_address=ip, country='Unknown', status=status, detection_level='NONE' if status == 'SUCCESS' else 'LOW', user_agent=user_agent)
        db.session.add(attempt); db.session.commit()
        
        # Real-time updates
        socketio.emit('new_attack', {'id': attempt.id, 'timestamp': datetime.now().strftime('%H:%M:%S'), 'username': username, 'password': attempt.password_tested, 'ip': ip, 'status': status, 'detection': attempt.detection_level})
        socketio.emit('stats_update', get_live_stats())
        emit_detailed_packets(attempt.id, ip, username, status)
    except: db.session.rollback()

    return jsonify(resp_data), code

@app.route('/api/reset', methods=['POST'])
def reset_logs():
    """Wipes everything and broadcasts a 0-state stats update."""
    db.session.query(LoginAttempt).delete(); db.session.query(SecurityAlert).delete()
    db.session.query(BlockedIP).delete(); db.session.query(NetworkPacket).delete()
    db.session.query(TerminalLog).delete(); db.session.commit()
    
    socketio.emit('dashboard_reset')
    socketio.emit('stats_update', get_live_stats())
    return jsonify({'msg': 'Success'}), 200

@app.route('/api/stats', methods=['GET'])
def get_stats(): 
    return jsonify(get_live_stats())

@app.route('/api/logs', methods=['GET'])
def get_logs():
    logs = LoginAttempt.query.order_by(LoginAttempt.created_at.desc()).limit(100).all()
    return jsonify([{'id': l.id, 'timestamp': l.created_at.strftime('%H:%M:%S'), 'username': l.username, 'password': l.password_tested, 'ip': l.ip_address, 'status': l.status, 'detection': l.detection_level} for l in logs])

@app.route('/api/packets', methods=['GET'])
def get_packets():
    pkts = NetworkPacket.query.order_by(NetworkPacket.id.desc()).limit(200).all()
    return jsonify([{"no": p.packet_no, "time": p.time, "source": p.source, "destination": p.destination, "protocol": p.protocol, "length": p.length, "info": p.info} for p in reversed(pkts)]), 200

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
