from flask import Flask
from app.config.database import db
from app.api.detection import detection_bp
from app.api.upload import upload_bp
import os
from dotenv import load_dotenv
from app import create_app
from flask_cors import CORS

load_dotenv()

app = create_app()
CORS(app)

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    app.register_blueprint(detection_bp, url_prefix='/api/detection')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')

    return app

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create database tables if they don't exist
        print("Database tables created successfully!")
    
    print("Starting Flask server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)