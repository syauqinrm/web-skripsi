import React, { useState, useRef, useEffect } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import { Save, Upload, Play, X, Camera, Wifi, WifiOff } from "lucide-react";
import apiService from "../services/api";

const PredictionPage = () => {
  const [currentDetection, setCurrentDetection] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [capturingFrame, setCapturingFrame] = useState(false);
  const [error, setError] = useState(null);

  // ESP32-CAM specific states
  const [esp32IP] = useState("172.20.10.2");
  const [esp32Status, setEsp32Status] = useState("Checking...");
  const [esp32Connected, setEsp32Connected] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  const [detectionEnabled, setDetectionEnabled] = useState(false);
  const [liveDetections, setLiveDetections] = useState([]);
  const [isRealTimeMode, setIsRealTimeMode] = useState(true);
  const [processedImageUrl, setProcessedImageUrl] = useState("");
  const [lastDetectionTime, setLastDetectionTime] = useState(null);

  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // Check ESP32-CAM connection
  const checkEsp32Connection = async () => {
    try {
      const response = await apiService.checkEsp32Status(esp32IP);
      if (response.status === "ok") {
        setEsp32Status("ESP32-CAM Connected");
        setEsp32Connected(true);
        return true;
      } else {
        setEsp32Status("ESP32-CAM Disconnected");
        setEsp32Connected(false);
        return false;
      }
    } catch (error) {
      setEsp32Status("Connection Error");
      setEsp32Connected(false);
      console.error("ESP32 connection error:", error);
      return false;
    }
  };

  // Start ESP32-CAM stream
  const startEsp32Stream = () => {
    if (!esp32Connected) return;

    if (detectionEnabled) {
      setStreamUrl(apiService.getEsp32DetectionStreamUrl(esp32IP));
      setProcessedImageUrl(apiService.getProcessedImageUrl());
    } else {
      setStreamUrl(apiService.getEsp32StreamUrl(esp32IP));
      setProcessedImageUrl("");
    }

    console.log("ESP32-CAM stream started");
  };

  // Stop ESP32-CAM stream
  const stopEsp32Stream = () => {
    setStreamUrl("");
    setProcessedImageUrl("");
    console.log("ESP32-CAM stream stopped");
  };

  // Toggle live detection
  const toggleLiveDetection = async () => {
    if (!esp32Connected) {
      setError("ESP32-CAM not connected");
      return;
    }

    try {
      if (!detectionEnabled) {
        await apiService.enableEsp32Detection(esp32IP);
        setDetectionEnabled(true);
        setStreamUrl(apiService.getEsp32DetectionStreamUrl(esp32IP));
        setProcessedImageUrl(apiService.getProcessedImageUrl());
        console.log("Live detection enabled");
      } else {
        await apiService.disableEsp32Detection(esp32IP);
        setDetectionEnabled(false);
        setStreamUrl(apiService.getEsp32StreamUrl(esp32IP));
        setProcessedImageUrl("");
        setLiveDetections([]);
        console.log("Live detection disabled");
      }
    } catch (error) {
      setError(`Failed to toggle detection: ${error.message}`);
    }
  };

  // Fetch latest detection results
  const fetchLatestDetection = async () => {
    if (!detectionEnabled) return;

    try {
      const response = await apiService.getLatestDetection();
      if (response.success) {
        setLiveDetections(response.detections || []);
        setLastDetectionTime(new Date(response.timestamp * 1000));

        // Update processed image URL with timestamp to force refresh
        setProcessedImageUrl(
          `${apiService.getProcessedImageUrl()}?t=${Date.now()}`
        );
      }
    } catch (error) {
      console.error("Failed to fetch latest detection:", error);
    }
  };

  // Capture frame and save to database
  const handleSaveCapture = async () => {
    if (!esp32Connected || !isRealTimeMode) {
      setError("ESP32-CAM not available for capture");
      return;
    }

    try {
      setCapturingFrame(true);
      setError(null);

      // Capture current frame by making a request to ESP32-CAM
      const captureResponse = await fetch(`http://${esp32IP}/capture`);
      const result = await captureResponse.json();

      if (result.success) {
        alert(
          `Frame captured successfully! Objects detected: ${
            result.detections || 0
          }`
        );

        // Refresh detections list
        // You might want to call a function to refresh the reports page
      } else {
        setError("Failed to capture frame");
      }
    } catch (error) {
      setError(`Capture failed: ${error.message}`);
    } finally {
      setCapturingFrame(false);
    }
  };

  // File upload (keep existing functionality)
  const handleFileSelect = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      setError("Maximum file size is 16MB.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsRealTimeMode(false);
      setLiveDetections([]);

      const response = await apiService.uploadImage(file);
      if (response.success) {
        setCurrentDetection(response.detection);
        setUploadedImage(file);
      } else {
        setError("Failed to upload image.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle file input click
  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Run detection on uploaded image
  const handleDetection = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!currentDetection) return;

    try {
      setDetecting(true);
      setError(null);

      const response = await apiService.runDetection(currentDetection.id);
      if (response.success) {
        setCurrentDetection(response.detection);
      } else {
        setError("Detection failed.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDetecting(false);
    }
  };

  // Reset to initial state
  const handleReset = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      setResetting(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCurrentDetection(null);
      setUploadedImage(null);
      setError(null);
      setIsRealTimeMode(true);
      setLiveDetections([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Restart ESP32-CAM stream if connected
      if (esp32Connected) {
        startEsp32Stream();
      }
    } catch (error) {
      console.error("Reset error:", error);
    } finally {
      setResetting(false);
    }
  };

  // Helper functions
  const getStatusText = () => {
    if (!currentDetection) return "No image uploaded";
    switch (currentDetection.status) {
      case "uploaded":
        return "Ready for detection";
      case "processing":
        return "Processing...";
      case "completed":
        return "Detection completed";
      case "failed":
        return "Detection failed";
      default:
        return currentDetection.status;
    }
  };

  const getStatusColor = () => {
    if (!currentDetection) return "text-text-light";
    switch (currentDetection.status) {
      case "uploaded":
        return "text-blue-500";
      case "processing":
        return "text-yellow-500";
      case "completed":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-text-light";
    }
  };

  const formatClassDistribution = () => {
    if (!currentDetection?.detection_classes) return [];
    const counts = {};
    currentDetection.detection_classes.forEach((cls) => {
      counts[cls] = (counts[cls] || 0) + 1;
    });
    return Object.entries(counts).map(([cls, count]) => ({
      class: cls,
      count,
      label: cls.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    }));
  };

  // Render bounding boxes overlay for live detection
  const renderBoundingBoxes = () => {
    if (!liveDetections || liveDetections.length === 0) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {liveDetections.map((detection, index) => (
          <div
            key={index}
            className="absolute border-2 border-green-400"
            style={{
              left: `${detection.x}px`,
              top: `${detection.y}px`,
              width: `${detection.width}px`,
              height: `${detection.height}px`,
            }}>
            <div className="absolute -top-6 left-0 bg-green-400 text-white px-2 py-1 text-xs rounded">
              {detection.label}: {Math.round(detection.confidence * 100)}%
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Initialize ESP32-CAM connection
  useEffect(() => {
    const initializeEsp32 = async () => {
      console.log("Initializing ESP32-CAM...");
      const connected = await checkEsp32Connection();
      if (connected) {
        startEsp32Stream();
      } else {
        setError("Cannot connect to ESP32-CAM. Please check connection.");
      }
    };

    initializeEsp32();

    return () => {
      stopEsp32Stream();
    };
  }, []);

  // Fetch detection results periodically when live detection is enabled
  useEffect(() => {
    if (!detectionEnabled) return;

    const interval = setInterval(() => {
      fetchLatestDetection();
    }, 2000); // Fetch every 2 seconds

    return () => clearInterval(interval);
  }, [detectionEnabled]);

  // Loading overlay
  if (resetting) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-lg font-semibold text-text-main">
            Mereset halaman...
          </p>
          <p className="text-sm text-text-light mt-2">Memuat ulang aplikasi</p>
          <div className="mt-4 bg-gray-200 rounded-full h-2 w-64 mx-auto">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: "100%" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-main">
          Real-Time Prediction
        </h1>
        <div className="flex gap-2">
          {/* ESP32-CAM Live Detection Toggle */}
          {isRealTimeMode && esp32Connected && (
            <Button
              onClick={toggleLiveDetection}
              variant={detectionEnabled ? "success" : "outline"}
              type="button"
              disabled={!esp32Connected}>
              {detectionEnabled ? <WifiOff size={18} /> : <Wifi size={18} />}
              {detectionEnabled ? "Stop Detection" : "Start Detection"}
            </Button>
          )}

          {/* Save Capture button for ESP32-CAM */}
          {isRealTimeMode && (
            <Button
              onClick={handleSaveCapture}
              variant="success"
              type="button"
              disabled={
                capturingFrame || liveDetections.length === 0 || !esp32Connected
              }>
              <Camera size={18} />
              {capturingFrame ? "Menyimpan..." : "Save Capture"}
            </Button>
          )}

          {currentDetection && (
            <Button
              onClick={handleReset}
              variant="outline"
              type="button"
              disabled={resetting}>
              <X size={18} />
              Reset
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card className="mb-6 p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* ESP32-CAM status info */}
      <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-700">
              <strong>📡 ESP32-CAM Status:</strong> {esp32Status}
            </p>
            <p className="text-blue-600 text-sm">
              IP: {esp32IP} | Stream: {streamUrl ? "Active" : "Inactive"}
              {detectionEnabled && " | Live Detection: ON"}
            </p>
            {lastDetectionTime && (
              <p className="text-blue-600 text-xs">
                Last Detection: {lastDetectionTime.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={startEsp32Stream}
              variant="outline"
              size="sm"
              disabled={!esp32Connected}>
              📹 Start Stream
            </Button>
            <Button onClick={stopEsp32Stream} variant="outline" size="sm">
              ⏹️ Stop Stream
            </Button>
          </div>
        </div>
      </Card>

      {/* Capture ready info */}
      {isRealTimeMode && liveDetections.length > 0 && esp32Connected && (
        <Card className="mb-6 p-4 bg-green-50 border-green-200">
          <p className="text-green-700">
            <strong>📸 Capture Ready:</strong> Terdeteksi{" "}
            {liveDetections.length} objek. Klik "Save Capture" untuk menyimpan
            frame dengan deteksi.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Stream Column - Now using ESP32-CAM */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="relative">
              {loading || capturingFrame ? (
                <div className="w-full h-96 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <Loader />
                    <p className="mt-2">
                      {capturingFrame
                        ? "Menyimpan ESP32-CAM capture..."
                        : "Memuat..."}
                    </p>
                  </div>
                </div>
              ) : currentDetection && !isRealTimeMode ? (
                <>
                  {/* Uploaded image display */}
                  <img
                    src={
                      currentDetection.result_path
                        ? apiService.getResultImageUrl(currentDetection.id)
                        : apiService.getOriginalImageUrl(currentDetection.id)
                    }
                    alt="Detection Result"
                    className="w-full h-auto max-h-96 object-contain"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                  {detecting && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Loader />
                        <p className="mt-2">Memproses deteksi...</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* ESP32-CAM stream */}
                  {streamUrl && esp32Connected ? (
                    <div className="relative">
                      <img
                        ref={imgRef}
                        src={streamUrl}
                        alt="ESP32-CAM Stream"
                        className="w-full h-auto min-h-[450px] max-h-[600px] object-cover bg-black"
                        style={{ aspectRatio: "16/9" }}
                        onError={(e) => {
                          console.error("ESP32-CAM stream error");
                          setError("ESP32-CAM stream error. Check connection.");
                        }}
                        onLoad={() => {
                          console.log("ESP32-CAM stream loaded");
                          setError(null);
                        }}
                      />

                      {/* Bounding boxes overlay */}
                      {isRealTimeMode && renderBoundingBoxes()}

                      {/* Detection status overlay */}
                      {detectionEnabled && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                          🔍 Live Detection ON
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-96 flex items-center justify-center bg-gray-800 text-white">
                      <div className="text-center">
                        <Camera size={48} className="mx-auto mb-4" />
                        <p className="text-lg">ESP32-CAM Stream</p>
                        <p className="text-sm mt-2">
                          {esp32Connected
                            ? "Click 'Start Stream' to begin"
                            : `Connecting to ${esp32IP}...`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Capture overlay for ESP32-CAM */}
                  {capturingFrame && (
                    <div className="absolute inset-0 bg-white bg-opacity-30 flex items-center justify-center">
                      <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                        📸 Capturing ESP32-CAM Frame...
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-6 border-t">
              {/* File input */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="hidden"
              />

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>💡 Tips:</strong>
                  {isRealTimeMode
                    ? " ESP32-CAM real-time menggunakan stream external. Pastikan pencahayaan yang memadai dan koneksi WiFi stabil untuk hasil optimal. Aktifkan 'Live Detection' untuk deteksi real-time, lalu simpan capture ketika objek terdeteksi."
                    : " Gunakan gambar dengan rasio yang sesuai untuk hasil terbaik."}
                </p>
              </div>

              <div className="flex gap-2">
                {/* Upload button */}
                <Button
                  onClick={handleFileInputClick}
                  className="flex-1"
                  variant="primary"
                  type="button"
                  disabled={loading || resetting || capturingFrame}>
                  <Upload size={18} />
                  {currentDetection && !isRealTimeMode
                    ? "Pilih Gambar Baru"
                    : "Pilih Gambar"}
                </Button>

                {currentDetection && !isRealTimeMode && (
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    type="button"
                    disabled={loading || resetting}>
                    <X size={18} />
                    {resetting ? "Mereset..." : "Batal"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Info Column */}
        <div>
          <Card>
            <h2 className="text-xl font-semibold text-text-main mb-4">
              Hasil Deteksi
            </h2>

            <div className="space-y-3">
              <p>
                <strong>Status:</strong>{" "}
                <span className={`font-semibold ${getStatusColor()}`}>
                  {resetting
                    ? "Mereset..."
                    : capturingFrame
                    ? "Menyimpan ESP32-CAM capture..."
                    : isRealTimeMode
                    ? detectionEnabled
                      ? "Live Detection Active"
                      : "ESP32-CAM Stream Ready"
                    : getStatusText()}
                </span>
              </p>

              {/* Show ESP32-CAM source */}
              <p>
                <strong>Sumber:</strong>{" "}
                <span
                  className={`font-semibold ${
                    esp32Connected ? "text-blue-600" : "text-red-600"
                  }`}>
                  {isRealTimeMode ? `ESP32-CAM (${esp32IP})` : "Upload Gambar"}
                  {isRealTimeMode && (esp32Connected ? " ✓" : " ✗")}
                </span>
              </p>

              <p>
                <strong>Total Biji Kopi:</strong>{" "}
                {currentDetection?.detections_count ||
                  (isRealTimeMode ? liveDetections.length : 0)}
              </p>

              {currentDetection?.processing_time && !isRealTimeMode && (
                <p>
                  <strong>Waktu Proses:</strong>{" "}
                  {currentDetection.processing_time.toFixed(2)}s
                </p>
              )}

              <div className="border-t my-4" />

              <h3 className="font-semibold">Detail per Kelas:</h3>

              {currentDetection &&
              !isRealTimeMode &&
              formatClassDistribution().length > 0 ? (
                <div>
                  <p className="text-sm text-green-600 mb-2">
                    Hasil deteksi gambar:
                  </p>
                  <ul className="list-disc list-inside text-text-light space-y-1">
                    {formatClassDistribution().map(
                      ({ class: cls, count, label }) => (
                        <li key={cls}>
                          {label}: {count}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ) : isRealTimeMode && liveDetections.length > 0 ? (
                <div>
                  <p className="text-sm text-blue-600 mb-2">
                    ESP32-CAM real-time deteksi:
                  </p>
                  <ul className="list-disc list-inside text-text-light space-y-1">
                    {liveDetections.map((detection, index) => (
                      <li key={index}>
                        {detection.label}:{" "}
                        {Math.round(detection.confidence * 100)}%
                      </li>
                    ))}
                  </ul>

                  {lastDetectionTime && (
                    <p className="text-xs text-blue-500 mt-2">
                      Terakhir update: {lastDetectionTime.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-text-light">
                  {isRealTimeMode
                    ? detectionEnabled
                      ? "Menunggu deteksi dari ESP32-CAM..."
                      : "Aktifkan 'Live Detection' untuk deteksi real-time"
                    : "Pilih gambar untuk deteksi"}
                </p>
              )}
            </div>

            <div className="space-y-2 mt-6">
              {/* Prediction buttons for uploaded images */}
              {currentDetection?.status === "uploaded" && !isRealTimeMode && (
                <Button
                  onClick={handleDetection}
                  className="w-full"
                  variant="primary"
                  type="button"
                  disabled={detecting || resetting}>
                  <Play size={18} />
                  {detecting ? "Memproses..." : "Mulai Deteksi"}
                </Button>
              )}

              {currentDetection?.status === "completed" && !isRealTimeMode && (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    alert("Hasil telah tersimpan di database!");
                  }}
                  className="w-full"
                  variant="success"
                  type="button"
                  disabled={resetting}>
                  <Save size={18} />
                  Hasil Tersimpan
                </Button>
              )}

              {/* ESP32-CAM real-time controls */}
              {isRealTimeMode && !resetting && (
                <div className="space-y-2">
                  {/* Live Detection Toggle */}
                  <Button
                    onClick={toggleLiveDetection}
                    className="w-full"
                    variant={detectionEnabled ? "success" : "outline"}
                    type="button"
                    disabled={!esp32Connected}>
                    {detectionEnabled ? (
                      <WifiOff size={18} />
                    ) : (
                      <Wifi size={18} />
                    )}
                    {detectionEnabled
                      ? "Stop Live Detection"
                      : "Start Live Detection"}
                  </Button>

                  {/* Save Capture */}
                  {liveDetections.length > 0 && esp32Connected && (
                    <Button
                      onClick={handleSaveCapture}
                      className="w-full"
                      variant="success"
                      type="button"
                      disabled={capturingFrame}>
                      <Camera size={18} />
                      {capturingFrame
                        ? "Menyimpan..."
                        : "Save ESP32-CAM Capture"}
                    </Button>
                  )}

                  <div className="text-center">
                    <p className="text-sm text-text-light">
                      {detectionEnabled
                        ? "Mode deteksi real-time ESP32-CAM aktif"
                        : "Mode stream ESP32-CAM"}
                    </p>
                    <p className="text-xs text-text-light mt-1">
                      ESP32-CAM Stream: {esp32IP}:81
                    </p>
                    {liveDetections.length > 0 && esp32Connected && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Siap untuk capture ESP32-CAM
                      </p>
                    )}
                    {!esp32Connected && (
                      <p className="text-xs text-red-600 mt-1">
                        ✗ ESP32-CAM tidak terhubung
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PredictionPage;
