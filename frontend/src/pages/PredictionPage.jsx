import React, { useState, useRef, useEffect } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import { Save, Upload, Play, X } from "lucide-react";
import apiService from "../services/api";

const PredictionPage = () => {
  const [currentDetection, setCurrentDetection] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [liveDetections, setLiveDetections] = useState([]);

  const captureFrameAndDetect = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append("image", blob, "frame.jpg");

        try {
          const response = await apiService.detectFromFrame(formData); // 👈 Tambahkan di `apiService`
          if (response.success && response.boxes) {
            setLiveDetections(response.boxes);
          }
        } catch (err) {
          console.error("Detection error:", err);
        }
      },
      "image/jpeg",
      0.8
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      captureFrameAndDetect();
    }, 1000); // Setiap 1 detik ambil frame

    return () => clearInterval(interval);
  }, []);

  // Start camera on component mount
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Gagal mengakses kamera:", err);
        setError("Tidak dapat mengakses kamera perangkat");
      }
    };

    startCamera();

    return () => {
      // Stop camera on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Silakan pilih file gambar yang valid.");
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      setError("Ukuran file maksimal 16MB.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.uploadImage(file);
      if (response.success) {
        setCurrentDetection(response.detection);
        setUploadedImage(file);
      } else {
        setError("Gagal mengunggah gambar.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDetection = async () => {
    if (!currentDetection) return;

    try {
      setDetecting(true);
      setError(null);

      const response = await apiService.runDetection(currentDetection.id);
      if (response.success) {
        setCurrentDetection(response.detection);
      } else {
        setError("Deteksi gagal dijalankan.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDetecting(false);
    }
  };

  const handleReset = () => {
    setCurrentDetection(null);
    setUploadedImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const renderBoundingBoxes = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return null;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    liveDetections.forEach((box) => {
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      ctx.fillStyle = "lime";
      ctx.font = "14px Arial";
      ctx.fillText(
        `${box.label} (${Math.round(box.score * 100)}%)`,
        box.x,
        box.y - 5
      );
    });

    return null; // renderBoundingBoxes tidak perlu return elemen React
  };

  const getStatusText = () => {
    if (!currentDetection) return "Belum ada gambar";
    switch (currentDetection.status) {
      case "uploaded":
        return "Siap untuk deteksi";
      case "processing":
        return "Sedang memproses...";
      case "completed":
        return "Deteksi selesai";
      case "failed":
        return "Deteksi gagal";
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-main">
          Real-Time Prediction
        </h1>
        {currentDetection && (
          <Button onClick={handleReset} variant="outline">
            <X size={18} />
            Reset
          </Button>
        )}
      </div>

      {error && (
        <Card className="mb-6 p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Stream Column */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="relative">
              {loading ? (
                <div className="w-full h-96 flex items-center justify-center bg-gray-100">
                  <Loader />
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-auto max-h-96 object-contain"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  />
                  {renderBoundingBoxes()}
                  {detecting && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Loader />
                        <p className="mt-2">Memproses deteksi...</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Upload area (optional) */}
            {!currentDetection && (
              <div className="p-6 border-t">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  variant="primary"
                  disabled={loading}>
                  <Upload size={18} />
                  Pilih Gambar
                </Button>
              </div>
            )}
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
                  {getStatusText()}
                </span>
              </p>

              <p>
                <strong>Total Biji Kopi:</strong>{" "}
                {currentDetection?.detections_count || 0}
              </p>

              {currentDetection?.processing_time && (
                <p>
                  <strong>Waktu Proses:</strong>{" "}
                  {currentDetection.processing_time.toFixed(2)}s
                </p>
              )}

              <div className="border-t my-4" />

              <h3 className="font-semibold">Detail per Kelas:</h3>

              {formatClassDistribution().length > 0 ? (
                <ul className="list-disc list-inside text-text-light space-y-1">
                  {formatClassDistribution().map(
                    ({ class: cls, count, label }) => (
                      <li key={cls}>
                        {label}: {count}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-text-light">Belum ada hasil deteksi</p>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-2 mt-6">
              {currentDetection?.status === "uploaded" && (
                <Button
                  onClick={handleDetection}
                  className="w-full"
                  variant="primary"
                  disabled={detecting}>
                  <Play size={18} />
                  {detecting ? "Memproses..." : "Mulai Deteksi"}
                </Button>
              )}

              {currentDetection?.status === "completed" && (
                <Button
                  onClick={() => alert("Hasil telah tersimpan di database!")}
                  className="w-full"
                  variant="success">
                  <Save size={18} />
                  Hasil Tersimpan
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PredictionPage;
