from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.db import db
from models.vault import Vault

vault_bp = Blueprint('vault', __name__)

@vault_bp.route('/save', methods=['POST'])
@jwt_required()
def save_password():
    user_id = get_jwt_identity()
    data = request.get_json()

    required_fields = ("title", "data", "iv")
    if not data or not all(k in data for k in required_fields):
        return jsonify({'error': 'Missing required fields: title, data, or iv'}), 400

    if not str(data.get('title')).strip():
        return jsonify({'error': 'Title cannot be empty'}), 400

    # I modified this so that the salt is optional now.
    new_item = Vault(
        user_id=user_id, 
        title=data.get('title'), 
        encrypted_data=data.get('data'), 
        iv=data.get('iv'),
        salt=data.get('salt') 
    )
    
    db.session.add(new_item)
    db.session.commit()
    return jsonify({'message': 'Saved successfully'}), 201

@vault_bp.route('/vault', methods=['GET'])
@jwt_required()
def get_vault():
    user_id = get_jwt_identity()
    items = Vault.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        'id': i.id, 
        'title': i.title, 
        'data': i.encrypted_data, 
        'iv': i.iv,
        'salt': i.salt
    } for i in items]), 200

@vault_bp.route('/update/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_password(item_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    
    item = Vault.query.filter_by(id=item_id, user_id=user_id).first_or_404()

    if 'title' in data:
        item.title = data.get('title')
    if 'data' in data:
        item.encrypted_data = data.get('data')
    if 'iv' in data:
        item.iv = data.get('iv')
    if 'salt' in data:
        item.salt = data.get('salt')

    db.session.commit()
    return jsonify({'message': 'Updated successfully'}), 200

@vault_bp.route('/delete/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_password(item_id):
    user_id = get_jwt_identity()
    # makes sure that a user can only delete their own stuff
    item = Vault.query.filter_by(id=item_id, user_id=user_id).first_or_404()
    
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Deleted successfully'}), 200
