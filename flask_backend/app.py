from flask import Flask, request, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/')
def index():
    return "Hello, World!" 

@app.route('/upload', methods=['POST'])
def upload_image():
    data = request.json
    if "image" in data:
        image_data = data["image"]
        # Process or save the image data here
        print("Received image data:", image_data)  # Print a snippet for verification
        return jsonify({"message": "Image received successfully"})
    else:
        return jsonify({"error": "No image data found"}), 400

if __name__ == "__main__":
    app.run(debug=True, port=5000)
