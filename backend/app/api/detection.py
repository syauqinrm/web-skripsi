import os
import time
from flask import Blueprint, jsonify, current_app, send_file, request
from ..config.database import db
from ..models.detection import Detection
from ..utils.yolo_detector import YOLODetector

detection_bp = Blueprint('detection', __name__)

# Initialize YOLO detector globally
model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'best.pt')
detector = YOLODetector(model_path)

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