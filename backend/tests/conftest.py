import pytest
import requests

@pytest.fixture
def auth_token():
    register_data = {"email" : "test_user@gmail.com", "password": "testpassword"}
    login_data = {"email" : "test_user@gmail.com", "otp" : "123456"}

    # Create user in case it does not exist yet
    requests.post("http://localhost:5001/api/auth/register", json=register_data)

    # Gets token for user
    response = requests.post("http://localhost:5001/api/auth/verify-otp", json=login_data)

    return response.json()["token"]