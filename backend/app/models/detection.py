from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pytz
from ..config.database import db

# Tentukan timezone Jakarta
jakarta_tz = pytz.timezone('Asia/Jakarta')

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
    capture_method = db.Column(db.String(50), default='upload')  # New field
    esp32_ip = db.Column(db.String(50), nullable=True)  # New field
    created_at = db.Column(db.DateTime, default=lambda: datetime.utcnow().replace(tzinfo=pytz.utc))  # Set to UTC explicitly
    updated_at = db.Column(db.DateTime, default=lambda: datetime.utcnow().replace(tzinfo=pytz.utc), onupdate=datetime.utcnow)

    def to_dict(self):
        # Mengonversi waktu ke Jakarta Timezone
        created_at_jakarta = self.created_at.astimezone(jakarta_tz) if self.created_at else None
        updated_at_jakarta = self.updated_at.astimezone(jakarta_tz) if self.updated_at else None

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
            'capture_method': self.capture_method,
            'esp32_ip': self.esp32_ip,
            # Menggunakan strftime untuk format 24 jam
            'created_at': created_at_jakarta.strftime('%Y-%m-%d %H:%M:%S') if created_at_jakarta else None,
            'updated_at': updated_at_jakarta.strftime('%Y-%m-%d %H:%M:%S') if updated_at_jakarta else None
        }
