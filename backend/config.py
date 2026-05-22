import os
import socket
from urllib.parse import urlparse, urlunparse

def force_ipv4_url(url_string):
    """
    Parses the database URL, forces DNS resolution to an IPv4 address,
    and returns a rebuilt URL string to bypass Render's IPv6 routing traps.
    """
    if not url_string:
        return url_string
        
    try:
        # Normalize postgres:// to postgresql:// for SQLAlchemy compatibility
        if url_string.startswith("postgres://"):
            url_string = url_string.replace("postgres://", "postgresql://", 1)

        parsed = urlparse(url_string)
        hostname = parsed.hostname
        
        # Explicitly query only for IPv4 network addresses
        addr_info = socket.getaddrinfo(hostname, parsed.port, socket.AF_INET, socket.SOCK_STREAM)
        ipv4_address = addr_info[0][4][0]
        
        # Reconstruct the connection string using the explicit IP address
        auth_part = f"{parsed.username}:{parsed.password}" if parsed.password else parsed.username
        new_netloc = f"{auth_part}@{ipv4_address}:{parsed.port}"
        
        rebuilt_url = urlunparse((
            parsed.scheme,
            new_netloc,
            parsed.path,
            parsed.params,
            parsed.query,
            parsed.fragment
        ))
        return rebuilt_url
    except Exception as e:
        # Fallback to the original connection string if DNS parsing encounters an issue
        print(f"----> Production DNS fallback triggered: {e}")
        return url_string


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-dev-key')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'default-jwt-key')


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    
    # Intercept and convert the environment string directly on configuration load
    raw_db_url = os.environ.get('SUPABASE_DIRECT_URL')
    SQLALCHEMY_DATABASE_URI = force_ipv4_url(raw_db_url)


class DevelopmentConfig(Config):
    DEBUG = True
    DEVELOPMENT = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///dev.db')