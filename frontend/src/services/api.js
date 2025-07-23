// 👈 Coba beberapa URL secara otomatis
const detectApiUrl = async () => {
  const hostname = window.location.hostname;
  const possibleUrls = [
    `http://${hostname}:5000/api/detect`,
    `http://localhost:5000/api`,
    `http://127.0.0.1:5000/api`,
    import.meta.env.VITE_API_BASE_URL,
  ].filter(Boolean);

  for (const url of possibleUrls) {
    try {
      const response = await fetch(`${url}/health`, {
        method: "GET",
        timeout: 2000,
      });
      if (response.ok) {
        console.log("API detected at:", url);
        return url;
      }
    } catch (error) {
      console.log(`Failed to connect to ${url}`);
    }
  }

  // Fallback
  return `http://${hostname}:5000/api`;
};

// 👈 Gunakan async initialization
let API_BASE_URL = `http://${window.location.hostname}:5000/api`;

// Detect pada saat aplikasi start
detectApiUrl()
  .then((url) => {
    API_BASE_URL = url;
  })
  .catch(() => {
    console.warn("Using default API URL:", API_BASE_URL);
  });

class ApiService {
  // Helper method untuk handle response
  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP Error: ${response.status}`);
    }

    return data;
  }

  // Upload image
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    return this.handleResponse(response);
  }

  // Run detection
  async runDetection(detectionId) {
    const response = await fetch(`${API_BASE_URL}/detect/${detectionId}`, {
      method: "POST",
    });

    return this.handleResponse(response);
  }

  // Get all detections
  async getDetections(page = 1, perPage = 10) {
    const response = await fetch(
      `${API_BASE_URL}/detections?page=${page}&per_page=${perPage}`
    );
    return this.handleResponse(response);
  }

  // Get specific detection
  async getDetection(detectionId) {
    const response = await fetch(`${API_BASE_URL}/detection/${detectionId}`);
    return this.handleResponse(response);
  }

  // Get detection stats
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/stats`);
    return this.handleResponse(response);
  }

  // Get image URLs
  getOriginalImageUrl(detectionId) {
    return `${API_BASE_URL}/detection/${detectionId}/image`;
  }

  getResultImageUrl(detectionId) {
    return `${API_BASE_URL}/detection/${detectionId}/result`;
  }

  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return this.handleResponse(response);
  }

  // Jalankan deteksi langsung dari frame video
  async detectFromFrame(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/detect/frame`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal mendeteksi frame.");
      }

      return {
        success: true,
        boxes: data.boxes || [],
      };
    } catch (error) {
      console.error("Detection error:", error);
      return { success: false, error: error.message };
    }
  }

  // Raspberry Pi Live Stream Detection
  async getLatestDetection() {
    const response = await fetch(`${API_BASE_URL}/live-stream/latest`);
    return this.handleResponse(response);
  }

  // Get processed image with bounding boxes
  getProcessedImageUrl() {
    return `${API_BASE_URL}/live-stream/processed-image?t=${Date.now()}`;
  }

  // Raspberry Pi specific endpoints
  async checkRaspiStatus(raspiIP) {
    try {
      const response = await fetch(`http://${raspiIP}:8080/status`, {
        method: "GET",
        timeout: 5000,
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Raspberry Pi connection failed: ${error.message}`);
    }
  }

  async enableRaspiDetection(raspiIP) {
    try {
      const response = await fetch(`http://${raspiIP}:8080/enable-detection`, {
        method: "POST",
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Failed to enable detection: ${error.message}`);
    }
  }

  async disableRaspiDetection(raspiIP) {
    try {
      const response = await fetch(`http://${raspiIP}:8080/disable-detection`, {
        method: "POST",
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Failed to disable detection: ${error.message}`);
    }
  }

  // Get Raspberry Pi stream URLs
  getRaspiStreamUrl(raspiIP) {
    return `http://${raspiIP}:8081/stream`;
  }

  getRaspiDetectionStreamUrl(raspiIP) {
    return `http://${raspiIP}:8081/detected-stream`;
  }

  // Capture live stream frame
  async captureLiveStream() {
    try {
      const response = await fetch(`${API_BASE_URL}/capture/live-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Live stream capture failed: ${error.message}`);
    }
  }

  // Capture directly from Raspberry Pi
  async captureRaspiDirect(raspiIP) {
    try {
      const response = await fetch(`${API_BASE_URL}/capture/raspi-direct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raspi_ip: raspiIP }),
      });

      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Raspberry Pi direct capture failed: ${error.message}`);
    }
  }

  // Enhanced Raspberry Pi capture with better error handling
  async captureRaspiFrame(raspiIP) {
    try {
      const response = await fetch(`http://${raspiIP}/capture`, {
        method: "GET",
        timeout: 10000, // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Raspberry Pi response: ${response.status}`);
      }

      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Raspberry Pi capture failed: ${error.message}`);
    }
  }

  // Get single frame from Raspberry Pi
  getRaspiCaptureUrl(raspiIP) {
    return `http://${raspiIP}/capture-frame`;
  }

  // Test Raspberry Pi connection
  async testRaspiConnection(raspiIP) {
    try {
      const response = await fetch(`http://${raspiIP}/test-backend`, {
        method: "GET",
        timeout: 5000,
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Raspberry Pi test failed: ${error.message}`);
    }
  }

  // Get Raspberry Pi detection status
  async getRaspiDetectionStatus(raspiIP) {
    try {
      const response = await fetch(`http://${raspiIP}/detection-status`, {
        method: "GET",
        timeout: 3000,
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Failed to get detection status: ${error.message}`);
    }
  }
}

export default new ApiService();
