import React, { useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import { useDetections } from "../hooks/useApi";
import apiService from "../services/api";

const ReportsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { detections, loading, error, pagination, refetch } = useDetections(
    currentPage,
    12
  );

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
              <Card key={detection.id} className="p-0 overflow-hidden group">
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
    </div>
  );
};

export default ReportsPage;
