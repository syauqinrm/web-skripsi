from pathlib import Path
import cv2
import numpy as np
from ultralytics import YOLO
import os

class YOLODetector:
    def __init__(self, model_path=None):
        """
        Initialize YOLO detector with your trained model
        Args:
            model_path: Path to your trained model (best.pt)
        """
        self.model_path = model_path
        self.model = None
        self.is_model_loaded = False
        
        # Load model
        self._load_model()
        
        # Define class names for coffee roasting levels (adjust based on your training)
        self.class_names = {
            0: 'green_bean',
            1: 'light_roast', 
            2: 'medium_roast',
            3: 'dark_roast'
        }
        
        # Define colors for each class (BGR format for OpenCV)
        self.class_colors = {
            'green_bean': (0, 255, 0),      # Green
            'light_roast': (0, 165, 255),   # Orange
            'medium_roast': (0, 0, 255),    # Red
            'dark_roast': (128, 0, 128)     # Purple
        }
        
    def _load_model(self):
        """Load the YOLO model"""
        try:
            if self.model_path and os.path.exists(self.model_path):
                print(f"Loading trained model from: {self.model_path}")
                self.model = YOLO(self.model_path)
                self.is_model_loaded = True
                print("✓ Trained model loaded successfully!")
                
                # Print model info
                print(f"Model classes: {self.model.names}")
                
            else:
                print(f"Model file not found at: {self.model_path}")
                print("Using YOLOv8n as fallback...")
                self.model = YOLO('yolov8n.pt')
                self.is_model_loaded = True
                
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Model loading failed, will use placeholder detection")
            self.model = None
            self.is_model_loaded = False
        
    def detect(self, image_path):
        """
        Perform detection on image
        Args:
            image_path: Path to input image
        Returns:
            dict: Detection results
        """
        try:
            if self.is_model_loaded and self.model:
                return self._detect_with_model(image_path)
            else:
                return self._placeholder_detection(image_path)
                
        except Exception as e:
            raise Exception(f"Detection failed: {str(e)}")
    
    def _detect_with_model(self, image_path):
        """Real YOLO detection with trained model"""
        # Run inference
        results = self.model(image_path, conf=0.5, iou=0.45)
        
        detections = []
        confidence_scores = []
        classes = []
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    # Get box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = float(box.conf[0].cpu().numpy())
                    class_id = int(box.cls[0].cpu().numpy())
                    
                    # Get class name
                    if hasattr(self.model, 'names') and class_id in self.model.names:
                        class_name = self.model.names[class_id]
                    else:
                        class_name = self.class_names.get(class_id, f'class_{class_id}')
                    
                    detections.append({
                        'class': class_name,
                        'confidence': confidence,
                        'bbox': [int(x1), int(y1), int(x2), int(y2)]
                    })
                    
                    confidence_scores.append(confidence)
                    classes.append(class_name)
        
        return {
            'detections': detections,
            'confidence_scores': confidence_scores,
            'classes': classes,
            'total_detections': len(detections)
        }
    
    def _placeholder_detection(self, image_path):
        """Placeholder detection for testing when model is not available"""
        # Load image to get dimensions
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError("Could not load image")
        
        h, w = image.shape[:2]
        
        # Generate random detections for testing
        import random
        
        detections = []
        confidence_scores = []
        classes = []
        
        # Generate 1-4 random detections
        num_detections = random.randint(1, 4)
        
        for i in range(num_detections):
            class_name = random.choice(list(self.class_names.values()))
            confidence = random.uniform(0.7, 0.95)
            
            # Random bounding box
            x1 = random.randint(0, w//2)
            y1 = random.randint(0, h//2)
            x2 = x1 + random.randint(50, min(200, w-x1))
            y2 = y1 + random.randint(50, min(200, h-y1))
            
            detections.append({
                'class': class_name,
                'confidence': confidence,
                'bbox': [x1, y1, x2, y2]
            })
            
            confidence_scores.append(confidence)
            classes.append(class_name)
        
        return {
            'detections': detections,
            'confidence_scores': confidence_scores,
            'classes': classes,
            'total_detections': len(detections)
        }
    
    def save_results(self, input_path, output_path, results):
        """
        Save detection results as annotated image
        Args:
            input_path: Path to input image
            output_path: Path to save annotated image
            results: Detection results from detect()
        """
        try:
            # Load original image
            image = cv2.imread(input_path)
            if image is None:
                raise ValueError("Could not load input image")
            
            # Draw detections
            for detection in results['detections']:
                class_name = detection['class']
                confidence = detection['confidence']
                x1, y1, x2, y2 = detection['bbox']
                
                # Get color for class
                color = self.class_colors.get(class_name, (255, 255, 255))
                
                # Draw bounding box
                cv2.rectangle(image, (x1, y1), (x2, y2), color, 3)
                
                # Draw label
                label = f"{class_name}: {confidence:.2f}"
                label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
                
                # Draw label background
                cv2.rectangle(image, (x1, y1 - label_size[1] - 15), 
                            (x1 + label_size[0] + 10, y1), color, -1)
                
                # Draw label text
                cv2.putText(image, label, (x1 + 5, y1 - 5), 
                          cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            # Add detection count
            detection_text = f"Total Detections: {results['total_detections']}"
            cv2.putText(image, detection_text, (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            # Save annotated image
            cv2.imwrite(output_path, image)
            print(f"✓ Results saved to: {output_path}")
            
        except Exception as e:
            raise Exception(f"Could not save results: {str(e)}")