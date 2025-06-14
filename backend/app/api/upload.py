import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from ..config.database import db
from ..models.detection import Detection

upload_bp = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/upload', methods=['POST'])
def upload_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload PNG, JPG, JPEG, GIF, BMP, or WEBP files.'}), 400
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Save file
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Save to database
        detection = Detection(
            filename=unique_filename,
            original_path=file_path,
            status='uploaded'
        )
        db.session.add(detection)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'File uploaded successfully',
            'detection': detection.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@upload_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Upload service is running'
    }), 200