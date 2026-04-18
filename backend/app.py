from flask import Flask, jsonify, redirect
from flask_cors import CORS
from flask_login import LoginManager, login_required, login_user, logout_user
from user import User

app = Flask(__name__)
CORS(app)
app.secret_key = b'This is the secret key'

# Setup flask_login
login_manager = LoginManager(app)
login_manager.init_app(app)
login_manager.login_view = "login"

# Loads the current user from the client's cookies
@login_manager.user_loader
def load_user(user_id):
    # Get user properties from the db and update the User object
    # return User.get(user_id)
    pass

@app.route("/")
def home():
    return "This is MY Flask server"

@app.route("/dashboard")
@login_required
def dashboard():
    return "This is the dashboard"

@app.route("/login")
def login():
    # Need a form to get username and password from client
    # login_user(user_object)
    return "This is the login page"

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect('/')

@app.route("/api/test")
def test():
    return jsonify({"message": "Hello from Flask!"})

if __name__ == "__main__":
    print("Starting Flask app on port 5050...")
    app.run(debug=True, port=5050)