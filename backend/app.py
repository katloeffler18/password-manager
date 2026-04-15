from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allows React to talk to Flask

@app.route("/")
def home():
    return jsonify({"message": "Backend is running"})

@app.route("/api/test")
def test():
    return jsonify({"message": "Hello from Flask!"})

if __name__ == "__main__":
    app.run(debug=True)