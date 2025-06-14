from flask import Flask
from flask_cors import CORS
from .config.database import configure_database
import os

def create_app():
    app = Flask(__name__)
    
    # Configure CORS for React frontend
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
    
    # Configure upload folders
    app.config['UPLOAD_FOLDER'] = os.path.join(app.instance_path, 'static', 'uploads')
    app.config['RESULTS_FOLDER'] = os.path.join(app.instance_path, 'static', 'results')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    
    # Ensure directories exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['RESULTS_FOLDER'], exist_ok=True)
    
    # Configure database
    configure_database(app)
    
    # Register blueprints
    from .api.upload import upload_bp
    from .api.detection import detection_bp
    
    app.register_blueprint(upload_bp, url_prefix='/api')
    app.register_blueprint(detection_bp, url_prefix='/api')
    
    return app