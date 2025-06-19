const API_BASE_URL = "http://localhost:5000/api";

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
}

export default new ApiService();
