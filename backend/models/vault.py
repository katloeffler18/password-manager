from utils.db import db
from datetime import datetime

class Vault(db.Model):
    __tablename__ = 'vault'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100))
    encrypted_data = db.Column(db.Text, nullable=False)
    iv = db.Column(db.String(64), nullable=False)

    salt = db.Column(db.String(64), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
