
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'cyber-soc-ultra-secure-secret-key-6a2f9b8c3d1e4f5a')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///soc_dashboard.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {"timeout": 15},
    }
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-super-long-and-secure-secret-key-9b8c7d6e5f4a3b2c1')
    CORS_HEADERS = 'Content-Type'
