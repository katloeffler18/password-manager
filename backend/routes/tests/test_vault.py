def test_valid_save(client, auth_headers):
    payload = {"title": "My Title", "data": "encrypted_stuff_here", "iv": "random_iv_string"}

    response = client.post("/api/save", headers=auth_headers, json=payload)

    assert response.status_code == 201
    assert b'Saved successfully' in response.data

def test_invalid_save(client, auth_headers):
    payload = {"title": "", "data": "encrypted_stuff_here", "iv": "random_iv_string"}
    response = client.post("/api/save", headers=auth_headers, json=payload)
    assert response.status_code == 400
    assert b'Title cannot be empty' in response.data

    payload = {"title": "My Title", "data": "encrypted_stuff_here"}
    response = client.post("/api/save", headers=auth_headers, json=payload)
    assert response.status_code == 400
    assert b'Missing required fields: title, data, or iv' in response.data

    payload = {"title": "My Title", "iv": "random_iv_string"}
    response = client.post("/api/save", headers=auth_headers, json=payload)
    assert response.status_code == 400
    assert b'Missing required fields: title, data, or iv' in response.data

    payload = {"data": "encrypted_stuff_here", "iv": "random_iv_string"}
    response = client.post("/api/save", headers=auth_headers, json=payload)
    assert response.status_code == 400
    assert b'Missing required fields: title, data, or iv' in response.data

    payload = {}
    response = client.post("/api/save", headers=auth_headers, json=payload)
    assert response.status_code == 400
    assert b'Invalid or missing JSON body' in response.data

def test_valid_get(client, auth_headers):
    payload = {"title": "My Title", "data": "encrypted_stuff_here", "iv": "random_iv_string"}
    client.post("/api/save", headers=auth_headers, json=payload)

    response = client.get("/api/vault", headers=auth_headers)

    assert response.status_code == 200
    assert b'encrypted_stuff_here' in response.data
    assert b'My Title' in response.data

def test_valid_update(client, auth_headers):
    # Load data into the database
    payload = {"title": "My Title", "data": "encrypted_stuff_here", "iv": "random_iv_string"}
    client.post("/api/save", headers=auth_headers, json=payload)

    payload = {"title": "New Title"}
    response = client.put("/api/update/1", headers=auth_headers, json=payload)
    assert response.status_code == 200
    assert b'Updated successfully' in response.data

    # Test that the update actually updated the database
    response = client.get("/api/vault", headers=auth_headers)
    assert b'New Title' in response.data

def test_invalid_update(client, auth_headers):
    # Load data into the database
    payload = {"title": "My Title", "data": "encrypted_stuff_here", "iv": "random_iv_string"}
    client.post("/api/save", headers=auth_headers, json=payload)

    # Tests empty payload
    payload = {}
    response = client.put("/api/update/1", headers=auth_headers, json=payload)
    assert response.status_code == 400
    assert b'Invalid or missing JSON body' in response.data
    # Test that the update did not update the database
    response = client.get("/api/vault", headers=auth_headers)
    assert b'My Title' in response.data

    # Tries to update an item id that does not exist
    payload = {"title": "New Title"}
    response = client.put("/api/update/2", headers=auth_headers, json=payload)
    assert response.status_code == 404

def test_valid_delete(client, auth_headers):
    # Load data into the database
    payload = {"title": "My Title", "data": "encrypted_stuff_here", "iv": "random_iv_string"}
    client.post("/api/save", headers=auth_headers, json=payload)

    response = client.delete("/api/delete/1", headers=auth_headers)

    assert response.status_code == 200
    assert b'Deleted successfully' in response.data

def test_invalid_delete(client, auth_headers):
    # Try to delete item id that does not exist
    response = client.delete("/api/delete/1", headers=auth_headers)
    assert response.status_code == 404