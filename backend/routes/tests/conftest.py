import pytest
from app import create_app
from utils.db import db
from flask_jwt_extended import create_access_token

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:", # Use in-memory DB for speed
        "JWT_SECRET_KEY": "test-secret"
    })

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers(app):
    """Helper to generate a valid JWT header for a test user."""
    with app.app_context():
        # Identity '1' matches our database user_id
        token = create_access_token(identity="1")
        return {"Authorization": f"Bearer {token}"}