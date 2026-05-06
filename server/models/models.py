from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), default='user')
    def set_password(self, password): self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    def check_password(self, password): return bcrypt.check_password_hash(self.password_hash, password)

class LoginAttempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80))
    password_tested = db.Column(db.String(80))
    ip_address = db.Column(db.String(45))
    country = db.Column(db.String(100))
    status = db.Column(db.String(20))
    detection_level = db.Column(db.String(20))
    user_agent = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class TerminalLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    line = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class NetworkPacket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    packet_no = db.Column(db.Integer)
    time = db.Column(db.String(20))
    source = db.Column(db.String(45))
    destination = db.Column(db.String(45))
    protocol = db.Column(db.String(10))
    length = db.Column(db.Integer)
    info = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class BlockedIP(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45), unique=True)
    reason = db.Column(db.String(255))
    blocked_at = db.Column(db.DateTime, default=datetime.utcnow)
    blocked_until = db.Column(db.DateTime)

class SecurityAlert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    severity = db.Column(db.String(20))
    message = db.Column(db.String(255))
    ip_address = db.Column(db.String(45))
    is_resolved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
