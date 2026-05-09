from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError

from utils.db import db
from models.vault import Vault

vault_bp = Blueprint('vault', __name__)

# Validation Helpers
def validate_title(title):
    if not isinstance(title, str):
        return None, 'Title must be a string'

    title = title.strip()

    if not title:
        return None, 'Title cannot be empty'

    if len(title) > 100:
        return None, 'Title must be under 100 characters'

    return title, None


def validate_payload(payload):
    if not isinstance(payload, str):
        return None, 'Encrypted payload must be a string'

    if not payload:
        return None, 'Encrypted payload cannot be empty'

    # Prevents over sized database payloads
    if len(payload) > 65535:
        return None, 'Encrypted data payload is too large'

    return payload, None


def validate_iv(iv):
    if not isinstance(iv, str):
        return None, 'IV must be a string'

    if not iv:
        return None, 'IV cannot be empty'

    # Prevent abnormally large IVs
    if len(iv) > 256:
        return None, 'Invalid IV length'

    return iv, None


def validate_salt(salt):
    # Salt is optional
    if salt is None:
        return None, None

    if not isinstance(salt, str):
        return None, 'Salt must be a string'

    if len(salt) > 256:
        return None, 'Invalid salt length'

    return salt, None


# Save
@vault_bp.route('/save', methods=['POST'])
@jwt_required()
def save_password():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    # Validate JSON body
    if not data:
        return jsonify({
            'error': 'Invalid or missing JSON body'
        }), 400

    # Required fields
    required_fields = ('title', 'data', 'iv')

    if not all(field in data for field in required_fields):
        return jsonify({
            'error': 'Missing required fields: title, data, or iv'
        }), 400

    # Validate title
    title, err = validate_title(data.get('title'))
    if err:
        return jsonify({'error': err}), 400

    # Validate encrypted payload
    payload, err = validate_payload(data.get('data'))
    if err:
        return jsonify({'error': err}), 400

    # Validate IV
    iv, err = validate_iv(data.get('iv'))
    if err:
        return jsonify({'error': err}), 400

    # Validate salt
    salt, err = validate_salt(data.get('salt'))
    if err:
        return jsonify({'error': err}), 400

    try:
        new_item = Vault(
            user_id=user_id,
            title=title,
            encrypted_data=payload,
            iv=iv,
            salt=salt
        )

        db.session.add(new_item)
        db.session.commit()

        current_app.logger.info(
            f'User {user_id} saved vault item {new_item.id}'
        )

        return jsonify({
            'message': 'Saved successfully',
            'id': new_item.id
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()

        current_app.logger.exception(
            f'Database error during save: {str(e)}'
        )

        return jsonify({
            'error': 'Internal server error saving to vault'
        }), 500

    except Exception as e:
        db.session.rollback()

        current_app.logger.exception(
            f'Unexpected error during save: {str(e)}'
        )

        return jsonify({
            'error': 'Internal server error'
        }), 500


# Get Vault
@vault_bp.route('/vault', methods=['GET'])
@jwt_required()
def get_vault():
    user_id = int(get_jwt_identity())

    # Data isolation; users can only access their own vault items
    items = Vault.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            'id': item.id,
            'title': item.title,
            'data': item.encrypted_data,
            'iv': item.iv,
            'salt': item.salt,
            'updated_at': (
                item.updated_at.isoformat()
                if item.updated_at else None
            )
        }
        for item in items
    ]), 200


# Update
@vault_bp.route('/update/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_password(item_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()

    # Validate JSON body
    if not data:
        return jsonify({
            'error': 'Invalid or missing JSON body'
        }), 400

    # IDOR prevention:
    # ensures vault item belongs to authenticated user
    item = Vault.query.filter_by(
        id=item_id,
        user_id=user_id
    ).first()

    if not item:
        return jsonify({
            'error': 'Vault item not found'
        }), 404

    # Validate title
    if 'title' in data:
        value, err = validate_title(data.get('title'))

        if err:
            return jsonify({'error': err}), 400

        item.title = value

    # Validate encrypted payload
    if 'data' in data:
        value, err = validate_payload(data.get('data'))

        if err:
            return jsonify({'error': err}), 400

        item.encrypted_data = value

    # Validate IV
    if 'iv' in data:
        value, err = validate_iv(data.get('iv'))

        if err:
            return jsonify({'error': err}), 400

        item.iv = value

    # Validate salt
    if 'salt' in data:
        value, err = validate_salt(data.get('salt'))

        if err:
            return jsonify({'error': err}), 400

        item.salt = value

    try:
        db.session.commit()

        current_app.logger.info(
            f'User {user_id} updated vault item {item_id}'
        )

        return jsonify({
            'message': 'Updated successfully'
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()

        current_app.logger.exception(
            f'Database error during update: {str(e)}'
        )

        return jsonify({
            'error': 'Failed to update vault item'
        }), 500

    except Exception as e:
        db.session.rollback()

        current_app.logger.exception(
            f'Unexpected error during update: {str(e)}'
        )

        return jsonify({
            'error': 'Internal server error'
        }), 500


# Delete
@vault_bp.route('/delete/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_password(item_id):
    user_id = int(get_jwt_identity())

    # IDOR prevention: ensures user can only delete their own stuff
    item = Vault.query.filter_by(
        id=item_id,
        user_id=user_id
    ).first()

    if not item:
        return jsonify({
            'error': 'Vault item not found'
        }), 404

    try:
        db.session.delete(item)
        db.session.commit()

        current_app.logger.info(
            f'User {user_id} deleted vault item {item_id}'
        )

        return jsonify({
            'message': 'Deleted successfully'
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()

        current_app.logger.exception(
            f'Database error during delete: {str(e)}'
        )

        return jsonify({
            'error': 'Failed to delete vault item'
        }), 500

    except Exception as e:
        db.session.rollback()

        current_app.logger.exception(
            f'Unexpected error during delete: {str(e)}'
        )

        return jsonify({
            'error': 'Internal server error'
        }), 500