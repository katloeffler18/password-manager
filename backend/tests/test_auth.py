import requests

BASE_URL = "http://localhost:5001"

def test_backend_online():
    endpoint = f"{BASE_URL}/api/auth"
    response = requests.get(endpoint)

    assert response.status_code == 200
    assert response.json()["status"] == "online"

"""
def test_valid_register():
    # We don't have a way to delete users yet so the database must be cleared 
    # before running this test
    endpoint = f"{BASE_URL}/api/auth/register"
    payload = {"email": "test_user@gmail.com", "password": "testpassword"}

    response = requests.post(endpoint, json=payload)

    assert response.status_code == 201
    assert response.json()["message"] == "User registered"
"""
    
def test_invalid_json_register():
    endpoint = f"{BASE_URL}/api/auth/register"
    payload = {"email": "test_user@gmail.com"}

    response = requests.post(endpoint, json=payload)

    assert response.status_code == 400
    assert response.json()["error"] == "Email and password required"

    payload = {"password": "testpassword"}
    response = requests.post(endpoint, json=payload)

    assert response.status_code == 400
    assert response.json()["error"] == "Email and password required"

    payload = {}
    response = requests.post(endpoint, json=payload)

    assert response.status_code == 400
    assert response.json()["error"] == "Email and password required"

def test_invalid_user_register():
    endpoint = f"{BASE_URL}/api/auth/register"
    payload = {"email": "test_user@gmail.com", "password": "testpassword"}

    # Registers the user
    requests.post(endpoint, json=payload)

    # Tries to register the same user
    response = requests.post(endpoint, json=payload)

    assert response.status_code == 400
    assert response.json()["error"] == "User already exists"

def test_protected_routes():
    # These tests test the protected endpoints without a JWT
    endpoint = f"{BASE_URL}/api"

    response = requests.get(f"{endpoint}/vault")
    assert response.status_code == 401
    assert response.json()["msg"] == "Missing Authorization Header"

    response = requests.post(f"{endpoint}/save", json={})
    assert response.status_code == 401
    assert response.json()["msg"] == "Missing Authorization Header"

    response = requests.delete(f"{endpoint}/delete/1", json={})
    assert response.status_code == 401
    assert response.json()["msg"] == "Missing Authorization Header"

    response = requests.put(f"{endpoint}/update/1", json={})
    assert response.status_code == 401
    assert response.json()["msg"] == "Missing Authorization Header"