from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "This is MY Flask server"

@app.route("/api/test")
def test():
    return jsonify({"message": "Hello from Flask!"})

if __name__ == "__main__":
    print("Starting Flask app on port 5050...")
    app.run(debug=True, port=5050)