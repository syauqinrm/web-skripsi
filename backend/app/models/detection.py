from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from ..config.database import db

class Detection(db.Model):
    __tablename__ = 'detections'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    original_path = db.Column(db.String(500), nullable=False)
    result_path = db.Column(db.String(500), nullable=True)
    detections_count = db.Column(db.Integer, default=0)
    confidence_scores = db.Column(db.JSON, nullable=True)
    detection_classes = db.Column(db.JSON, nullable=True)
    processing_time = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(50), default='uploaded')  # uploaded, processing, completed, failed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'original_path': self.original_path,
            'result_path': self.result_path,
            'detections_count': self.detections_count,
            'confidence_scores': self.confidence_scores,
            'detection_classes': self.detection_classes,
            'processing_time': self.processing_time,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }