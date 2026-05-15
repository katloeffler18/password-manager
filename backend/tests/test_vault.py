import requests

BASE_URL = "http://localhost:5001"


def test_valid_save(auth_token):
    endpoint = f"{BASE_URL}/api/save"

    headers = {"Authorization": f"Bearer {auth_token}"}
    payload = {"title": "My Title", "data": "encrypted_stuff_here", "iv": "random_iv_string"}

    response = requests.post(endpoint, headers=headers, json=payload)

    assert response.status_code == 201
    assert response.json()["message"] == "Saved successfully"

def test_invalid_save(auth_token):
    endpoint = f"{BASE_URL}/api/save"

    headers = {"Authorization": f"Bearer {auth_token}"}

    payload = {"title": "", "data": "encrypted_stuff_here", "iv": "random_iv_string"}
    response = requests.post(endpoint, headers=headers, json=payload)
    assert response.status_code == 400
    assert response.json()["error"] == "Title cannot be empty"

    payload = {"title": "My Title", "data": "encrypted_stuff_here"}
    response = requests.post(endpoint, headers=headers, json=payload)
    assert response.status_code == 400
    assert response.json()["error"] == "Missing required fields: title, data, or iv"

    payload = {"title": "My Title", "iv": "random_iv_string"}
    response = requests.post(endpoint, headers=headers, json=payload)
    assert response.status_code == 400
    assert response.json()["error"] == "Missing required fields: title, data, or iv"

    payload = {"data": "encrypted_stuff_here", "iv": "random_iv_string"}
    response = requests.post(endpoint, headers=headers, json=payload)
    assert response.status_code == 400
    assert response.json()["error"] == "Missing required fields: title, data, or iv"

    payload = {}
    response = requests.post(endpoint, headers=headers, json=payload)
    assert response.status_code == 400
    assert response.json()["error"] == "Missing required fields: title, data, or iv"

def test_valid_get(auth_token):
    endpoint = f"{BASE_URL}/api/vault"

    headers = {"Authorization": f"Bearer {auth_token}"}
    response = requests.get(endpoint, headers=headers)

    assert response.status_code == 200
    assert response.json()[0]["data"] == "encrypted_stuff_here"
    assert response.json()[0]["title"] == "My Title"

def test_valid_update(auth_token):
    get_endpoint = f"{BASE_URL}/api/vault"
    update_endpoint = f"{BASE_URL}/api/update"
    headers = {"Authorization": f"Bearer {auth_token}"}

    response = requests.get(get_endpoint, headers=headers)
    id_to_update = response.json()[0]["id"]

    payload = {"title": "New Title"}
    response = requests.put(f"{update_endpoint}/{id_to_update}", headers=headers, json=payload)

    assert response.status_code == 200
    assert response.json()["message"] == "Updated successfully"

    # Test that the update actually updated the database
    response = requests.get(get_endpoint, headers=headers)
    assert response.json()[0]["title"] == "New Title"

def test_invalid_update(auth_token):
    get_endpoint = f"{BASE_URL}/api/vault"
    update_endpoint = f"{BASE_URL}/api/update"
    headers = {"Authorization": f"Bearer {auth_token}"}

    response = requests.get(get_endpoint, headers=headers)
    id_to_update = response.json()[0]["id"]

    # Tests empty payload
    payload = {}
    response = requests.put(f"{update_endpoint}/{id_to_update}", headers=headers, json=payload)
    assert response.status_code == 200
    assert response.json()["message"] == "Updated successfully"
    # Test that the update did not update the database
    response = requests.get(get_endpoint, headers=headers)
    assert response.json()[0]["title"] == "New Title"

    # Tries to update an item id that does not exist
    response = requests.put(f"{update_endpoint}/{id_to_update + 1}", headers=headers, json=payload)
    assert response.status_code == 404

def test_valid_delete(auth_token):
    get_endpoint = f"{BASE_URL}/api/vault"
    delete_endpoint = f"{BASE_URL}/api/delete"
    headers = {"Authorization": f"Bearer {auth_token}"}

    response = requests.get(get_endpoint, headers=headers)

    id_to_delete = response.json()[0]["id"]
    response = requests.delete(f"{delete_endpoint}/{id_to_delete}", headers=headers)

    assert response.status_code == 200
    assert response.json()["message"] == "Deleted successfully"

def test_invalid_delete(auth_token):
    endpoint = f"{BASE_URL}/api/delete"
    headers = {"Authorization": f"Bearer {auth_token}"}

    # Try to delete item id that does not exist
    response = requests.delete(f"{endpoint}/1", headers=headers)
    assert response.status_code == 404
