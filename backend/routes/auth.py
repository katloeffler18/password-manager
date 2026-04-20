from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from utils.db import db
from utils.auth import hash_password, verify_password
from models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'User already exists'}), 400

    new_user = User(email=data.get('email'), password_hash=hash_password(data.get('password')))
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user and verify_password(data.get('password'), user.password_hash):
        token = create_access_token(identity=str(user.id))
        return jsonify({'token': token}), 200
    return jsonify({'error': 'Invalid credentials'}), 401
