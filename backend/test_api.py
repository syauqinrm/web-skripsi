import requests
import json

# Base URL
BASE_URL = "http://localhost:5000/api"

def test_upload():
    """Test file upload"""
    print("Testing file upload...")
    
    # You can test with any image file
    test_image_path = "/home/sneeha/Downloads/Images/Light/light_primer (2).jpg"  # Change this to actual image path
    
    try:
        with open(test_image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post(f"{BASE_URL}/upload", files=files)
            
        print(f"Upload Response: {response.status_code}")
        print(f"Response Data: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            return response.json()['detection']['id']
            
    except FileNotFoundError:
        print("Test image not found. Please update test_image_path in test_api.py")
    except Exception as e:
        print(f"Upload test failed: {e}")
    
    return None

def test_detection(detection_id):
    """Test object detection"""
    print(f"\nTesting detection for ID: {detection_id}")
    
    try:
        response = requests.post(f"{BASE_URL}/detect/{detection_id}")
        print(f"Detection Response: {response.status_code}")
        print(f"Response Data: {json.dumps(response.json(), indent=2)}")
        
    except Exception as e:
        print(f"Detection test failed: {e}")

def test_get_detections():
    """Test get all detections"""
    print("\nTesting get all detections...")
    
    try:
        response = requests.get(f"{BASE_URL}/detections")
        print(f"Get Detections Response: {response.status_code}")
        data = response.json()
        print(f"Total detections: {len(data.get('detections', []))}")
        
    except Exception as e:
        print(f"Get detections test failed: {e}")

def test_stats():
    """Test get statistics"""
    print("\nTesting get statistics...")
    
    try:
        response = requests.get(f"{BASE_URL}/stats")
        print(f"Stats Response: {response.status_code}")
        print(f"Response Data: {json.dumps(response.json(), indent=2)}")
        
    except Exception as e:
        print(f"Stats test failed: {e}")

if __name__ == "__main__":
    # Run tests
    detection_id = test_upload()
    
    if detection_id:
        test_detection(detection_id)
    
    test_get_detections()
    test_stats()