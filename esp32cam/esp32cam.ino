#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>
#include <WiFiClient.h>

// 👈 WiFi credentials
const char* ssid = "BasecampPMII";        // Ganti dengan nama WiFi Anda
const char* password = "janganlupabayarkaskos"; // Ganti dengan password WiFi Anda

// 👈 Pin definition for CAMERA_MODEL_AI_THINKER
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

WebServer server(80);

// 👈 Camera configuration
static camera_config_t camera_config = {
    .pin_pwdn  = PWDN_GPIO_NUM,
    .pin_reset = RESET_GPIO_NUM,
    .pin_xclk = XCLK_GPIO_NUM,
    .pin_sscb_sda = SIOD_GPIO_NUM,
    .pin_sscb_scl = SIOC_GPIO_NUM,

    .pin_d7 = Y9_GPIO_NUM,
    .pin_d6 = Y8_GPIO_NUM,
    .pin_d5 = Y7_GPIO_NUM,
    .pin_d4 = Y6_GPIO_NUM,
    .pin_d3 = Y5_GPIO_NUM,
    .pin_d2 = Y4_GPIO_NUM,
    .pin_d1 = Y3_GPIO_NUM,
    .pin_d0 = Y2_GPIO_NUM,
    .pin_vsync = VSYNC_GPIO_NUM,
    .pin_href = HREF_GPIO_NUM,
    .pin_pclk = PCLK_GPIO_NUM,

    .xclk_freq_hz = 20000000,               // XCLK 20MHz or 10MHz untuk OV2640
    .ledc_timer = LEDC_TIMER_0,
    .ledc_channel = LEDC_CHANNEL_0,

    .pixel_format = PIXFORMAT_JPEG,         // YUV422,GRAYSCALE,RGB565,JPEG
    .frame_size = FRAMESIZE_SVGA,           // QQVGA-UXGA, For ESP32, do not use sizes above QVGA when not JPEG

    .jpeg_quality = 12,                     // 0-63, lower number means higher quality
    .fb_count = 1,                          // When jpeg mode is used, if fb_count more than one, the driver will work in continuous mode.
    .grab_mode = CAMERA_GRAB_WHEN_EMPTY     // CAMERA_GRAB_LATEST. Sets when buffers should be filled
};

// 👈 Initialize camera
esp_err_t init_camera() {
    esp_err_t err = esp_camera_init(&camera_config);
    if (err != ESP_OK) {
        Serial.printf("Camera init failed with error 0x%x", err);
        return err;
    }
    
    // 👈 Get camera sensor
    sensor_t * s = esp_camera_sensor_get();
    if (s->id.PID == OV3660_PID) {
        s->set_vflip(s, 1);       // flip it back
        s->set_brightness(s, 1);  // up the brightness just a bit
        s->set_saturation(s, -2); // lower the saturation
    }
    
    // 👈 Drop down frame size for higher initial frame rate
    if(camera_config.pixel_format == PIXFORMAT_JPEG){
        s->set_framesize(s, FRAMESIZE_QVGA);
    }

    Serial.println("Camera initialized successfully");
    return ESP_OK;
}

// 👈 Handle root page
void handle_root() {
    String html = "<!DOCTYPE html><html>";
    html += "<head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">";
    html += "<style>body { font-family: Arial; text-align: center; margin:0px auto; padding-top: 30px;}";
    html += ".button { background-color: #4CAF50; border: none; color: white; padding: 10px 20px;";
    html += "text-decoration: none; font-size: 18px; margin: 2px; cursor: pointer;}";
    html += ".button2 {background-color: #008CBA;}</style></head>";
    html += "<body><h1>ESP32-CAM Web Server</h1>";
    html += "<p><a class=\"button\" href=\"/capture\">Capture Photo</a></p>";
    html += "<p><a class=\"button button2\" href=\"/stream\">Start Stream</a></p>";
    html += "<p>Camera ready! Use /capture for photo or /stream for video</p>";
    html += "</body></html>";
    
    server.send(200, "text/html", html);
}

// 👈 Handle single photo capture
void handle_capture() {
    camera_fb_t * fb = esp_camera_fb_get();
    if(!fb) {
        Serial.println("Camera capture failed");
        server.send(500, "text/plain", "Camera capture failed");
        return;
    }

    server.sendHeader("Content-Disposition", "inline; filename=capture.jpg");
    server.send_P(200, "image/jpeg", (const char *)fb->buf, fb->len);
    
    esp_camera_fb_return(fb);
    Serial.println("Photo captured and sent");
}

// 👈 Handle video streaming
void handle_stream() {
    WiFiClient client = server.client();
    
    String response = "HTTP/1.1 200 OK\r\n";
    response += "Content-Type: multipart/x-mixed-replace; boundary=frame\r\n\r\n";
    server.sendContent(response);

    Serial.println("Stream started");
    
    while(client.connected()) {
        camera_fb_t * fb = esp_camera_fb_get();
        if (!fb) {
            Serial.println("Camera capture failed");
            break;
        }

        String part = "--frame\r\n";
        part += "Content-Type: image/jpeg\r\n";
        part += "Content-Length: " + String(fb->len) + "\r\n\r\n";
        
        server.sendContent(part);
        
        // Send the image data
        client.write((char*)fb->buf, fb->len);
        server.sendContent("\r\n");
        
        esp_camera_fb_return(fb);
        
        // Small delay to prevent overwhelming
        delay(100);
    }
    
    Serial.println("Stream ended");
}

// 👈 Handle camera settings
void handle_settings() {
    String quality = server.arg("quality");
    String framesize = server.arg("framesize");
    String brightness = server.arg("brightness");
    
    sensor_t * s = esp_camera_sensor_get();
    
    if(quality.length() > 0) {
        int val = quality.toInt();
        s->set_quality(s, val);
        Serial.printf("Quality set to: %d\n", val);
    }
    
    if(framesize.length() > 0) {
        int val = framesize.toInt();
        s->set_framesize(s, (framesize_t)val);
        Serial.printf("Framesize set to: %d\n", val);
    }
    
    if(brightness.length() > 0) {
        int val = brightness.toInt();
        s->set_brightness(s, val);
        Serial.printf("Brightness set to: %d\n", val);
    }
    
    server.send(200, "text/plain", "Settings updated");
}

// 👈 Handle status/info
void handle_status() {
    String json = "{";
    json += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
    json += "\"mac\":\"" + WiFi.macAddress() + "\",";
    json += "\"rssi\":" + String(WiFi.RSSI()) + ",";
    json += "\"free_heap\":" + String(ESP.getFreeHeap()) + ",";
    json += "\"uptime\":" + String(millis()) + "";
    json += "}";
    
    server.send(200, "application/json", json);
}

void setup() {
    Serial.begin(115200);
    Serial.setDebugOutput(true);
    Serial.println();
    
    // 👈 Initialize camera
    if(init_camera() != ESP_OK) {
        Serial.println("Camera initialization failed!");
        return;
    }
    
    // 👈 Connect to WiFi
    WiFi.begin(ssid, password);
    WiFi.setSleep(false);
    
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println();
    
    Serial.println("WiFi connected!");
    Serial.print("Camera Ready! Use 'http://");
    Serial.print(WiFi.localIP());
    Serial.println("' to connect");
    
    // 👈 Setup web server routes
    server.on("/", handle_root);
    server.on("/capture", handle_capture);
    server.on("/stream", handle_stream);
    server.on("/settings", HTTP_GET, handle_settings);
    server.on("/status", handle_status);
    
    // 👈 Start server
    server.begin();
    Serial.println("HTTP server started");
    
    // 👈 Print useful information
    Serial.println("=== ESP32-CAM Web Server ===");
    Serial.printf("IP Address: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("MAC Address: %s\n", WiFi.macAddress().c_str());
    Serial.println("Available endpoints:");
    Serial.println("  / - Main page");
    Serial.println("  /capture - Take single photo");
    Serial.println("  /stream - Video streaming");
    Serial.println("  /settings?quality=10&framesize=5&brightness=0");
    Serial.println("  /status - System status");
    Serial.println("=============================");
}

void loop() {
    // 👈 Handle web server clients
    server.handleClient();
    
    // 👈 Optional: Print status every 30 seconds
    static unsigned long lastStatus = 0;
    if(millis() - lastStatus > 30000) {
        lastStatus = millis();
        Serial.printf("Free heap: %d bytes, WiFi RSSI: %d dBm\n", 
                     ESP.getFreeHeap(), WiFi.RSSI());
    }
    
    // Small delay to prevent watchdog triggers
    delay(1);
}
