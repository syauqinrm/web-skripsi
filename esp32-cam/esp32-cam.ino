/*********
  ESP32-CAM for Coffee Bean Detection System
  Modified for live stream detection with Flask backend
*********/

#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include "esp_timer.h"
#include "img_converters.h"
#include "Arduino.h"
#include "fb_gfx.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include "esp_http_server.h"
#include <ArduinoJson.h>

// 👈 WiFi credentials
const char* ssid = "syauqinrm";
const char* password = "BEBANgaji";

// 👈 Backend Flask server configuration
const char* backend_host = "172.20.10.14";
const int backend_port = 5000;

#define PART_BOUNDARY "123456789000000000000987654321"
#define CAMERA_MODEL_AI_THINKER

// 👈 Pin configuration
#if defined(CAMERA_MODEL_AI_THINKER)
  #define PWDN_GPIO_NUM     32
  #define RESET_GPIO_NUM    -1
  #define XCLK_GPIO_NUM      0
  #define SIOD_GPIO_NUM     26
  #define SIOC_GPIO_NUM     27
  
  #define Y9_GPIO_NUM       35
  #define Y8_GPIO_NUM       34
  #define Y7_GPIO_NUM       39
  #define Y6_GPIO_NUM       36
  #define Y5_GPIO_NUM       21
  #define Y4_GPIO_NUM       19
  #define Y3_GPIO_NUM       18
  #define Y2_GPIO_NUM        5
  #define VSYNC_GPIO_NUM    25
  #define HREF_GPIO_NUM     23
  #define PCLK_GPIO_NUM     22
#else
  #error "Camera model not selected"
#endif

static const char* _STREAM_CONTENT_TYPE = "multipart/x-mixed-replace;boundary=" PART_BOUNDARY;
static const char* _STREAM_BOUNDARY = "\r\n--" PART_BOUNDARY "\r\n";
static const char* _STREAM_PART = "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n";

httpd_handle_t camera_httpd = NULL;
httpd_handle_t stream_httpd = NULL;

// 👈 Global variables for detection
bool detection_enabled = false;
unsigned long last_detection_time = 0;
const unsigned long detection_interval = 2000; // 2 seconds between detections

// 👈 NEW: Send frame to backend for detection
bool sendFrameToBackend(camera_fb_t* fb) {
    if (!fb || !detection_enabled) return false;
    
    HTTPClient http;
    String backend_url = "http://" + String(backend_host) + ":" + String(backend_port) + "/api/detect/live-stream";
    
    http.begin(backend_url);
    http.addHeader("Content-Type", "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW");
    
    // Create multipart form data
    String boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
    String multipart = "--" + boundary + "\r\n";
    multipart += "Content-Disposition: form-data; name=\"image\"; filename=\"frame.jpg\"\r\n";
    multipart += "Content-Type: image/jpeg\r\n\r\n";
    
    // Send the multipart header
    uint8_t* buffer = (uint8_t*)malloc(multipart.length() + fb->len + 50);
    if (!buffer) {
        http.end();
        return false;
    }
    
    memcpy(buffer, multipart.c_str(), multipart.length());
    memcpy(buffer + multipart.length(), fb->buf, fb->len);
    
    String footer = "\r\n--" + boundary + "--\r\n";
    memcpy(buffer + multipart.length() + fb->len, footer.c_str(), footer.length());
    
    int total_length = multipart.length() + fb->len + footer.length();
    
    int httpResponseCode = http.POST(buffer, total_length);
    free(buffer);
    
    if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("Backend response: %d, %s\n", httpResponseCode, response.c_str());
        http.end();
        return true;
    } else {
        Serial.printf("Backend connection failed: %d\n", httpResponseCode);
        http.end();
        return false;
    }
}

// 👈 Enhanced HTML interface
static const char PROGMEM INDEX_HTML[] = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
    <title>ESP32-CAM Coffee Bean Detection</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { 
            font-family: Arial; 
            text-align: center; 
            margin: 0px auto; 
            padding: 20px;
            background-color: #f0f4f8;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #73946B; }
        .stream-container {
            margin: 20px 0;
            border: 2px solid #ddd;
            border-radius: 10px;
            overflow: hidden;
            position: relative;
        }
        .detection-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10;
        }
        img { 
            width: 100%; 
            height: auto; 
            display: block;
        }
        .controls {
            margin: 20px 0;
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        .button {
            background-color: #73946B;
            border: none;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 5px;
            transition: background-color 0.3s;
        }
        .button:hover {
            background-color: #5a7554;
        }
        .button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        .button.active {
            background-color: #4CAF50;
        }
        .status {
            margin: 20px 0;
            padding: 10px;
            border-radius: 5px;
            font-weight: bold;
        }
        .status.connected {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status.disconnected {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .info {
            text-align: left;
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
        }
        .detection-info {
            background-color: #e8f5e8;
            border: 1px solid #4CAF50;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌱 ESP32-CAM Coffee Bean Detection</h1>
        
        <div class="status" id="status">
            <span id="statusText">Initializing...</span>
        </div>
        
        <div class="stream-container">
            <img src="" id="stream" alt="Camera Stream">
            <div class="detection-overlay" id="detectionOverlay"></div>
        </div>
        
        <div class="controls">
            <button class="button" onclick="startStream()">📹 Start Stream</button>
            <button class="button" onclick="stopStream()">⏹️ Stop Stream</button>
            <button class="button" id="detectionBtn" onclick="toggleDetection()">🔍 Start Detection</button>
            <button class="button" onclick="capturePhoto()">📸 Capture & Save</button>
            <button class="button" onclick="testBackend()">🔗 Test Backend</button>
        </div>
        
        <div class="detection-info" id="detectionInfo" style="display: none;">
            <h4>🎯 Live Detection Status</h4>
            <p>Detection Mode: <span id="detectionMode">Disabled</span></p>
            <p>Last Detection: <span id="lastDetection">None</span></p>
            <p>Objects Found: <span id="objectCount">0</span></p>
        </div>
        
        <div class="info">
            <h3>📊 System Information</h3>
            <p><strong>ESP32-CAM IP:</strong> <span id="esp32IP"></span></p>
            <p><strong>Backend Server:</strong> http://172.20.10.14:5000</p>
            <p><strong>Stream URL:</strong> http://<span id="streamUrl"></span>:81/stream</p>
            <p><strong>Detection URL:</strong> http://<span id="detectionUrl"></span>:81/detected-stream</p>
            <p><strong>Status:</strong> <span id="connectionStatus">Checking...</span></p>
        </div>
    </div>

    <script>
        const streamImg = document.getElementById('stream');
        const statusDiv = document.getElementById('status');
        const statusText = document.getElementById('statusText');
        const esp32IP = document.getElementById('esp32IP');
        const streamUrl = document.getElementById('streamUrl');
        const detectionUrl = document.getElementById('detectionUrl');
        const connectionStatus = document.getElementById('connectionStatus');
        const detectionBtn = document.getElementById('detectionBtn');
        const detectionInfo = document.getElementById('detectionInfo');
        const detectionMode = document.getElementById('detectionMode');
        const lastDetection = document.getElementById('lastDetection');
        const objectCount = document.getElementById('objectCount');
        
        let isDetectionEnabled = false;
        let detectionInterval;
        
        // Set ESP32 IP
        const currentIP = window.location.hostname;
        esp32IP.textContent = currentIP;
        streamUrl.textContent = currentIP;
        detectionUrl.textContent = currentIP;
        
        function updateStatus(message, isConnected) {
            statusText.textContent = message;
            statusDiv.className = isConnected ? 'status connected' : 'status disconnected';
        }
        
        function startStream() {
            const url = `http://${currentIP}:81/stream`;
            streamImg.src = url;
            updateStatus('📹 Stream Active', true);
        }
        
        function stopStream() {
            streamImg.src = '';
            updateStatus('⏹️ Stream Stopped', false);
            if (isDetectionEnabled) {
                toggleDetection();
            }
        }
        
        function toggleDetection() {
            if (!isDetectionEnabled) {
                // Start detection
                fetch('/enable-detection', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            isDetectionEnabled = true;
                            detectionBtn.textContent = '🛑 Stop Detection';
                            detectionBtn.classList.add('active');
                            detectionInfo.style.display = 'block';
                            detectionMode.textContent = 'Enabled';
                            updateStatus('🔍 Detection Mode Active', true);
                            
                            // Switch to detection stream
                            streamImg.src = `http://${currentIP}:81/detected-stream`;
                        }
                    })
                    .catch(error => {
                        console.error('Error enabling detection:', error);
                        updateStatus('❌ Failed to enable detection', false);
                    });
            } else {
                // Stop detection
                fetch('/disable-detection', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            isDetectionEnabled = false;
                            detectionBtn.textContent = '🔍 Start Detection';
                            detectionBtn.classList.remove('active');
                            detectionInfo.style.display = 'none';
                            detectionMode.textContent = 'Disabled';
                            updateStatus('📹 Normal Stream Mode', true);
                            
                            // Switch back to normal stream
                            streamImg.src = `http://${currentIP}:81/stream`;
                        }
                    })
                    .catch(error => {
                        console.error('Error disabling detection:', error);
                    });
            }
        }
        
        async function capturePhoto() {
            try {
                updateStatus('📸 Capturing photo...', true);
                const response = await fetch('/capture');
                const result = await response.json();
                
                if (result.success) {
                    updateStatus(`✅ Photo captured! Detections: ${result.detections || 0}`, true);
                } else {
                    updateStatus('❌ Capture failed', false);
                }
            } catch (error) {
                updateStatus('❌ Capture error', false);
                console.error('Capture error:', error);
            }
        }
        
        async function testBackend() {
            try {
                updateStatus('🔗 Testing backend connection...', true);
                const response = await fetch('/test-backend');
                const result = await response.json();
                
                if (result.success) {
                    updateStatus('✅ Backend connected successfully', true);
                    connectionStatus.textContent = 'Connected';
                } else {
                    updateStatus('❌ Backend connection failed', false);
                    connectionStatus.textContent = 'Disconnected';
                }
            } catch (error) {
                updateStatus('❌ Backend test failed', false);
                connectionStatus.textContent = 'Error';
                console.error('Backend test error:', error);
            }
        }
        
        // Auto-start stream when page loads
        window.onload = function() {
            startStream();
            testBackend();
        };
        
        // Update detection info periodically
        setInterval(() => {
            if (isDetectionEnabled) {
                fetch('/detection-status')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            lastDetection.textContent = data.last_detection || 'None';
                            objectCount.textContent = data.object_count || 0;
                        }
                    })
                    .catch(error => console.error('Error fetching detection status:', error));
            }
        }, 3000);
    </script>
</body>
</html>
)rawliteral";

// 👈 Stream handler for normal stream
static esp_err_t stream_handler(httpd_req_t *req) {
    camera_fb_t * fb = NULL;
    esp_err_t res = ESP_OK;
    size_t _jpg_buf_len = 0;
    uint8_t * _jpg_buf = NULL;
    char * part_buf[64];

    res = httpd_resp_set_type(req, _STREAM_CONTENT_TYPE);
    if(res != ESP_OK) {
        return res;
    }

    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");

    while(true) {
        fb = esp_camera_fb_get();
        if (!fb) {
            Serial.println("Camera capture failed");
            res = ESP_FAIL;
        } else {
            if(fb->width > 100) {
                if(fb->format != PIXFORMAT_JPEG) {
                    bool jpeg_converted = frame2jpg(fb, 80, &_jpg_buf, &_jpg_buf_len);
                    esp_camera_fb_return(fb);
                    fb = NULL;
                    if(!jpeg_converted) {
                        Serial.println("JPEG compression failed");
                        res = ESP_FAIL;
                    }
                } else {
                    _jpg_buf_len = fb->len;
                    _jpg_buf = fb->buf;
                }
            }
        }
        
        if(res == ESP_OK) {
            res = httpd_resp_send_chunk(req, _STREAM_BOUNDARY, strlen(_STREAM_BOUNDARY));
        }
        if(res == ESP_OK) {
            size_t hlen = snprintf((char *)part_buf, 64, _STREAM_PART, _jpg_buf_len);
            res = httpd_resp_send_chunk(req, (const char *)part_buf, hlen);
        }
        if(res == ESP_OK) {
            res = httpd_resp_send_chunk(req, (const char *)_jpg_buf, _jpg_buf_len);
        }
        
        if(fb) {
            esp_camera_fb_return(fb);
            fb = NULL;
            _jpg_buf = NULL;
        } else if(_jpg_buf) {
            free(_jpg_buf);
            _jpg_buf = NULL;
        }
        
        if(res != ESP_OK) {
            break;
        }
        
        delay(50);
    }
    
    return res;
}

// 👈 NEW: Detection stream handler
static esp_err_t detected_stream_handler(httpd_req_t *req) {
    camera_fb_t * fb = NULL;
    esp_err_t res = ESP_OK;
    size_t _jpg_buf_len = 0;
    uint8_t * _jpg_buf = NULL;
    char * part_buf[64];

    res = httpd_resp_set_type(req, _STREAM_CONTENT_TYPE);
    if(res != ESP_OK) {
        return res;
    }

    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");

    while(true) {
        fb = esp_camera_fb_get();
        if (!fb) {
            Serial.println("Camera capture failed");
            res = ESP_FAIL;
        } else {
            // Send frame to backend for detection if enabled
            if (detection_enabled && (millis() - last_detection_time > detection_interval)) {
                sendFrameToBackend(fb);
                last_detection_time = millis();
            }
            
            if(fb->width > 100) {
                if(fb->format != PIXFORMAT_JPEG) {
                    bool jpeg_converted = frame2jpg(fb, 80, &_jpg_buf, &_jpg_buf_len);
                    esp_camera_fb_return(fb);
                    fb = NULL;
                    if(!jpeg_converted) {
                        Serial.println("JPEG compression failed");
                        res = ESP_FAIL;
                    }
                } else {
                    _jpg_buf_len = fb->len;
                    _jpg_buf = fb->buf;
                }
            }
        }
        
        if(res == ESP_OK) {
            res = httpd_resp_send_chunk(req, _STREAM_BOUNDARY, strlen(_STREAM_BOUNDARY));
        }
        if(res == ESP_OK) {
            size_t hlen = snprintf((char *)part_buf, 64, _STREAM_PART, _jpg_buf_len);
            res = httpd_resp_send_chunk(req, (const char *)part_buf, hlen);
        }
        if(res == ESP_OK) {
            res = httpd_resp_send_chunk(req, (const char *)_jpg_buf, _jpg_buf_len);
        }
        
        if(fb) {
            esp_camera_fb_return(fb);
            fb = NULL;
            _jpg_buf = NULL;
        } else if(_jpg_buf) {
            free(_jpg_buf);
            _jpg_buf = NULL;
        }
        
        if(res != ESP_OK) {
            break;
        }
        
        delay(100); // Slightly slower for detection mode
    }
    
    return res;
}

// 👈 NEW: Enable detection handler
static esp_err_t enable_detection_handler(httpd_req_t *req) {
    httpd_resp_set_type(req, "application/json");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    
    detection_enabled = true;
    const char* resp = "{\"success\":true,\"message\":\"Detection enabled\"}";
    httpd_resp_send(req, resp, strlen(resp));
    
    Serial.println("Detection mode enabled");
    return ESP_OK;
}

// 👈 NEW: Disable detection handler
static esp_err_t disable_detection_handler(httpd_req_t *req) {
    httpd_resp_set_type(req, "application/json");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    
    detection_enabled = false;
    const char* resp = "{\"success\":true,\"message\":\"Detection disabled\"}";
    httpd_resp_send(req, resp, strlen(resp));
    
    Serial.println("Detection mode disabled");
    return ESP_OK;
}

// 👈 NEW: Detection status handler
static esp_err_t detection_status_handler(httpd_req_t *req) {
    httpd_resp_set_type(req, "application/json");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    
    StaticJsonDocument<200> doc;
    doc["success"] = true;
    doc["detection_enabled"] = detection_enabled;
    doc["last_detection"] = "Recent";
    doc["object_count"] = 0; // This would be updated by backend
    
    String response;
    serializeJson(doc, response);
    
    httpd_resp_send(req, response.c_str(), response.length());
    return ESP_OK;
}

// 👈 Other handlers (index, capture, test_backend, status, cmd) remain the same...
static esp_err_t index_handler(httpd_req_t *req) {
    httpd_resp_set_type(req, "text/html");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    return httpd_resp_send(req, (const char *)INDEX_HTML, strlen(INDEX_HTML));
}

static esp_err_t capture_handler(httpd_req_t *req) {
    camera_fb_t * fb = NULL;
    esp_err_t res = ESP_OK;
    
    httpd_resp_set_type(req, "application/json");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    
    fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("Camera capture failed");
        httpd_resp_send(req, "{\"success\":false,\"error\":\"Camera capture failed\"}", -1);
        return ESP_FAIL;
    }
    
    Serial.printf("Captured image: %dx%d, %d bytes\n", fb->width, fb->height, fb->len);
    
    // Send to backend for detection and storage
    bool backend_success = sendFrameToBackend(fb);
    esp_camera_fb_return(fb);
    
    if (backend_success) {
        const char* resp = "{\"success\":true,\"message\":\"Photo captured and sent to backend\",\"detections\":0}";
        httpd_resp_send(req, resp, strlen(resp));
    } else {
        const char* resp = "{\"success\":false,\"message\":\"Photo captured but backend failed\",\"detections\":0}";
        httpd_resp_send(req, resp, strlen(resp));
    }
    
    return ESP_OK;
}

static esp_err_t test_backend_handler(httpd_req_t *req) {
    httpd_resp_set_type(req, "application/json");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    
    HTTPClient http;
    String backend_url = "http://" + String(backend_host) + ":" + String(backend_port) + "/api/health";
    
    http.begin(backend_url);
    int httpResponseCode = http.GET();
    
    if (httpResponseCode == 200) {
        const char* resp = "{\"success\":true,\"message\":\"Backend connection successful\"}";
        httpd_resp_send(req, resp, strlen(resp));
    } else {
        const char* resp = "{\"success\":false,\"message\":\"Backend connection failed\"}";
        httpd_resp_send(req, resp, strlen(resp));
    }
    
    http.end();
    return ESP_OK;
}

static esp_err_t status_handler(httpd_req_t *req) {
    httpd_resp_set_type(req, "application/json");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    
    StaticJsonDocument<200> doc;
    doc["status"] = "ok";
    doc["device"] = "ESP32-CAM";
    doc["ip"] = WiFi.localIP().toString();
    doc["rssi"] = WiFi.RSSI();
    doc["free_heap"] = ESP.getFreeHeap();
    doc["detection_enabled"] = detection_enabled;
    
    String response;
    serializeJson(doc, response);
    
    httpd_resp_send(req, response.c_str(), response.length());
    return ESP_OK;
}

void startCameraServer() {
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();
    config.server_port = 80;
    config.max_uri_handlers = 20;
    config.stack_size = 8192;
    
    // Main server (port 80)
    httpd_uri_t index_uri = {
        .uri = "/",
        .method = HTTP_GET,
        .handler = index_handler,
        .user_ctx = NULL
    };
    
    httpd_uri_t capture_uri = {
        .uri = "/capture",
        .method = HTTP_GET,
        .handler = capture_handler,
        .user_ctx = NULL
    };
    
    httpd_uri_t test_backend_uri = {
        .uri = "/test-backend",
        .method = HTTP_GET,
        .handler = test_backend_handler,
        .user_ctx = NULL
    };
    
    httpd_uri_t status_uri = {
        .uri = "/status",
        .method = HTTP_GET,
        .handler = status_handler,
        .user_ctx = NULL
    };
    
    httpd_uri_t enable_detection_uri = {
        .uri = "/enable-detection",
        .method = HTTP_POST,
        .handler = enable_detection_handler,
        .user_ctx = NULL
    };
    
    httpd_uri_t disable_detection_uri = {
        .uri = "/disable-detection",
        .method = HTTP_POST,
        .handler = disable_detection_handler,
        .user_ctx = NULL
    };
    
    httpd_uri_t detection_status_uri = {
        .uri = "/detection-status",
        .method = HTTP_GET,
        .handler = detection_status_handler,
        .user_ctx = NULL
    };

    if (httpd_start(&camera_httpd, &config) == ESP_OK) {
        httpd_register_uri_handler(camera_httpd, &index_uri);
        httpd_register_uri_handler(camera_httpd, &capture_uri);
        httpd_register_uri_handler(camera_httpd, &test_backend_uri);
        httpd_register_uri_handler(camera_httpd, &status_uri);
        httpd_register_uri_handler(camera_httpd, &enable_detection_uri);
        httpd_register_uri_handler(camera_httpd, &disable_detection_uri);
        httpd_register_uri_handler(camera_httpd, &detection_status_uri);
        Serial.println("Camera HTTP server started on port 80");
    }
    
    // Stream server (port 81)
    config.server_port = 81;
    config.ctrl_port = 8081;
    
    httpd_uri_t stream_uri = {
        .uri = "/stream",
        .method = HTTP_GET,
        .handler = stream_handler,
        .user_ctx = NULL
    };
    
    httpd_uri_t detected_stream_uri = {
        .uri = "/detected-stream",
        .method = HTTP_GET,
        .handler = detected_stream_handler,
        .user_ctx = NULL
    };
    
    if (httpd_start(&stream_httpd, &config) == ESP_OK) {
        httpd_register_uri_handler(stream_httpd, &stream_uri);
        httpd_register_uri_handler(stream_httpd, &detected_stream_uri);
        Serial.println("Stream HTTP server started on port 81");
    }
}

void setup() {
    WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
    
    Serial.begin(115200);
    Serial.setDebugOutput(true);
    
    // Camera configuration
    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = Y2_GPIO_NUM;
    config.pin_d1 = Y3_GPIO_NUM;
    config.pin_d2 = Y4_GPIO_NUM;
    config.pin_d3 = Y5_GPIO_NUM;
    config.pin_d4 = Y6_GPIO_NUM;
    config.pin_d5 = Y7_GPIO_NUM;
    config.pin_d6 = Y8_GPIO_NUM;
    config.pin_d7 = Y9_GPIO_NUM;
    config.pin_xclk = XCLK_GPIO_NUM;
    config.pin_pclk = PCLK_GPIO_NUM;
    config.pin_vsync = VSYNC_GPIO_NUM;
    config.pin_href = HREF_GPIO_NUM;
    config.pin_sscb_sda = SIOD_GPIO_NUM;
    config.pin_sscb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn = PWDN_GPIO_NUM;
    config.pin_reset = RESET_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_JPEG;
    
    if(psramFound()) {
        config.frame_size = FRAMESIZE_SVGA;  // 800x600 - good balance
        config.jpeg_quality = 12;
        config.fb_count = 2;
    } else {
        config.frame_size = FRAMESIZE_VGA;   // 640x480
        config.jpeg_quality = 15;
        config.fb_count = 1;
    }
    
    // Initialize camera
    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("Camera init failed with error 0x%x", err);
        return;
    }
    
    // Camera settings optimization
    sensor_t * s = esp_camera_sensor_get();
    s->set_brightness(s, 0);
    s->set_contrast(s, 0);
    s->set_saturation(s, 0);
    s->set_special_effect(s, 0);
    s->set_whitebal(s, 1);
    s->set_awb_gain(s, 1);
    s->set_wb_mode(s, 0);
    s->set_exposure_ctrl(s, 1);
    s->set_aec2(s, 0);
    s->set_ae_level(s, 0);
    s->set_aec_value(s, 300);
    s->set_gain_ctrl(s, 1);
    s->set_agc_gain(s, 0);
    s->set_gainceiling(s, (gainceiling_t)0);
    s->set_bpc(s, 0);
    s->set_wpc(s, 1);
    s->set_raw_gma(s, 1);
    s->set_lenc(s, 1);
    s->set_hmirror(s, 0);
    s->set_vflip(s, 0);
    s->set_dcw(s, 1);
    s->set_colorbar(s, 0);
    
    // WiFi connection
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println();
    Serial.println("WiFi connected successfully!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal strength (RSSI): ");
    Serial.println(WiFi.RSSI());
    
    // Start camera server
    startCameraServer();
    
    Serial.println("===============================================");
    Serial.println("🌱 ESP32-CAM Coffee Bean Detection System");
    Serial.println("===============================================");
    Serial.printf("📹 Camera Stream: http://%s:81/stream\n", WiFi.localIP().toString().c_str());
    Serial.printf("🔍 Detection Stream: http://%s:81/detected-stream\n", WiFi.localIP().toString().c_str());
    Serial.printf("🌐 Web Interface: http://%s/\n", WiFi.localIP().toString().c_str());
    Serial.printf("📊 Status API: http://%s/status\n", WiFi.localIP().toString().c_str());
    Serial.printf("🔗 Backend Server: http://%s:%d\n", backend_host, backend_port);
    Serial.println("===============================================");
}

void loop() {
    static unsigned long lastCheck = 0;
    if (millis() - lastCheck > 30000) {
        if (WiFi.status() != WL_CONNECTED) {
            Serial.println("WiFi connection lost. Reconnecting...");
            WiFi.reconnect();
        } else {
            Serial.printf("System alive. Free heap: %d bytes, RSSI: %d dBm, Detection: %s\n", 
              ESP.getFreeHeap(), WiFi.RSSI(), detection_enabled ? "ON" : "OFF");
        }
        lastCheck = millis();
    }
    
    delay(1000);
}
