import React, { useState, useRef, useEffect } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import {
  Save,
  Upload,
  Play,
  X,
  Camera,
  Wifi,
  WifiOff,
  Download,
  AlertCircle,
  CheckCircle,
  Activity,
  Zap,
  Eye,
  Target,
} from "lucide-react";
import apiService from "../services/api";

const PredictionPage = () => {
  // State variables
  const [currentDetection, setCurrentDetection] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [capturingFrame, setCapturingFrame] = useState(false);
  const [error, setError] = useState(null);

  // Raspberry Pi specific states
  const [raspiIP, setRaspiIP] = useState("172.20.10.2");
  const [raspiStatus, setRaspiStatus] = useState("Checking...");
  const [raspiConnected, setRaspiConnected] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  const [detectionEnabled, setDetectionEnabled] = useState(false);
  const [liveDetections, setLiveDetections] = useState([]);
  const [isRealTimeMode, setIsRealTimeMode] = useState(true);
  const [processedImageUrl, setProcessedImageUrl] = useState("");
  const [lastDetectionTime, setLastDetectionTime] = useState(null);

  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // Check Raspberry Pi connection
  const checkRaspiConnection = async () => {
    try {
      const response = await apiService.checkRaspiStatus(raspiIP);
      if (response.status === "ok") {
        setRaspiStatus("Raspberry Pi Connected");
        setRaspiConnected(true);
        return true;
      } else {
        setRaspiStatus("Raspberry Pi Disconnected");
        setRaspiConnected(false);
        return false;
      }
    } catch (error) {
      setRaspiStatus("Connection Error");
      setRaspiConnected(false);
      console.error("Raspberry Pi connection error:", error);
      return false;
    }
  };

  // Start Raspberry Pi stream
  const startRaspiStream = () => {
    if (!raspiConnected) return;

    if (detectionEnabled) {
      setStreamUrl(apiService.getRaspiDetectionStreamUrl(raspiIP));
      setProcessedImageUrl(apiService.getProcessedImageUrl());
    } else {
      setStreamUrl(apiService.getRaspiStreamUrl(raspiIP));
      setProcessedImageUrl("");
    }

    console.log("Raspberry Pi stream started");
  };

  // Stop Raspberry Pi stream
  const stopRaspiStream = () => {
    setStreamUrl("");
    setProcessedImageUrl("");
    console.log("Raspberry Pi stream stopped");
  };

  // Toggle live detection for Raspberry Pi
  const toggleLiveDetectionRaspi = async () => {
    if (!raspiConnected) {
      setError("Raspberry Pi not connected");
      return;
    }

    try {
      if (!detectionEnabled) {
        await apiService.enableRaspiDetection(raspiIP);
        setDetectionEnabled(true);
        setStreamUrl(apiService.getRaspiDetectionStreamUrl(raspiIP));
        setProcessedImageUrl(apiService.getProcessedImageUrl());
        console.log("Live detection enabled");
      } else {
        await apiService.disableRaspiDetection(raspiIP);
        setDetectionEnabled(false);
        setStreamUrl(apiService.getRaspiStreamUrl(raspiIP));
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

  // Enhanced capture with multiple strategies for Raspberry Pi
  const handleSaveCaptureRaspi = async () => {
    if (!raspiConnected || !isRealTimeMode) {
      setError("Raspberry Pi not available for capture");
      return;
    }

    try {
      setCapturingFrame(true);
      setError(null);

      let captureResult = null;
      let captureMethod = "unknown";

      // Strategy 1: Capture from live stream buffer if detection is enabled
      if (detectionEnabled && liveDetections.length > 0) {
        try {
          captureResult = await apiService.captureLiveStream();
          captureMethod = "live-stream";
          console.log("✅ Live stream capture successful");
        } catch (error) {
          console.warn("❌ Live stream capture failed:", error.message);
        }
      }

      // Strategy 2: Direct capture from Raspberry Pi if live stream failed
      if (!captureResult) {
        try {
          captureResult = await apiService.captureRaspiDirect(raspiIP);
          captureMethod = "raspi-direct";
          console.log("✅ Raspberry Pi direct capture successful");
        } catch (error) {
          console.warn("❌ Raspberry Pi direct capture failed:", error.message);
        }
      }

      // Process result
      if (captureResult && captureResult.success) {
        const detectionCount = captureResult.detections_count || 0;
        const processingTime = captureResult.processing_time || 0;

        // Show success message
        alert(
          `📸 Capture berhasil!\n\n📊 Metode: ${captureMethod}\n🎯 Objek terdeteksi: ${detectionCount}\n⏱️ Waktu proses: ${processingTime.toFixed(
            2
          )}s\n💾 ID Database: #${
            captureResult.detection_id || "N/A"
          }\n\nGambar telah disimpan di database dan dapat dilihat di halaman Reports.`
        );

        // Update UI
        if (captureResult.detections && captureResult.detections.length > 0) {
          setLiveDetections(captureResult.detections);
        }
      } else {
        throw new Error(captureResult?.error || "All capture methods failed");
      }
    } catch (error) {
      console.error("❌ Capture completely failed:", error);
      setError(`Capture gagal: ${error.message}`);
    } finally {
      setCapturingFrame(false);
    }
  };

  // Canvas capture for fallback
  const captureCanvasFrame = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;

    if (!canvas || !img) return null;

    const ctx = canvas.getContext("2d");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    // Draw image
    ctx.drawImage(img, 0, 0);

    // Draw bounding boxes if any
    if (liveDetections.length > 0) {
      liveDetections.forEach((detection) => {
        const { x, y, width, height, label, confidence } = detection;

        // Draw bounding box
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw label
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(x, y - 20, 120, 20);
        ctx.fillStyle = "#000000";
        ctx.font = "12px Arial";
        ctx.fillText(
          `${label}: ${Math.round(confidence * 100)}%`,
          x + 2,
          y - 6
        );
      });
    }

    return canvas.toDataURL("image/jpeg", 0.8);
  };

  // Download captured image
  const downloadCapturedImage = () => {
    const dataUrl = captureCanvasFrame();
    if (dataUrl) {
      const link = document.createElement("a");
      link.download = `raspi-capture-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-")}.jpg`;
      link.href = dataUrl;
      link.click();
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

      // Restart Raspberry Pi stream if connected
      if (raspiConnected) {
        startRaspiStream();
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

  // Initialize Raspberry Pi connection
  useEffect(() => {
    const initializeRaspi = async () => {
      console.log("Initializing Raspberry Pi...");
      const connected = await checkRaspiConnection();
      if (connected) {
        startRaspiStream();
      } else {
        setError("Cannot connect to Raspberry Pi. Please check connection.");
      }
    };

    initializeRaspi();

    return () => {
      // Cleanup if needed
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
      <div className="fixed inset-0 bg-coffee-cream/95 flex items-center justify-center z-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-coffee-lg max-w-md">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-coffee-dark rounded-full mb-4">
              <Activity className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-coffee-dark mb-2">
              Mereset Sistem
            </h3>
            <p className="text-coffee-medium">Memuat ulang aplikasi...</p>
          </div>
          <div className="bg-coffee-cream rounded-full h-2 w-64 mx-auto">
            <div className="bg-coffee-dark h-2 rounded-full transition-all duration-1000 ease-out w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-cream via-white to-coffee-cream/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-coffee-dark mb-2">
            Real-Time Prediction
          </h1>
          <p className="text-coffee-medium text-lg">
            Prediksi tingkat roasting biji kopi secara langsung
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          {/* Raspberry Pi Live Detection Toggle */}
          {isRealTimeMode && raspiConnected && (
            <Button
              onClick={toggleLiveDetectionRaspi}
              variant={detectionEnabled ? "success" : "outline"}
              className={`${
                detectionEnabled
                  ? "bg-green-600 hover:bg-green-700"
                  : "border-coffee-medium text-coffee-medium hover:bg-coffee-medium hover:text-white"
              }`}
              disabled={!raspiConnected}>
              {detectionEnabled ? <WifiOff size={18} /> : <Wifi size={18} />}
              {detectionEnabled ? "Stop Detection" : "Start Detection"}
            </Button>
          )}

          {/* Enhanced Save Capture button for Raspberry Pi */}
          {isRealTimeMode && (
            <Button
              onClick={handleSaveCaptureRaspi}
              className="bg-coffee-light hover:bg-coffee-light/80 text-white"
              disabled={capturingFrame || !raspiConnected}>
              <Camera size={18} />
              {capturingFrame ? "Capturing..." : "Save Capture"}
            </Button>
          )}

          {currentDetection && (
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-red-400 text-red-600 hover:bg-red-50"
              disabled={resetting}>
              <X size={18} />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="p-4 bg-red-50 border-2 border-red-200 shadow-coffee">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </Card>
      )}

      {/* Raspberry Pi Status */}
      <Card className="p-6 bg-gradient-to-r from-coffee-dark to-coffee-medium text-white shadow-coffee">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div
              className={`w-4 h-4 rounded-full ${
                raspiConnected ? "bg-green-400" : "bg-red-400"
              } animate-pulse`}></div>
            <div>
              <h3 className="text-lg font-bold">Raspberry Pi Status</h3>
              <p className="text-coffee-cream/90">{raspiStatus}</p>
              <p className="text-coffee-cream/80 text-sm">
                Raspberry Pi | Stream: {streamUrl ? "Active" : "Inactive"}
                {detectionEnabled && " | Live Detection: ON"}
              </p>
              {lastDetectionTime && (
                <p className="text-coffee-cream/70 text-xs">
                  Last Detection: {lastDetectionTime.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={startRaspiStream}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              size="sm"
              disabled={!raspiConnected}>
              <Eye size={16} />
              Start Stream
            </Button>
            <Button
              onClick={stopRaspiStream}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              size="sm">
              <X size={16} />
              Stop Stream
            </Button>
          </div>
        </div>
      </Card>

      {/* Capture Ready Alert */}
      {isRealTimeMode && raspiConnected && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-coffee">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-bold text-green-800">
                  Capture Ready
                </h3>
                <p className="text-green-700">
                  {liveDetections.length > 0
                    ? `Terdeteksi ${liveDetections.length} objek`
                    : "Stream aktif"}
                </p>
                <p className="text-green-600 text-sm">
                  Klik "Save Capture" untuk menyimpan frame ke database
                  {detectionEnabled && " dengan hasil deteksi"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveCaptureRaspi}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
                disabled={capturingFrame || !raspiConnected}>
                <Camera size={16} />
                {capturingFrame ? "Saving..." : "Quick Capture"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Stream Column */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden shadow-coffee">
            <div className="relative">
              {loading || capturingFrame ? (
                <div className="w-full h-96 flex items-center justify-center bg-coffee-cream/50">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-coffee-dark rounded-full mb-4">
                      <Activity className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <h3 className="text-lg font-bold text-coffee-dark mb-2">
                      {capturingFrame
                        ? "Menyimpan Raspberry Pi capture..."
                        : "Memuat..."}
                    </h3>
                    <p className="text-coffee-medium">Mohon tunggu sebentar</p>
                  </div>
                </div>
              ) : currentDetection && !isRealTimeMode ? (
                <>
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
                    <div className="absolute inset-0 bg-coffee-dark/50 flex items-center justify-center">
                      <div className="text-white text-center bg-coffee-dark/80 p-6 rounded-xl">
                        <Activity className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
                        <p className="text-lg font-semibold">
                          Memproses deteksi...
                        </p>
                        <p className="text-coffee-cream/80">
                          Menganalisis gambar dengan AI
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Raspberry Pi stream */}
                  {streamUrl && raspiConnected ? (
                    <div className="relative">
                      <img
                        ref={imgRef}
                        src={streamUrl}
                        alt="Raspberry Pi Stream"
                        className="w-full h-auto min-h-[450px] max-h-[600px] object-cover bg-coffee-dark"
                        style={{ aspectRatio: "16/9" }}
                        onError={(e) => {
                          console.error("Raspberry Pi stream error");
                          setError(
                            "Raspberry Pi stream error. Check connection."
                          );
                        }}
                        onLoad={() => {
                          console.log("Raspberry Pi stream loaded");
                          setError(null);
                        }}
                      />

                      {/* Bounding boxes overlay */}
                      {isRealTimeMode && renderBoundingBoxes()}

                      {/* Detection status overlay */}
                      {detectionEnabled && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-coffee">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span>Live Detection ON</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-96 flex items-center justify-center bg-coffee-dark text-white">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-coffee-light rounded-full mb-4">
                          <Camera size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">
                          Raspberry Pi Stream
                        </h3>
                        <p className="text-coffee-cream/80">
                          {raspiConnected
                            ? "Click 'Start Stream' to begin"
                            : `Connecting to Raspberry Pi...`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Capture overlay */}
                  {capturingFrame && (
                    <div className="absolute inset-0 bg-white/30 flex items-center justify-center">
                      <div className="bg-coffee-dark/90 text-white px-6 py-4 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <Camera className="w-5 h-5 animate-pulse" />
                          <span className="font-semibold">
                            Capturing Raspberry Pi Frame...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Card Footer */}
            <div className="p-6 border-t border-coffee-cream/50 bg-gradient-to-r from-coffee-cream/30 to-white">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="hidden"
              />

              <div className="mb-4 p-4 bg-coffee-light/10 border border-coffee-light/20 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-coffee-light" />
                  <span className="font-semibold text-coffee-dark">
                    Tips Penggunaan:
                  </span>
                </div>
                <p className="text-sm text-coffee-medium">
                  {isRealTimeMode
                    ? "Raspberry Pi real-time menggunakan stream webcam. Pastikan pencahayaan memadai dan koneksi WiFi stabil. Aktifkan 'Live Detection' untuk deteksi real-time, lalu simpan capture ketika objek terdeteksi."
                    : "Gunakan gambar dengan kualitas baik dan pencahayaan yang memadai untuk hasil deteksi optimal."}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleFileInputClick}
                  className="flex-1 bg-coffee-dark hover:bg-coffee-medium text-white"
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
                    className="border-red-400 text-red-600 hover:bg-red-50"
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
          <Card className="p-6 shadow-coffee">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-coffee-light/10 rounded-lg">
                <Target className="w-6 h-6 text-coffee-light" />
              </div>
              <h2 className="text-xl font-bold text-coffee-dark">
                Hasil Deteksi
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-coffee-cream/30 rounded-xl border border-coffee-cream">
                <h3 className="font-semibold text-coffee-dark mb-2">Status:</h3>
                <span className={`font-bold ${getStatusColor()}`}>
                  {resetting
                    ? "Mereset..."
                    : capturingFrame
                    ? "Menyimpan Raspberry Pi capture..."
                    : isRealTimeMode
                    ? detectionEnabled
                      ? "Live Detection Active"
                      : "Raspberry Pi Stream Ready"
                    : getStatusText()}
                </span>
              </div>

              <div className="p-4 bg-coffee-cream/30 rounded-xl border border-coffee-cream">
                <h3 className="font-semibold text-coffee-dark mb-2">Sumber:</h3>
                <div className="flex items-center space-x-2 justify-between">
                  <span
                    className={`font-semibold ${
                      raspiConnected ? "text-green-600" : "text-red-600"
                    }`}>
                    {isRealTimeMode ? `Raspberry Pi` : "Upload Gambar"}
                  </span>
                  {isRealTimeMode && (
                    <span
                      className={`text-xs py-1 px-2 rounded-full ${
                        raspiConnected
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                      {raspiConnected ? "✓ Connected" : "✗ Disconnected"}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-coffee-cream/30 rounded-xl border border-coffee-cream">
                <h3 className="font-semibold text-coffee-dark mb-2">
                  Total Deteksi:
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-coffee-dark">
                    {currentDetection?.detections_count ||
                      (isRealTimeMode ? liveDetections.length : 0)}
                  </span>
                  <span className="text-coffee-medium">objek</span>
                </div>
              </div>

              {currentDetection?.processing_time && !isRealTimeMode && (
                <div className="p-4 bg-coffee-cream/30 rounded-xl border border-coffee-cream">
                  <h3 className="font-semibold text-coffee-dark mb-2">
                    Waktu Proses:
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-coffee-light" />
                    <span className="font-bold text-coffee-dark">
                      {currentDetection.processing_time.toFixed(2)}s
                    </span>
                  </div>
                </div>
              )}

              <div className="border-t border-coffee-cream/50 pt-4">
                <h3 className="font-semibold text-coffee-dark mb-3">
                  Detail per Kelas:
                </h3>

                {currentDetection &&
                !isRealTimeMode &&
                formatClassDistribution().length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 font-medium mb-3">
                      Hasil deteksi gambar:
                    </p>
                    {formatClassDistribution().map(
                      ({ class: cls, count, label }) => (
                        <div
                          key={cls}
                          className="flex justify-between items-center p-2 bg-coffee-cream/50 rounded-lg">
                          <span className="font-medium text-coffee-dark">
                            {label}
                          </span>
                          <span className="font-bold text-coffee-dark">
                            {count}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : isRealTimeMode && liveDetections.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-600 font-medium mb-3">
                      Raspberry Pi real-time deteksi:
                    </p>
                    {liveDetections.map((detection, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-coffee-cream/50 rounded-lg">
                        <span className="font-medium text-coffee-dark">
                          {detection.label}
                        </span>
                        <span className="font-bold text-coffee-dark">
                          {Math.round(detection.confidence * 100)}%
                        </span>
                      </div>
                    ))}

                    {lastDetectionTime && (
                      <p className="text-xs text-blue-500 mt-2 text-center">
                        Terakhir update:{" "}
                        {lastDetectionTime.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-coffee-cream rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="w-6 h-6 text-coffee-medium" />
                    </div>
                    <p className="text-coffee-medium">
                      {isRealTimeMode
                        ? detectionEnabled
                          ? "Menunggu deteksi dari Raspberry Pi..."
                          : "Aktifkan 'Live Detection' untuk deteksi real-time"
                        : "Pilih gambar untuk deteksi"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-6">
              {/* Prediction buttons for uploaded images */}
              {currentDetection?.status === "uploaded" && !isRealTimeMode && (
                <Button
                  onClick={handleDetection}
                  className="w-full bg-coffee-dark hover:bg-coffee-medium text-white"
                  disabled={detecting || resetting}>
                  <Play size={18} />
                  {detecting ? "Memproses..." : "Mulai Deteksi"}
                </Button>
              )}

              {currentDetection?.status === "completed" && !isRealTimeMode && (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Hasil telah tersimpan di database!");
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={resetting}>
                  <Save size={18} />
                  Hasil Tersimpan
                </Button>
              )}

              {/* Raspberry Pi real-time controls */}
              {isRealTimeMode && !resetting && (
                <div className="space-y-3">
                  <Button
                    onClick={toggleLiveDetectionRaspi}
                    className={`w-full ${
                      detectionEnabled
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-coffee-dark hover:bg-coffee-medium"
                    } text-white`}
                    disabled={!raspiConnected}>
                    {detectionEnabled ? (
                      <WifiOff size={18} />
                    ) : (
                      <Wifi size={18} />
                    )}
                    {detectionEnabled
                      ? "Stop Live Detection"
                      : "Start Live Detection"}
                  </Button>

                  {liveDetections.length > 0 && raspiConnected && (
                    <Button
                      onClick={handleSaveCaptureRaspi}
                      className="w-full bg-coffee-light hover:bg-coffee-light/80 text-white"
                      disabled={capturingFrame}>
                      <Camera size={18} />
                      {capturingFrame
                        ? "Menyimpan..."
                        : "Save Raspberry Pi Capture"}
                    </Button>
                  )}

                  <div className="text-center p-4 bg-coffee-cream/30 rounded-xl">
                    <p className="text-sm text-coffee-medium font-medium">
                      {detectionEnabled
                        ? "Mode deteksi real-time Raspberry Pi aktif"
                        : "Mode stream Raspberry Pi"}
                    </p>
                    {liveDetections.length > 0 && raspiConnected && (
                      <p className="text-xs text-green-600 mt-2">
                        ✓ Siap untuk capture Raspberry Pi
                      </p>
                    )}
                    {!raspiConnected && (
                      <p className="text-xs text-red-600 mt-2">
                        ✗ Raspberry Pi tidak terhubung
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
