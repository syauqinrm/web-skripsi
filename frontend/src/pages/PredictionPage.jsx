import React, { useState, useRef, useEffect } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import { Save, Upload, Play, X, Camera } from "lucide-react";
import apiService from "../services/api";

const PredictionPage = () => {
  const [currentDetection, setCurrentDetection] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [capturingFrame, setCapturingFrame] = useState(false); // 👈 State untuk capture
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [liveDetections, setLiveDetections] = useState([]);
  const [isRealTimeMode, setIsRealTimeMode] = useState(true);

  const captureFrameAndDetect = async () => {
    if (!videoRef.current || !isRealTimeMode) return;

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
          const response = await apiService.detectFromFrame(formData);
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

  // 👈 Fungsi untuk capture dan save frame real-time - DIPERBAIKI
  const handleSaveCapture = async () => {
    if (!videoRef.current || !isRealTimeMode) {
      setError("Video tidak tersedia untuk capture");
      return;
    }

    try {
      setCapturingFrame(true);
      setError(null);

      const video = videoRef.current;

      // 👈 Pastikan video sudah loaded dan memiliki dimensi
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError("Video belum siap untuk capture");
        setCapturingFrame(false);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 👈 Draw bounding boxes pada captured frame
      if (liveDetections.length > 0) {
        liveDetections.forEach((box) => {
          ctx.strokeStyle = "lime";
          ctx.lineWidth = 3;
          ctx.strokeRect(box.x, box.y, box.width, box.height);

          // 👈 Label background
          ctx.fillStyle = "black";
          ctx.fillRect(box.x, box.y - 25, 200, 25);

          // 👈 Label text
          ctx.fillStyle = "white";
          ctx.font = "16px Arial";
          ctx.fillText(
            `${box.label} (${Math.round(box.score * 100)}%)`,
            box.x + 5,
            box.y - 8
          );
        });
      }

      // 👈 Convert canvas to blob dengan Promise wrapper
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });

      if (!blob) {
        setError("Gagal membuat capture image");
        setCapturingFrame(false);
        return;
      }

      // 👈 Buat File object seperti file upload biasa
      const file = new File([blob], `realtime-capture-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      console.log("Created file:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      try {
        // 👈 Gunakan file object seperti upload biasa
        const response = await apiService.uploadImage(file);

        if (response.success) {
          // 👈 Langsung jalankan deteksi pada captured frame
          const detectionResponse = await apiService.runDetection(
            response.detection.id
          );

          if (detectionResponse.success) {
            // 👈 Pindah ke mode upload dan tampilkan hasil
            setIsRealTimeMode(false);
            setCurrentDetection(detectionResponse.detection);
            setLiveDetections([]);

            // 👈 Notifikasi berhasil
            alert(
              `Capture berhasil disimpan! Terdeteksi ${
                detectionResponse.detection.detections_count || 0
              } biji kopi.`
            );
          } else {
            setError(
              "Capture berhasil disimpan tapi deteksi gagal dijalankan."
            );
          }
        } else {
          setError(
            `Gagal menyimpan capture: ${response.message || "Unknown error"}`
          );
        }
      } catch (uploadErr) {
        console.error("Upload error details:", uploadErr);
        setError(`Error menyimpan capture: ${uploadErr.message}`);
      }
    } catch (error) {
      console.error("Capture error:", error);
      setError(`Gagal melakukan capture: ${error.message}`);
    } finally {
      setCapturingFrame(false);
    }
  };

  useEffect(() => {
    if (!isRealTimeMode) return;

    const interval = setInterval(() => {
      captureFrameAndDetect();
    }, 1000);

    return () => clearInterval(interval);
  }, [isRealTimeMode]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            aspectRatio: { ideal: 16 / 9 },
          },
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
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleFileSelect = async (event) => {
    event.preventDefault();
    event.stopPropagation();

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
      setIsRealTimeMode(false);
      setLiveDetections([]);

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
        setError("Deteksi gagal dijalankan.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDetecting(false);
    }
  };

  const handleReset = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      setResetting(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.reload();
    } catch (error) {
      console.error("Reset error:", error);
      setCurrentDetection(null);
      setUploadedImage(null);
      setError(null);
      setIsRealTimeMode(true);
      setLiveDetections([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setResetting(false);
    }
  };

  const handleFileInputClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (fileInputRef.current) {
      fileInputRef.current.click();
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

    return null;
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

  // 👈 Update loading overlay message
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
          {/* 👈 Tombol Save Capture untuk mode real-time */}
          {isRealTimeMode && (
            <Button
              onClick={handleSaveCapture}
              variant="success"
              type="button"
              disabled={capturingFrame || liveDetections.length === 0}>
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

      {/* 👈 Info capture tersedia */}
      {isRealTimeMode && liveDetections.length > 0 && (
        <Card className="mb-6 p-4 bg-green-50 border-green-200">
          <p className="text-green-700">
            <strong>📸 Capture Ready:</strong> Terdeteksi{" "}
            {liveDetections.length} objek. Klik "Save Capture" untuk menyimpan
            frame dengan deteksi.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Stream Column */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="relative">
              {loading || capturingFrame ? (
                <div className="w-full h-96 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <Loader />
                    <p className="mt-2">
                      {capturingFrame ? "Menyimpan capture..." : "Memuat..."}
                    </p>
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
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-auto min-h-[450px] max-h-[600px] object-cover bg-black"
                    style={{ aspectRatio: "16/9" }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  />
                  {isRealTimeMode && renderBoundingBoxes()}

                  {/* 👈 Overlay capture indicator */}
                  {capturingFrame && (
                    <div className="absolute inset-0 bg-white bg-opacity-30 flex items-center justify-center">
                      <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                        📸 Capturing Frame...
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-6 border-t">
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
                    ? " Kamera real-time menggunakan resolusi HD (1280x720). Ketika objek terdeteksi, Anda dapat menyimpan capture untuk analisis detail."
                    : " Gunakan gambar dengan rasio yang sesuai untuk hasil terbaik."}
                </p>
              </div>

              <div className="flex gap-2">
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
                    ? "Menyimpan capture..."
                    : isRealTimeMode
                    ? "Mode Real-time"
                    : getStatusText()}
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
                    Real-time deteksi:
                  </p>
                  <ul className="list-disc list-inside text-text-light space-y-1">
                    {liveDetections.map((detection, index) => (
                      <li key={index}>
                        {detection.label}: {Math.round(detection.score * 100)}%
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-text-light">
                  {isRealTimeMode
                    ? "Belum ada deteksi"
                    : "Pilih gambar untuk deteksi"}
                </p>
              )}
            </div>

            <div className="space-y-2 mt-6">
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

              {/* 👈 Tombol Save Capture di panel info juga */}
              {isRealTimeMode && !resetting && (
                <div className="space-y-2">
                  {liveDetections.length > 0 && (
                    <Button
                      onClick={handleSaveCapture}
                      className="w-full"
                      variant="success"
                      type="button"
                      disabled={capturingFrame}>
                      <Camera size={18} />
                      {capturingFrame ? "Menyimpan..." : "Save Capture"}
                    </Button>
                  )}
                  <div className="text-center">
                    <p className="text-sm text-text-light">
                      Mode deteksi real-time aktif
                    </p>
                    <p className="text-xs text-text-light mt-1">
                      Resolusi HD: 1280x720 (16:9)
                    </p>
                    {liveDetections.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Siap untuk capture
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
