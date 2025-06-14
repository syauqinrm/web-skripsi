import React, { useState, useRef } from "react";
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

  const classColors = {
    light_roast: "border-accent bg-accent",
    medium_roast: "border-primary bg-primary",
    dark_roast: "border-secondary bg-secondary",
    green_bean: "border-success bg-success",
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (16MB max)
    if (file.size > 16 * 1024 * 1024) {
      setError("File size must be less than 16MB");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Upload image
      const response = await apiService.uploadImage(file);

      if (response.success) {
        setCurrentDetection(response.detection);
        setUploadedImage(file);
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
    if (!currentDetection?.result_path) return null;

    // This would need the actual detection results from the API
    // For now, we'll show the detection count
    return null;
  };

  const getImageSrc = () => {
    if (currentDetection?.result_path) {
      return apiService.getResultImageUrl(currentDetection.id);
    } else if (currentDetection?.original_path) {
      return apiService.getOriginalImageUrl(currentDetection.id);
    } else if (uploadedImage) {
      return URL.createObjectURL(uploadedImage);
    }
    return "/placeholder-stream.jpg";
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
      count: count,
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
        {/* Image Display Column */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="relative">
              {loading ? (
                <div className="w-full h-96 flex items-center justify-center bg-gray-100">
                  <Loader />
                </div>
              ) : (
                <>
                  <img
                    src={getImageSrc()}
                    alt="Detection preview"
                    className="w-full h-auto max-h-96 object-contain"
                    onError={(e) => {
                      e.target.src = "/placeholder-stream.jpg";
                    }}
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

            {/* Upload Area */}
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

        {/* Info & Control Column */}
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

              <div className="border-t my-4"></div>

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

            {/* Action Buttons */}
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
                  onClick={() => {
                    // You can implement save functionality here
                    alert("Hasil telah tersimpan di database!");
                  }}
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
