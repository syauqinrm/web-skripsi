import React, { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import Modal from "../components/ui/Modal"; // 👈 Import Modal
import { useDetections } from "../hooks/useApi";
import apiService from "../services/api";
import { Download, Eye } from "lucide-react";

const ReportsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { detections, loading, error, pagination, refetch } = useDetections(
    currentPage,
    12
  );

  const handleCardClick = (detection) => {
    console.log("Card clicked:", detection); // 👈 Debug
    setSelectedDetection(detection);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDetection(null);
  };

  // 👈 Debug state
  useEffect(() => {
    console.log("Modal state:", { showModal, selectedDetection });
  }, [showModal, selectedDetection]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatDetections = (detection) => {
    if (
      !detection.detection_classes ||
      detection.detection_classes.length === 0
    ) {
      return "Tidak ada deteksi";
    }

    // Count each class
    const classCounts = {};
    detection.detection_classes.forEach((cls) => {
      classCounts[cls] = (classCounts[cls] || 0) + 1;
    });

    // Format as "2 Medium, 1 Dark"
    return Object.entries(classCounts)
      .map(([cls, count]) => `${count} ${cls.replace("_", " ")}`)
      .join(", ");
  };

  const handleDownloadImage = (detection, isResult) => {
    const url = isResult
      ? apiService.getResultImageUrl(detection.id)
      : apiService.getOriginalImageUrl(detection.id);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${detection.id}_${isResult ? "result" : "original"}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatClassDistribution = (detection) => {
    if (!detection.detection_classes) return [];

    // Count occurrences of each class
    const classCounts = detection.detection_classes.reduce((acc, cls) => {
      const key = cls.replace("_", " ");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // Convert to array of objects
    return Object.entries(classCounts).map(([cls, count]) => ({
      class: cls,
      count,
      label: cls.charAt(0).toUpperCase() + cls.slice(1), // Capitalize first letter
    }));
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Error loading reports: {error}</p>
        <Button onClick={refetch} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-main">Laporan Deteksi</h1>
        <Button onClick={refetch} variant="primary">
          Refresh
        </Button>
      </div>

      {detections.length === 0 ? (
        <Card className="text-center p-8">
          <p className="text-text-light">Belum ada laporan deteksi</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {detections.map((detection) => (
              <Card
                key={detection.id}
                className="p-0 overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => handleCardClick(detection)}>
                <div className="relative">
                  <img
                    src={
                      detection.result_path
                        ? apiService.getResultImageUrl(detection.id)
                        : apiService.getOriginalImageUrl(detection.id)
                    }
                    alt={`Deteksi ${detection.id}`}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.src = "/placeholder-stream.jpg";
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 rounded text-xs text-white ${
                        detection.status === "completed"
                          ? "bg-green-500"
                          : detection.status === "processing"
                          ? "bg-yellow-500"
                          : detection.status === "failed"
                          ? "bg-red-500"
                          : "bg-gray-500"
                      }`}>
                      {detection.status}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                        <Eye size={16} />
                        Klik untuk detail
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-text-light">
                    {new Date(detection.created_at).toLocaleString("en-GB", {
                      hour12: false,
                    })}
                  </p>
                  <h3 className="font-semibold text-text-main mt-1">
                    Hasil: {formatDetections(detection)}
                  </h3>
                  {detection.processing_time && (
                    <p className="text-xs text-text-light mt-1">
                      Waktu proses: {detection.processing_time.toFixed(2)}s
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline">
                Previous
              </Button>

              <span className="px-4 py-2">
                Page {currentPage} of {pagination.pages}
              </span>

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                variant="outline">
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* 👈 Modal dengan component terpisah */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={
          selectedDetection ? `Detail Deteksi #${selectedDetection.id}` : ""
        }
        size="large">
        {selectedDetection && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Images Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Gambar</h3>

              {/* Original Image */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Gambar Asli</h4>
                  <Button
                    onClick={() =>
                      handleDownloadImage(selectedDetection, false)
                    }
                    variant="outline"
                    size="sm">
                    <Download size={16} />
                    Download
                  </Button>
                </div>
                <img
                  src={apiService.getOriginalImageUrl(selectedDetection.id)}
                  alt="Gambar Asli"
                  className="w-full rounded-lg border"
                  onError={(e) => {
                    e.target.src = "/placeholder-stream.jpg";
                  }}
                />
              </div>

              {/* Result Image */}
              {selectedDetection.result_path && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Hasil Deteksi</h4>
                    <Button
                      onClick={() =>
                        handleDownloadImage(selectedDetection, true)
                      }
                      variant="outline"
                      size="sm">
                      <Download size={16} />
                      Download
                    </Button>
                  </div>
                  <img
                    src={apiService.getResultImageUrl(selectedDetection.id)}
                    alt="Hasil Deteksi"
                    className="w-full rounded-lg border"
                    onError={(e) => {
                      e.target.src = "/placeholder-stream.jpg";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informasi Detail</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">ID Deteksi:</span>
                  <span>#{selectedDetection.id}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs text-white ${
                      selectedDetection.status === "completed"
                        ? "bg-green-500"
                        : selectedDetection.status === "processing"
                        ? "bg-yellow-500"
                        : selectedDetection.status === "failed"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}>
                    {selectedDetection.status}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Nama File:</span>
                  <span className="text-right">
                    {selectedDetection.filename || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Tanggal:</span>
                  <span>
                    {new Date(selectedDetection.created_at).toLocaleString(
                      "id-ID",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Total Deteksi:</span>
                  <span className="font-semibold text-green-600">
                    {selectedDetection.detections_count || 0} objek
                  </span>
                </div>

                {selectedDetection.processing_time && (
                  <div className="flex justify-between">
                    <span className="font-medium">Waktu Proses:</span>
                    <span>
                      {selectedDetection.processing_time.toFixed(2)} detik
                    </span>
                  </div>
                )}
              </div>

              {/* Class Distribution */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Distribusi Kelas:</h4>
                {formatClassDistribution(selectedDetection).length > 0 ? (
                  <div className="space-y-2">
                    {formatClassDistribution(selectedDetection).map(
                      ({ class: cls, count, label }) => (
                        <div
                          key={cls}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium">{label}</span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {count} objek
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Tidak ada deteksi</p>
                )}
              </div>

              {/* Summary */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Ringkasan:</h4>
                <p className="text-gray-600">
                  {formatDetections(selectedDetection)}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportsPage;
