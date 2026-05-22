import os
from datetime import timedelta

class ProductionConfig:
    # 1. Secured fallbacks using hex strings instead of raw path bytes
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secure-production-fallback-key-123'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'super-secure-jwt-production-fallback-key-123'
    
    # 2. Extract and safely normalize the database string for SQLAlchemy
    raw_db_url = os.environ.get('DATABASE_URL')
    if raw_db_url and raw_db_url.startswith("postgres://"):
        raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)
        
    # 3. Fall back safely to a local disk production database if cloud database URL isn't injected
    SQLALCHEMY_DATABASE_URI = raw_db_url or 'sqlite:///' + os.path.join(
        os.path.abspath(os.path.dirname(__file__)), 'instance', 'prod_vault.sqlite'
    )
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)