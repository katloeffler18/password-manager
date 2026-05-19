import pytest
from models.vault import Vault
from utils.db import db

def test_data_isolation_idor(client, app, auth_headers):
    """
    AUDIT: Verify User A cannot delete User B's data.
    """
    with app.app_context():
        # Create an item belonging to User 99 (The "Victim")
        victim_item = Vault(user_id=99, title="Secret", encrypted_data="abc", iv="123")
        db.session.add(victim_item)
        db.session.commit()
        victim_id = victim_item.id

    # Try to delete victim_id while logged in as User 1
    response = client.delete(f'/api/delete/{victim_id}', headers=auth_headers)
    
    # Assertions
    assert response.status_code == 404
    assert b'Vault item not found' in response.data
    
    # Verify it still exists in the DB
    with app.app_context():
        assert Vault.query.get(victim_id) is not None

def test_input_validation_payload_size(client, auth_headers):
    """
    AUDIT: Verify length constraints on encrypted data.
    """
    huge_data = "a" * 70000 # Larger than your 65535 limit
    payload = {"title": "Test", "data": huge_data, "iv": "123"}
    
    response = client.post('/api/save', json=payload, headers=auth_headers)
    
    assert response.status_code == 400
    assert b'too large' in response.data

def test_type_strictness(client, auth_headers):
    """
    AUDIT: Verify title must be a string (no type confusion).
    """
    payload = {"title": 12345, "data": "abc", "iv": "123"}
    
    response = client.post('/api/save', json=payload, headers=auth_headers)
    
    assert response.status_code == 400
    assert b'must be a string' in response.data

def test_logging_on_save(client, auth_headers, caplog):
    """
    AUDIT: Verify centralized logging records actions.
    """
    payload = {"title": "LoggerTest", "data": "abc", "iv": "123"}
    
    with caplog.at_level("INFO"):
        client.post('/api/save', json=payload, headers=auth_headers)
        
    assert "saved vault item" in caplog.text

def test_successful_save_and_retrieve(client, auth_headers, app):
    """
    AUDIT: Verify the full pipeline from JWT String ID to Integer DB ID works.
    """
    payload = {"title": "Success", "data": "encrypted-stuff", "iv": "iv-goes-here"}
    
    # 1. Save the item
    save_response = client.post('/api/save', json=payload, headers=auth_headers)
    assert save_response.status_code == 201
    
    # 2. Retrieve the vault
    get_response = client.get('/api/vault', headers=auth_headers)
    assert get_response.status_code == 200
    data = get_response.get_json()
    
    # Verify the item belongs to User 1
    assert len(data) == 1
    assert data[0]['title'] == "Success"