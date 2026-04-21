from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

# Load DB utilities and models
from utils.db import db, init_db
from models.user import User
from models.vault import Vault

def create_app():
    load_dotenv()
    
    app = Flask(__name__)
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
    # Make sure that the instance folder exists
    if not os.path.exists('instance'):
        os.makedirs('instance')
    
    app.run(host='127.0.0.1', port=5001, debug=True)
