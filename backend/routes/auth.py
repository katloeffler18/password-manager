from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from utils.db import db
from utils.auth import hash_password, verify_password
from models.user import User
import pyotp
import smtplib
from email.message import EmailMessage
import os

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

    new_user = User(email=data.get('email'), password_hash=hash_password(data.get('password')), otp_secret=pyotp.random_base32())
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    user = User.query.filter_by(email=email).first()
    if user and verify_password(data.get('password'), user.password_hash):
        # Generate OTP
        totp = pyotp.TOTP(user.otp_secret, interval=600)
        curr_otp = totp.now()

        # Setup email server
        email_server = smtplib.SMTP("smtp.gmail.com", 587)
        email_server.starttls()
        from_email = os.getenv("EMAIL_USERNAME")
        email_password = os.getenv("EMAIL_PASSWORD")
        email_server.login(from_email, email_password)

        # Setup and send email
        msg = EmailMessage()
        msg["Subject"] = "OTP CODE"
        msg["From"] = from_email
        msg["To"] = email
        msg.set_content("Your OTP is " + curr_otp + ". It will expire in 10 minutes.")
        email_server.send_message(msg)

        return jsonify({'message': 'OTP sent'}), 200

    return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    otp = data.get('otp')
    user = User.query.filter_by(email=data.get('email')).first()

    totp = pyotp.TOTP(user.otp_secret, interval=600)
    if totp.verify(otp):
        token = create_access_token(identity=str(user.id))
        return jsonify({'token': token}), 200
    return jsonify({'error': 'Invalid OTP'}), 401

@auth_bp.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "online",
        "message": "Backend is communicating with Frontend!"
    }), 200
