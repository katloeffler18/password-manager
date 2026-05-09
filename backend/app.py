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
    Logs are written to instace/app.log
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


def create_app():
    load_dotenv()
    
    app = Flask(__name__)

    # set up logging
    setup_logging(app)

    CORS(app)

    # Configuration
    # Use an absolute path for the instance folder to avoid Folder Not Found errors
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "instance", "database.db")}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret')

    # Initialize extensions
    jwt = JWTManager(app)
    init_db(app)

    # Register blueprints inside the function to prevent import problems
    from routes.auth import auth_bp
    from routes.vault import vault_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(vault_bp, url_prefix='/api')

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)
