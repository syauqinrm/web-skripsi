import os
import time
import cv2
import numpy as np
from flask import Blueprint, jsonify, current_app, send_file, request
from PIL import Image
import io
import base64
from datetime import datetime
from ..config.database import db
from ..models.detection import Detection
from ..utils.yolo_detector import YOLODetector

detection_bp = Blueprint('detection', __name__)

# Initialize YOLO detector globally
model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'best.pt')
detector = YOLODetector(model_path)

# Global variable to store latest detection results for live stream
latest_detection_results = {
    'timestamp': 0,
    'detections': [],
    'processed_image': None,
    'object_count': 0,
    'raw_image': None  # Store raw image for capture
}

@detection_bp.route('/live-stream', methods=['POST'])
def detect_live_stream():
    """Handle live stream detection from Raspberry Pi"""
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image file provided'}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No image file selected'}), 400

        # Read image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert PIL image to OpenCV format
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Perform detection
        start_time = time.time()
        results = detector.detect_image(image)
        processing_time = time.time() - start_time
        
        # Draw bounding boxes on image
        annotated_image = cv_image.copy()
        detection_count = 0
        
        for detection in results.get('detections', []):
            x, y, w, h = int(detection['x']), int(detection['y']), int(detection['width']), int(detection['height'])
            label = detection['label']
            confidence = detection['confidence']
            
            # Draw bounding box
            cv2.rectangle(annotated_image, (x, y), (x + w, y + h), (0, 255, 0), 2)
            
            # Draw label
            label_text = f"{label}: {confidence:.2f}"
            label_size = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)[0]
            cv2.rectangle(annotated_image, (x, y - label_size[1] - 10), 
                         (x + label_size[0], y), (0, 255, 0), -1)
            cv2.putText(annotated_image, label_text, (x, y - 5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)
            
            detection_count += 1
        
        # Update global detection results
        global latest_detection_results
        latest_detection_results = {
            'timestamp': time.time(),
            'detections': results.get('detections', []),
            'processed_image': annotated_image,
            'raw_image': cv_image,  # Store raw image for capture
            'object_count': detection_count,
            'processing_time': processing_time
        }
        
        # Convert annotated image to base64 for response
        _, buffer = cv2.imencode('.jpg', annotated_image)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            'success': True,
            'detections': results.get('detections', []),
            'object_count': detection_count,
            'processing_time': processing_time,
            'annotated_image': img_base64,
            'timestamp': time.time()
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': f'Detection failed: {str(e)}'}), 500

@detection_bp.route('/capture/live-stream', methods=['POST'])
def capture_live_stream():
    """Capture and save current live stream frame with detections"""
    try:
        global latest_detection_results
        
        if latest_detection_results['timestamp'] == 0:
            return jsonify({
                'success': False,
                'error': 'No live stream data available'
            }), 400
        
        # Get the latest processed image with bounding boxes
        processed_image = latest_detection_results['processed_image']
        raw_image = latest_detection_results['raw_image']
        detections = latest_detection_results['detections']
        
        if processed_image is None or raw_image is None:
            return jsonify({
                'success': False,
                'error': 'No image data available for capture'
            }), 400
        
        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        original_filename = f"raspi_capture_{timestamp}.jpg"
        result_filename = f"raspi_capture_{timestamp}_result.jpg"
        
        # Save paths
        original_path = os.path.join(current_app.config['UPLOAD_FOLDER'], original_filename)
        result_path = os.path.join(current_app.config['RESULTS_FOLDER'], result_filename)
        
        # Ensure directories exist
        os.makedirs(os.path.dirname(original_path), exist_ok=True)
        os.makedirs(os.path.dirname(result_path), exist_ok=True)
        
        # Save original image
        cv2.imwrite(original_path, raw_image)
        
        # Save processed image with bounding boxes
        cv2.imwrite(result_path, processed_image)
        
        # Create detection record in database
        detection_record = Detection(
            filename=original_filename,
            original_path=original_path,
            result_path=result_path,
            detections_count=len(detections),
            confidence_scores=[det['confidence'] for det in detections],
            detection_classes=[det['label'] for det in detections],
            processing_time=latest_detection_results.get('processing_time', 0),
            status='completed'
        )
        
        db.session.add(detection_record)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Live stream frame captured and saved successfully',
            'detection_id': detection_record.id,
            'detections_count': len(detections),
            'detections': detections,
            'original_path': original_path,
            'result_path': result_path,
            'timestamp': latest_detection_results['timestamp']
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Capture failed: {str(e)}'
        }), 500

@detection_bp.route('/capture/raspi-direct', methods=['POST'])
def capture_raspi_direct():
    """Capture image directly from Raspberry Pi and process it"""
    try:
        # Get Raspberry Pi IP from request
        data = request.get_json()
        raspi_ip = data.get('raspi_ip', '172.20.10.2')  # Default Raspberry Pi IP
        
        # Fetch current frame directly from Raspberry Pi
        import requests
        
        # Get single frame from Raspberry Pi
        capture_url = f"http://{raspi_ip}/capture-frame"
        
        try:
            response = requests.get(capture_url, timeout=10)
            if response.status_code == 200:
                # Process the captured image
                image_bytes = response.content
                image = Image.open(io.BytesIO(image_bytes))
                
                # Convert to OpenCV format
                cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
                
                # Perform detection
                start_time = time.time()
                results = detector.detect_image(image)
                processing_time = time.time() - start_time
                
                # Draw bounding boxes
                annotated_image = cv_image.copy()
                detection_count = 0
                
                for detection in results.get('detections', []):
                    x, y, w, h = int(detection['x']), int(detection['y']), int(detection['width']), int(detection['height'])
                    label = detection['label']
                    confidence = detection['confidence']
                    
                    # Draw bounding box
                    cv2.rectangle(annotated_image, (x, y), (x + w, y + h), (0, 255, 0), 2)
                    
                    # Draw label
                    label_text = f"{label}: {confidence:.2f}"
                    label_size = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)[0]
                    cv2.rectangle(annotated_image, (x, y - label_size[1] - 10), 
                                 (x + label_size[0], y), (0, 255, 0), -1)
                    cv2.putText(annotated_image, label_text, (x, y - 5), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)
                    
                    detection_count += 1
                
                # Save images
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                original_filename = f"raspi_direct_{timestamp}.jpg"
                result_filename = f"raspi_direct_{timestamp}_result.jpg"
                
                original_path = os.path.join(current_app.config['UPLOAD_FOLDER'], original_filename)
                result_path = os.path.join(current_app.config['RESULTS_FOLDER'], result_filename)
                
                os.makedirs(os.path.dirname(original_path), exist_ok=True)
                os.makedirs(os.path.dirname(result_path), exist_ok=True)
                
                cv2.imwrite(original_path, cv_image)
                cv2.imwrite(result_path, annotated_image)
                
                # Save to database
                detection_record = Detection(
                    filename=original_filename,
                    original_path=original_path,
                    result_path=result_path,
                    detections_count=detection_count,
                    confidence_scores=[det['confidence'] for det in results.get('detections', [])],
                    detection_classes=[det['label'] for det in results.get('detections', [])],
                    processing_time=processing_time,
                    status='completed'
                )
                
                db.session.add(detection_record)
                db.session.commit()
                
                return jsonify({
                    'success': True,
                    'message': 'Raspberry Pi frame captured and processed successfully',
                    'detection_id': detection_record.id,
                    'detections_count': detection_count,
                    'detections': results.get('detections', []),
                    'processing_time': processing_time
                }), 200
                
            else:
                return jsonify({
                    'success': False,
                    'error': f'Failed to capture from Raspberry Pi: {response.status_code}'
                }), 400
                
        except requests.exceptions.RequestException as e:
            return jsonify({
                'success': False,
                'error': f'Raspberry Pi connection failed: {str(e)}'
            }), 500
            
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Direct capture failed: {str(e)}'
        }), 500

@detection_bp.route('/live-stream/latest', methods=['GET'])
def get_latest_detection():
    """Get latest detection results for live stream"""
    try:
        global latest_detection_results
        
        if latest_detection_results['timestamp'] == 0:
            return jsonify({
                'success': False,
                'message': 'No detection results available'
            }), 404
        
        # Convert processed image to base64 if available
        img_base64 = None
        if latest_detection_results['processed_image'] is not None:
            _, buffer = cv2.imencode('.jpg', latest_detection_results['processed_image'])
            img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            'success': True,
            'timestamp': latest_detection_results['timestamp'],
            'detections': latest_detection_results['detections'],
            'object_count': latest_detection_results['object_count'],
            'annotated_image': img_base64
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'Failed to get latest detection: {str(e)}'}), 500

@detection_bp.route('/live-stream/processed-image', methods=['GET'])
def get_processed_image():
    """Get the latest processed image with bounding boxes"""
    try:
        global latest_detection_results
        
        if latest_detection_results['processed_image'] is None:
            return jsonify({'error': 'No processed image available'}), 404
        
        # Convert OpenCV image to bytes
        _, buffer = cv2.imencode('.jpg', latest_detection_results['processed_image'])
        image_bytes = io.BytesIO(buffer.tobytes())
        image_bytes.seek(0)
        
        return send_file(image_bytes, mimetype='image/jpeg')
        
    except Exception as e:
        return jsonify({'error': f'Failed to get processed image: {str(e)}'}), 500

@detection_bp.route('/detect/<int:detection_id>', methods=['POST'])
def detect_objects(detection_id):
    try:
        detection = Detection.query.get_or_404(detection_id)
        
        if detection.status == 'processing':
            return jsonify({'error': 'Detection already in progress'}), 409
        
        # Update status to processing
        detection.status = 'processing'
        db.session.commit()
        
        # Perform detection
        start_time = time.time()
        results = detector.detect(detection.original_path)
        processing_time = time.time() - start_time
        
        # Generate result filename
        result_filename = f"result_{detection_id}_{int(time.time())}.jpg"
        result_path = os.path.join(current_app.config['RESULTS_FOLDER'], result_filename)
        
        # Save annotated image
        detector.save_results(detection.original_path, result_path, results)
        
        # Update detection record
        detection.result_path = result_path
        detection.detections_count = len(results.get('detections', []))
        detection.confidence_scores = results.get('confidence_scores', [])
        detection.detection_classes = results.get('classes', [])
        detection.processing_time = processing_time
        detection.status = 'completed'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Detection completed successfully',
            'detection': detection.to_dict(),
            'results': results
        }), 200
        
    except Exception as e:
        # Update status to failed
        if 'detection' in locals():
            detection.status = 'failed'
            db.session.commit()
        
        return jsonify({'error': f'Detection failed: {str(e)}'}), 500

@detection_bp.route('/detections', methods=['GET'])
def get_detections():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        detections = Detection.query.order_by(Detection.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'detections': [d.to_dict() for d in detections.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': detections.total,
                'pages': detections.pages
            }
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch detections: {str(e)}'}), 500

@detection_bp.route('/detection/<int:detection_id>', methods=['GET'])
def get_detection(detection_id):
    try:
        detection = Detection.query.get_or_404(detection_id)
        return jsonify({
            'success': True,
            'detection': detection.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch detection: {str(e)}'}), 500

@detection_bp.route('/detection/<int:detection_id>/image', methods=['GET'])
def get_original_image(detection_id):
    try:
        detection = Detection.query.get_or_404(detection_id)
        return send_file(detection.original_path)
    except Exception as e:
        return jsonify({'error': f'Image not found: {str(e)}'}), 404

@detection_bp.route('/detection/<int:detection_id>/result', methods=['GET'])
def get_result_image(detection_id):
    try:
        detection = Detection.query.get_or_404(detection_id)
        if not detection.result_path or not os.path.exists(detection.result_path):
            return jsonify({'error': 'Result image not available'}), 404
        return send_file(detection.result_path)
    except Exception as e:
        return jsonify({'error': f'Result image not found: {str(e)}'}), 404

@detection_bp.route('/stats', methods=['GET'])
def get_detection_stats():
    try:
        total_detections = Detection.query.count()
        completed_detections = Detection.query.filter_by(status='completed').count()
        
        # Get class distribution
        completed_records = Detection.query.filter_by(status='completed').all()
        class_counts = {}
        
        for record in completed_records:
            if record.detection_classes:
                for cls in record.detection_classes:
                    class_counts[cls] = class_counts.get(cls, 0) + 1
        
        return jsonify({
            'success': True,
            'stats': {
                'total_detections': total_detections,
                'completed_detections': completed_detections,
                'class_distribution': class_counts,
                'success_rate': (completed_detections / total_detections * 100) if total_detections > 0 else 0
            }
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch stats: {str(e)}'}), 500
    
@detection_bp.route('/detect/frame', methods=['POST'])
def detect_from_frame():
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image file provided'}), 400

        file = request.files['image']
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))

        # Run detection using YOLO
        results = detector.detect_image(image)

        # Format bounding box response
        response_boxes = []
        for box in results.get('detections', []):
            response_boxes.append({
                'x': int(box['x']),
                'y': int(box['y']),
                'width': int(box['width']),
                'height': int(box['height']),
                'label': box['label'],
                'score': float(box['confidence']),
            })

        return jsonify({
            'success': True,
            'boxes': response_boxes
        }, 200)

    except Exception as e:
        return jsonify({'success': False, 'error': f'Detection failed: {str(e)}'}, 500)

@detection_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Raspberry Pi"""
    return jsonify({
        'status': 'healthy',
        'message': 'Detection service is running',
        'timestamp': time.time()
    }), 200