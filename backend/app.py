from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
import logging
from logging.handlers import RotatingFileHandler

# Load DB utilities and models
from utils.db import db, init_db
from models.user import User
from models.vault import Vault


def setup_logging(app):
    """
    Configure application logging
    Logs are written to instance/app.log
    """
    os.makedirs('instance', exist_ok=True)

    file_handler = RotatingFileHandler(
        'instance/app.log',
        maxBytes=10240,
        backupCount=10
    )
    
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s '
        '[in %(pathname)s:%(lineno)d]'
    ))

    if not any(isinstance(h, RotatingFileHandler) for h in app.logger.handlers):
        app.logger.addHandler(file_handler)

    app.logger.setLevel(logging.INFO)
    app.logger.info('Application startup')


def create_app(config_class_name=None):
    load_dotenv()
    
    app = Flask(__name__)
    setup_logging(app)
    CORS(app)

    # Configuration loading
    if config_class_name == 'ProductionConfig':
        from config import ProductionConfig
        app.config.from_object(ProductionConfig)
        app.logger.info('Production environment configured successfully with production database variables.')
    else:
        basedir = os.path.abspath(os.path.dirname(__file__))
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "instance", "database.db")}'
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret')

    # Initialize extensions
    jwt = JWTManager(app)
    init_db(app)

    with app.app_context():
        db.create_all()
        app.logger.info('Database tables verified/created successfully.')

    from routes.auth import auth_bp
    from routes.vault import vault_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(vault_bp, url_prefix='/api')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='127.0.0.1', port=5001, debug=True)