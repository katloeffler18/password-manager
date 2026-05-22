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
    # makes sure that instance folder exists
    os.makedirs('instance', exist_ok=True)

    # creates formatter
    formatter = logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s '
        '[in %(pathname)s:%(lineno)d]'
    )

    # creates rotating file handler
    file_handler = RotatingFileHandler(
        'instance/app.log',
        maxBytes=10240,
        backupCount=10
    )
    
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)

    # prevents duplicate handlers in debug mode
    if not any(isinstance(h, RotatingFileHandler) for h in app.logger.handlers):
        app.logger.addHandler(file_handler)

    app.logger.setLevel(logging.INFO)
    app.logger.info('Application startup')


def create_app(config_class_name=None):
    load_dotenv()
    
    app = Flask(__name__)

    # Set up logging
    setup_logging(app)

    CORS(app)

    # DYNAMIC CONFIGURATION LOADER
    if config_class_name == 'ProductionConfig':
        # Load the production definitions we customized in config.py
        from config import ProductionConfig
        app.config.from_object(ProductionConfig)
    else:
        # Fallback to standard local development variables
        basedir = os.path.abspath(os.path.dirname(__file__))
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "instance", "database.db")}'
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret')

    # Initialize extensions
    jwt = JWTManager(app)
    init_db(app)

    # OPTION 2: AUTOMATIC TABLE CREATION
    # This automatically syncs missing structural tables in SQLite or Supabase Postgres on boot
    with app.app_context():
        db.create_all()
        app.logger.info('Database tables verified/created successfully.')

    # Register blueprints inside the function to prevent import problems
    from routes.auth import auth_bp
    from routes.vault import vault_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(vault_bp, url_prefix='/api')

    return app


# This conditional block isolates execution environments.
# When running locally using `python app.py`, it boots dev mode.
# When running on Render via Gunicorn, Gunicorn ignores this block and routes through wsgi.py instead.
if __name__ == '__main__':
    app = create_app()
    app.run(host='127.0.0.1', port=5001, debug=True)