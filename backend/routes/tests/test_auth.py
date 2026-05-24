def test_valid_register(client):
    payload = {"email": "test_user@gmail.com", "password": "testpassword"}
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    print(response.data)
    assert b'User registered' in response.data
    
def test_invalid_json_register(client):
    payload = {"email": "test_user@gmail.com"}
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert b'Email and password required' in response.data

    payload = {"password": "testpassword"}
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert b'Email and password required' in response.data

    payload = {}
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert b'Email and password required' in response.data

def test_invalid_user_register(client):
    payload = {"email": "test_user@gmail.com", "password": "testpassword"}

    # Registers the user
    client.post("/api/auth/register", json=payload)

    # Tries to register the same user
    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == 400
    assert b'User already exists' in response.data

def test_protected_routes(client):
    # These tests test the protected endpoints without a JWT
    response = client.get("/api/vault")
    assert response.status_code == 401
    assert b'Missing Authorization Header' in response.data

    response = client.post("/api/save", json={})
    assert response.status_code == 401
    assert b'Missing Authorization Header' in response.data

    response = client.delete("/api/delete/1", json={})
    assert response.status_code == 401
    assert b'Missing Authorization Header' in response.data

    response = client.put("/api/update/1", json={})
    assert response.status_code == 401
    assert b'Missing Authorization Header' in response.data