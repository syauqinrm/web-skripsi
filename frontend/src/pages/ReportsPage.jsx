import React, { useState, useMemo } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import Modal from "../components/ui/Modal";
import {
  Download,
  Eye,
  Calendar,
  Filter,
  Search,
  FileText,
  Image as ImageIcon,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  TrendingUp,
  ZoomIn,
  Coffee,
  Award,
  Zap,
  Activity,
  Star,
  TrendingDown,
  Hash,
  Shield,
  Gauge,
  BarChart2,
  PieChart,
  Users,
  ChevronRight,
  ChevronLeft,
  Info,
  CircleCheck,
  AlertTriangle,
  Layers,
  Database,
  XCircle,
} from "lucide-react";
import { useDetections, useStats } from "../hooks/useApi"; // Import useStats
import apiService from "../services/api";

const ReportsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Ambil data deteksi per halaman dan stats global
  const { detections, loading, error, pagination, refetch } = useDetections(
    currentPage,
    12
  );

  // Ambil stats global dari backend
  const { stats, loading: statsLoading } = useStats();

  // Ambil SEMUA deteksi untuk statistik yang akurat (tanpa pagination)
  const { detections: allDetections, loading: allLoading } = useDetections(
    1,
    1000
  ); // Ambil banyak data

  // Helper functions untuk menentukan status yang benar
  const getActualDetectionStatus = (detection) => {
    if (detection.status === "failed") return "failed";
    if (detection.status === "processing") return "processing";
    if (
      detection.status === "completed" &&
      (!detection.detections_count || detection.detections_count === 0)
    ) {
      return "failed";
    }
    if (detection.status === "completed" && detection.detections_count > 0) {
      return "success";
    }
    return "unknown";
  };

  // Hitung statistik global dari semua data
  const getGlobalSuccessfulDetections = () => {
    if (!allDetections.length) return 0;
    return allDetections.filter(
      (detection) => getActualDetectionStatus(detection) === "success"
    ).length;
  };

  const getGlobalFailedDetections = () => {
    if (!allDetections.length) return 0;
    return allDetections.filter(
      (detection) => getActualDetectionStatus(detection) === "failed"
    ).length;
  };

  const getGlobalProcessingDetections = () => {
    if (!allDetections.length) return 0;
    return allDetections.filter(
      (detection) => getActualDetectionStatus(detection) === "processing"
    ).length;
  };

  const getGlobalTotalObjects = () => {
    if (!allDetections.length) return 0;
    return allDetections.reduce((sum, d) => {
      return getActualDetectionStatus(d) === "success"
        ? sum + (d.detections_count || 0)
        : sum;
    }, 0);
  };

  // Memoized calculations untuk performance dengan data global
  const globalDetectionSummary = useMemo(() => {
    if (!allDetections.length) return null;

    // Hitung dari semua data, bukan hanya halaman saat ini
    const successfulDetections = allDetections.filter(
      (d) => getActualDetectionStatus(d) === "success"
    );

    const totalSuccessfulDetections = successfulDetections.length;
    const totalFailedDetections = getGlobalFailedDetections();
    const totalProcessingDetections = getGlobalProcessingDetections();

    // Hitung total objek hanya dari deteksi yang berhasil
    const totalObjects = successfulDetections.reduce(
      (sum, d) => sum + (d.detections_count || 0),
      0
    );

    // Confidence score analysis - hanya dari deteksi berhasil
    const confidenceScores = [];
    successfulDetections.forEach((detection) => {
      if (
        detection.confidence_scores &&
        detection.confidence_scores.length > 0
      ) {
        confidenceScores.push(
          ...detection.confidence_scores.filter(
            (score) => score !== null && score !== undefined && !isNaN(score)
          )
        );
      } else if (
        detection.confidence_score !== null &&
        detection.confidence_score !== undefined &&
        !isNaN(detection.confidence_score)
      ) {
        confidenceScores.push(detection.confidence_score);
      }
    });

    const avgConfidence =
      confidenceScores.length > 0
        ? confidenceScores.reduce((sum, score) => sum + parseFloat(score), 0) /
          confidenceScores.length
        : 0;

    const minConfidence =
      confidenceScores.length > 0 ? Math.min(...confidenceScores) : 0;
    const maxConfidence =
      confidenceScores.length > 0 ? Math.max(...confidenceScores) : 0;

    // Confidence quality distribution
    const qualityDistribution = {
      veryHigh: confidenceScores.filter((s) => s >= 0.9).length,
      high: confidenceScores.filter((s) => s >= 0.7 && s < 0.9).length,
      medium: confidenceScores.filter((s) => s >= 0.5 && s < 0.7).length,
      low: confidenceScores.filter((s) => s < 0.5).length,
    };

    // Class distribution - hanya dari deteksi berhasil
    const classDistribution = {};
    successfulDetections.forEach((detection) => {
      if (
        detection.detection_classes &&
        detection.detection_classes.length > 0
      ) {
        detection.detection_classes.forEach((cls) => {
          classDistribution[cls] = (classDistribution[cls] || 0) + 1;
        });
      }
    });

    // Processing time analysis - hanya dari deteksi berhasil
    const processingTimes = successfulDetections
      .filter((d) => d.processing_time)
      .map((d) => d.processing_time);

    const avgProcessingTime =
      processingTimes.length > 0
        ? processingTimes.reduce((sum, time) => sum + time, 0) /
          processingTimes.length
        : 0;

    // Success rate berdasarkan deteksi yang benar-benar berhasil
    const actualSuccessRate =
      allDetections.length > 0
        ? (totalSuccessfulDetections / allDetections.length) * 100
        : 0;

    return {
      totalDetections: allDetections.length,
      totalSuccessfulDetections,
      totalFailedDetections,
      totalProcessingDetections,
      totalObjects,
      avgConfidence,
      minConfidence,
      maxConfidence,
      qualityDistribution,
      classDistribution,
      avgProcessingTime,
      totalConfidenceScores: confidenceScores.length,
      successRate: actualSuccessRate,
      avgObjectsPerSuccess:
        totalSuccessfulDetections > 0
          ? (totalObjects / totalSuccessfulDetections).toFixed(1)
          : 0,
    };
  }, [allDetections]);

  // Local detection summary untuk halaman saat ini (opsional untuk perbandingan)
  const currentPageSummary = useMemo(() => {
    if (!detections.length) return null;

    const successfulDetections = detections.filter(
      (d) => getActualDetectionStatus(d) === "success"
    );

    return {
      currentPageSuccessful: successfulDetections.length,
      currentPageFailed: detections.filter(
        (d) => getActualDetectionStatus(d) === "failed"
      ).length,
      currentPageTotal: detections.length,
    };
  }, [detections]);

  const handleCardClick = (detection) => {
    setSelectedDetection(detection);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDetection(null);
  };

  const handleDownloadImage = (detection, isResult = false) => {
    const url = isResult
      ? apiService.getResultImageUrl(detection.id)
      : apiService.getOriginalImageUrl(detection.id);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${detection.filename}_${isResult ? "result" : "original"}`;
    link.click();
  };

  const formatClassDistribution = (detection) => {
    if (!detection || !detection.detection_classes) return [];

    const classes = detection.detection_classes;
    const counts = {};

    classes.forEach((cls) => {
      counts[cls] = (counts[cls] || 0) + 1;
    });

    return Object.entries(counts).map(([cls, count]) => ({
      class: cls,
      count,
      label: cls.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    }));
  };

  const formatDetections = (detection) => {
    const actualStatus = getActualDetectionStatus(detection);

    if (actualStatus === "failed") {
      if (detection.status === "failed") {
        return "Deteksi gagal diproses karena error sistem atau file tidak valid.";
      } else if (
        detection.status === "completed" &&
        (!detection.detections_count || detection.detections_count === 0)
      ) {
        return "Deteksi selesai diproses namun tidak ada objek kopi yang terdeteksi dalam gambar.";
      }
      return "Proses deteksi mengalami kegagalan.";
    }

    if (actualStatus === "processing") {
      return "Deteksi sedang dalam proses...";
    }

    if (!detection || !detection.detections_count) {
      return "Tidak ada objek yang terdeteksi dalam gambar ini.";
    }

    const classDistribution = formatClassDistribution(detection);
    if (classDistribution.length === 0) {
      return `Terdeteksi ${detection.detections_count} objek tanpa klasifikasi spesifik.`;
    }

    const classText = classDistribution
      .map(({ label, count }) => `${count} ${label}`)
      .join(", ");

    return `Hasil deteksi menunjukkan ${classText} dengan total ${detection.detections_count} objek terdeteksi.`;
  };

  // Helper functions untuk confidence score
  const formatConfidenceScore = (score) => {
    if (score === null || score === undefined || isNaN(score)) return "N/A";
    const numScore = parseFloat(score);
    return `${(numScore * 100).toFixed(1)}%`;
  };

  const getConfidenceStyle = (score) => {
    if (score === null || score === undefined || isNaN(score)) {
      return "bg-gray-100 text-gray-600 border-gray-200";
    }

    const numScore = parseFloat(score);
    if (numScore >= 0.9) return "bg-green-100 text-green-800 border-green-200";
    if (numScore >= 0.7) return "bg-blue-100 text-blue-800 border-blue-200";
    if (numScore >= 0.5)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getConfidenceIcon = (score) => {
    if (score === null || score === undefined || isNaN(score)) {
      return <Hash className="w-3 h-3" />;
    }

    const numScore = parseFloat(score);
    if (numScore >= 0.9) return <Shield className="w-3 h-3" />;
    if (numScore >= 0.7) return <Star className="w-3 h-3" />;
    if (numScore >= 0.5) return <Activity className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
  };

  const getConfidenceLabel = (score) => {
    if (score === null || score === undefined || isNaN(score)) return "Unknown";

    const numScore = parseFloat(score);
    if (numScore >= 0.9) return "Very High";
    if (numScore >= 0.7) return "High";
    if (numScore >= 0.5) return "Medium";
    return "Low";
  };

  const getAverageConfidencePerDetection = (detection) => {
    if (
      !detection.confidence_scores ||
      detection.confidence_scores.length === 0
    ) {
      return detection.confidence_score || 0;
    }

    const validScores = detection.confidence_scores.filter(
      (score) => score !== null && score !== undefined && !isNaN(score)
    );

    if (validScores.length === 0) return 0;

    return (
      validScores.reduce((sum, score) => sum + parseFloat(score), 0) /
      validScores.length
    );
  };

  // Status functions tetap sama
  const getStatusIcon = (detection) => {
    const actualStatus = getActualDetectionStatus(detection);

    switch (actualStatus) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (detection) => {
    const actualStatus = getActualDetectionStatus(detection);

    const badges = {
      success: "bg-green-100 text-green-800 border-green-200",
      processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
      failed: "bg-red-100 text-red-800 border-red-200",
    };

    return badges[actualStatus] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusText = (detection) => {
    const actualStatus = getActualDetectionStatus(detection);

    switch (actualStatus) {
      case "success":
        return "berhasil";
      case "processing":
        return "processing";
      case "failed":
        if (
          detection.status === "completed" &&
          (!detection.detections_count || detection.detections_count === 0)
        ) {
          return "tidak ada objek";
        }
        return "gagal";
      default:
        return "unknown";
    }
  };

  // Filter detections untuk halaman saat ini
  const filteredDetections = detections.filter((detection) => {
    const matchesSearch = detection.filename
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter !== "all") {
      const actualStatus = getActualDetectionStatus(detection);
      if (statusFilter === "completed") {
        matchesStatus = actualStatus === "success";
      } else if (statusFilter === "failed") {
        matchesStatus = actualStatus === "failed";
      } else if (statusFilter === "processing") {
        matchesStatus = actualStatus === "processing";
      }
    }

    return matchesSearch && matchesStatus;
  });

  // Stats data menggunakan data global
  const statsData = [
    {
      title: "Total Laporan",
      value: pagination.total || (allDetections ? allDetections.length : 0),
      icon: FileText,
      color: "coffee-dark",
      bgColor: "coffee-cream",
    },
    {
      title: "Deteksi Berhasil",
      value: getGlobalSuccessfulDetections(),
      icon: CheckCircle,
      color: "green-600",
      bgColor: "green-50",
    },
    {
      title: "Deteksi Gagal",
      value: getGlobalFailedDetections(),
      icon: XCircle,
      color: "red-600",
      bgColor: "red-50",
    },
    {
      title: "Total Objek",
      value: getGlobalTotalObjects(),
      icon: Target,
      color: "coffee-light",
      bgColor: "coffee-cream",
    },
  ];

  if (loading || allLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-coffee-dark rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-coffee-dark mb-2">
            Memuat laporan...
          </h3>
          <p className="text-coffee-medium">Mengambil data deteksi terbaru</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12 bg-red-50 rounded-2xl border-2 border-red-200 shadow-coffee">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-red-800 mb-2">
          Error loading reports
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button
          onClick={refetch}
          className="bg-red-600 hover:bg-red-700 text-white">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-coffee-dark mb-2">
            Reports & Analytics
          </h1>
          <p className="text-coffee-medium text-md">
            Laporan lengkap hasil prediksi dengan analisis akurasi
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-coffee-light" />
            <span className="text-coffee-medium">Global Stats</span>
          </div>
        </div>
      </div>

      {/* Stats Cards dengan data global */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card
            key={index}
            className={`p-6 bg-gradient-to-br from-white to-${stat.bgColor} shadow-coffee hover:shadow-coffee-lg transition-all duration-300 transform hover:scale-105`}>
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-${stat.bgColor} border border-${stat.color}/20`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}`} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-coffee-dark">
                  {stat.value}
                </div>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-coffee-medium">
              {stat.title}
            </h3>
          </Card>
        ))}
      </div>

      {/* Detection Summary Section dengan statistik global */}
      {globalDetectionSummary && (
        <div className="mt-12 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Overall Summary dengan informasi global */}
            <Card className="lg:col-span-2 p-8 bg-gradient-to-br from-white to-coffee-cream/20 shadow-coffee border-0">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-coffee-dark/10 rounded-xl">
                  <BarChart2 className="w-6 h-6 text-coffee-dark" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-coffee-dark">
                    Global Detection Summary
                  </h2>
                  <p className="text-coffee-medium text-md">
                    Statistik keseluruhan dari semua{" "}
                    {globalDetectionSummary.totalDetections} laporan
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Performance Metrics */}
                <div className="space-y-6">
                  <div className="bg-coffee-cream/30 p-6 rounded-xl">
                    <h3 className="font-semibold text-coffee-dark mb-4 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Global Performance Metrics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-coffee-medium">
                          Success Rate:
                        </span>
                        <span className="font-bold text-green-600">
                          {globalDetectionSummary.successRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-coffee-medium">
                          Total Successful:
                        </span>
                        <span className="font-bold text-green-600">
                          {globalDetectionSummary.totalSuccessfulDetections}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-coffee-medium">
                          Total Failed:
                        </span>
                        <span className="font-bold text-red-600">
                          {globalDetectionSummary.totalFailedDetections}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-coffee-medium">
                          Total Objects:
                        </span>
                        <span className="font-bold text-coffee-dark">
                          {globalDetectionSummary.totalObjects}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-coffee-medium">
                          Avg Objects/Success:
                        </span>
                        <span className="font-bold text-coffee-dark">
                          {globalDetectionSummary.avgObjectsPerSuccess}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                      <Gauge className="w-4 h-4 mr-2" />
                      Global Confidence Analysis
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700">Average:</span>
                        <span className="font-bold text-blue-900">
                          {formatConfidenceScore(
                            globalDetectionSummary.avgConfidence
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700">Range:</span>
                        <span className="font-bold text-blue-900">
                          {formatConfidenceScore(
                            globalDetectionSummary.minConfidence
                          )}{" "}
                          -{" "}
                          {formatConfidenceScore(
                            globalDetectionSummary.maxConfidence
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700">Total Scores:</span>
                        <span className="font-bold text-blue-900">
                          {globalDetectionSummary.totalConfidenceScores} scores
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Quality Distribution dan Class Distribution menggunakan data global */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-4 flex items-center">
                      <PieChart className="w-4 h-4 mr-2" />
                      Global Quality Distribution
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-green-700">
                            Very High (≥90%)
                          </span>
                        </div>
                        <span className="font-bold text-green-900">
                          {globalDetectionSummary.qualityDistribution.veryHigh}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-blue-700">High (70-89%)</span>
                        </div>
                        <span className="font-bold text-blue-900">
                          {globalDetectionSummary.qualityDistribution.high}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-yellow-700">
                            Medium (50-69%)
                          </span>
                        </div>
                        <span className="font-bold text-yellow-900">
                          {globalDetectionSummary.qualityDistribution.medium}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-red-700">{`Low (<50%)`}</span>
                        </div>
                        <span className="font-bold text-red-900">
                          {globalDetectionSummary.qualityDistribution.low}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-coffee-cream/30 p-6 rounded-xl">
                    <h3 className="font-semibold text-coffee-dark mb-4 flex items-center">
                      <Database className="w-4 h-4 mr-2" />
                      Global Detection Classes
                    </h3>
                    <div className="space-y-3 max-h-32">
                      {Object.entries(
                        globalDetectionSummary.classDistribution
                      ).map(([className, count]) => (
                        <div
                          key={className}
                          className="flex justify-between items-center">
                          <span className="text-coffee-medium capitalize text-sm">
                            {className.replace("_", " ")}
                          </span>
                          <span className="font-bold text-coffee-dark bg-coffee-cream px-2 py-1 rounded-full text-xs">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Insights dengan insights global */}
            <Card className="p-8 bg-gradient-to-br from-coffee-dark to-coffee-medium text-white shadow-coffee">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">Global Insights</h3>
              </div>
              <div className="space-y-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <CircleCheck className="w-4 h-4 text-green-300" />
                    <span className="font-semibold text-green-100">
                      Global Success Rate
                    </span>
                  </div>
                  <p className="text-coffee-cream/90 text-sm">
                    {globalDetectionSummary.successRate.toFixed(1)}% dari{" "}
                    {globalDetectionSummary.totalDetections} total laporan
                    berhasil mendeteksi objek. Sistem menghitung deteksi tanpa
                    objek sebagai gagal.
                  </p>
                </div>

                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Activity className="w-4 h-4 text-blue-300" />
                    <span className="font-semibold text-blue-100">
                      Total Object Detection
                    </span>
                  </div>
                  <p className="text-coffee-cream/90 text-sm">
                    {globalDetectionSummary.totalObjects} objek terdeteksi dari{" "}
                    {globalDetectionSummary.totalSuccessfulDetections} deteksi
                    berhasil. Rata-rata{" "}
                    {globalDetectionSummary.avgObjectsPerSuccess} objek per
                    deteksi sukses.
                  </p>
                </div>

                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-300" />
                    <span className="font-semibold text-yellow-100">
                      Quality Assessment
                    </span>
                  </div>
                  <p className="text-coffee-cream/90 text-sm">
                    {globalDetectionSummary.totalFailedDetections} deteksi gagal
                    dari {globalDetectionSummary.totalDetections} total.
                    {globalDetectionSummary.totalFailedDetections >
                    globalDetectionSummary.totalSuccessfulDetections
                      ? " Perlu optimisasi model atau parameter deteksi."
                      : " Performa deteksi dalam kondisi baik."}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Reports Grid untuk halaman saat ini */}
      <div className="mt-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-coffee-dark mb-2">
            Detection Reports
          </h2>
          <p className="text-coffee-medium text-md">
            Hasil deteksi individual dengan detail analisis
          </p>
        </div>

        {/* Tambahkan filter dan search controls jika diperlukan */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-medium w-4 h-4" />
              <input
                type="text"
                placeholder="Cari nama file..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-coffee-cream rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-light focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-coffee-cream rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-light focus:border-transparent">
              <option value="all">Semua Status</option>
              <option value="completed">Berhasil</option>
              <option value="failed">Gagal</option>
            </select>
          </div>

          {/* Info halaman saat ini yang lebih detail */}
          <div className="text-right text-sm text-coffee-medium">
            <p>
              Menampilkan {(currentPage - 1) * 12 + 1}-
              {Math.min(currentPage * 12, pagination?.total || 0)}
              dari {pagination?.total || 0} total laporan
            </p>
            {currentPageSummary && (
              <p className="text-xs">
                Halaman ini: {currentPageSummary.currentPageSuccessful}{" "}
                berhasil, {currentPageSummary.currentPageFailed} gagal
              </p>
            )}
          </div>
        </div>

        {filteredDetections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDetections.map((detection) => {
              const actualStatus = getActualDetectionStatus(detection);
              return (
                <Card
                  key={detection.id}
                  className="overflow-hidden cursor-pointer hover:shadow-coffee-lg transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-white to-coffee-cream/20"
                  onClick={() => handleCardClick(detection)}>
                  {/* Card content tetap sama */}
                  <div className="relative h-48 bg-coffee-cream/30">
                    <img
                      src={
                        detection.result_path
                          ? apiService.getResultImageUrl(detection.id)
                          : apiService.getOriginalImageUrl(detection.id)
                      }
                      alt={detection.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                          detection
                        )}`}>
                        {getStatusText(detection)}
                      </span>

                      {actualStatus === "success" && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getConfidenceStyle(
                            getAverageConfidencePerDetection(detection)
                          )}`}>
                          {getConfidenceIcon(
                            getAverageConfidencePerDetection(detection)
                          )}
                          {formatConfidenceScore(
                            getAverageConfidencePerDetection(detection)
                          )}
                        </span>
                      )}
                    </div>

                    {detection.detections_count > 0 && (
                      <div className="absolute bottom-3 left-3 bg-coffee-dark/80 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {detection.detections_count} objek
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      {getStatusIcon(detection)}
                      <h3 className="font-bold text-coffee-dark text-lg truncate">
                        {detection.filename}
                      </h3>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-coffee-medium">Status:</span>
                        <span
                          className={`font-semibold ${
                            actualStatus === "success"
                              ? "text-green-600"
                              : actualStatus === "failed"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}>
                          {getStatusText(detection)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-coffee-medium">
                          Objek Terdeteksi:
                        </span>
                        <span className="font-semibold text-coffee-dark">
                          {detection.detections_count || 0}
                        </span>
                      </div>

                      {actualStatus === "success" && (
                        <div className="flex items-center justify-between">
                          <span className="text-coffee-medium">
                            Avg Confidence:
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-coffee-dark">
                              {formatConfidenceScore(
                                getAverageConfidencePerDetection(detection)
                              )}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getConfidenceStyle(
                                getAverageConfidencePerDetection(detection)
                              )}`}>
                              {getConfidenceLabel(
                                getAverageConfidencePerDetection(detection)
                              )}
                            </span>
                          </div>
                        </div>
                      )}

                      {detection.processing_time && (
                        <div className="flex items-center justify-between">
                          <span className="text-coffee-medium">
                            Waktu Proses:
                          </span>
                          <span className="font-semibold text-coffee-dark">
                            {detection.processing_time.toFixed(2)}s
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-coffee-medium">Tanggal:</span>
                        <span className="font-semibold text-coffee-dark">
                          {new Date(detection.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-coffee-medium text-coffee-medium hover:bg-coffee-medium hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(detection);
                        }}>
                        <Eye size={16} />
                        Detail
                      </Button>

                      <Button
                        size="sm"
                        className="flex-1 bg-coffee-light hover:bg-coffee-light/80 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadImage(detection, true);
                        }}>
                        Show
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center bg-gradient-to-br from-coffee-cream/30 to-white shadow-coffee">
            <div className="w-16 h-16 bg-coffee-cream rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-coffee-medium" />
            </div>
            <h3 className="text-xl font-bold text-coffee-dark mb-2">
              Belum ada laporan di halaman ini
            </h3>
            <p className="text-coffee-medium">
              {searchTerm || statusFilter !== "all"
                ? "Tidak ada hasil yang sesuai dengan filter Anda"
                : "Lakukan deteksi pertama untuk melihat laporan di sini"}
            </p>
          </Card>
        )}
      </div>

      {/* Pagination dengan informasi yang lebih akurat */}
      {pagination && pagination.total > 0 && (
        <div className="flex justify-center items-center space-x-4 p-6 bg-white rounded-2xl shadow-lg border border-coffee-cream/30">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="flex items-center space-x-2 border-coffee-medium text-coffee-medium hover:bg-coffee-medium hover:text-white disabled:opacity-50">
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center space-x-2">
            <span className="text-coffee-medium">Page</span>
            <span className="font-bold text-coffee-dark px-3 py-1 bg-coffee-cream/30 rounded">
              {currentPage}
            </span>
            <span className="text-coffee-medium">of</span>
            <span className="font-bold text-coffee-dark px-3 py-1 bg-coffee-cream/30 rounded">
              {pagination.total_pages ||
                Math.ceil((pagination.total || 0) / 12)}
            </span>
          </div>

          <Button
            variant="outline"
            disabled={
              currentPage >=
              (pagination.total_pages ||
                Math.ceil((pagination.total || 0) / 12))
            }
            onClick={() =>
              setCurrentPage(
                Math.min(
                  pagination.total_pages ||
                    Math.ceil((pagination.total || 0) / 12),
                  currentPage + 1
                )
              )
            }
            className="flex items-center space-x-2 border-coffee-medium text-coffee-medium hover:bg-coffee-medium hover:text-white disabled:opacity-50">
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Modal tetap sama seperti sebelumnya */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={
          selectedDetection ? `Detail Deteksi #${selectedDetection.id}` : ""
        }
        size="large">
        {selectedDetection && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Images Section (unchanged) */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <ImageIcon className="w-5 h-5 text-coffee-light" />
                  <h3 className="text-lg font-semibold text-coffee-dark">
                    Gambar
                  </h3>
                </div>

                {/* Original Image */}
                <div className="bg-coffee-cream/20 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-coffee-dark">
                      Gambar Asli
                    </h4>
                    <Button
                      onClick={() =>
                        handleDownloadImage(selectedDetection, false)
                      }
                      variant="outline"
                      size="sm"
                      className="border-coffee-medium text-coffee-medium hover:bg-coffee-medium hover:text-white">
                      <ZoomIn size={16} />
                      Show
                    </Button>
                  </div>
                  <img
                    src={apiService.getOriginalImageUrl(selectedDetection.id)}
                    alt="Gambar Asli"
                    className="w-full rounded-lg border border-coffee-cream shadow-coffee"
                    onError={(e) => {
                      e.target.src = "/placeholder-stream.jpg";
                    }}
                  />
                </div>

                {/* Result Image */}
                {selectedDetection.result_path && (
                  <div className="bg-coffee-cream/20 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-coffee-dark">
                        Hasil Deteksi
                      </h4>
                      <div className="flex items-center space-x-2">
                        {getActualDetectionStatus(selectedDetection) ===
                          "success" && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getConfidenceStyle(
                              getAverageConfidencePerDetection(
                                selectedDetection
                              )
                            )}`}>
                            {getConfidenceIcon(
                              getAverageConfidencePerDetection(
                                selectedDetection
                              )
                            )}
                            {formatConfidenceScore(
                              getAverageConfidencePerDetection(
                                selectedDetection
                              )
                            )}
                          </span>
                        )}
                        <Button
                          onClick={() =>
                            handleDownloadImage(selectedDetection, true)
                          }
                          variant="outline"
                          size="sm"
                          className="border-coffee-medium text-coffee-medium hover:bg-coffee-medium hover:text-white">
                          <ZoomIn size={16} />
                          Show
                        </Button>
                      </div>
                    </div>
                    <img
                      src={apiService.getResultImageUrl(selectedDetection.id)}
                      alt="Hasil Deteksi"
                      className="w-full rounded-lg border border-coffee-cream shadow-coffee"
                      onError={(e) => {
                        e.target.src = "/placeholder-stream.jpg";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Details Section dengan status yang diperbaiki */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="w-5 h-5 text-coffee-light" />
                  <h3 className="text-lg font-semibold text-coffee-dark">
                    Informasi Detail
                  </h3>
                </div>

                <div className="bg-coffee-cream/20 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-coffee-dark">
                      ID Deteksi:
                    </span>
                    <span className="bg-coffee-light/20 px-2 py-1 rounded text-coffee-dark font-mono">
                      #{selectedDetection.id}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-coffee-dark">
                      Status:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                        selectedDetection
                      )}`}>
                      {getStatusText(selectedDetection)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-coffee-dark">
                      Nama File:
                    </span>
                    <span className="text-right text-coffee-dark font-mono text-sm">
                      {selectedDetection.filename || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-coffee-dark">
                      Tanggal:
                    </span>
                    <span className="text-coffee-dark text-sm">
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

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-coffee-dark">
                      Total Deteksi:
                    </span>
                    <span
                      className={`font-bold px-3 py-1 rounded-full ${
                        getActualDetectionStatus(selectedDetection) ===
                        "success"
                          ? "text-green-600 bg-green-100"
                          : "text-red-600 bg-red-100"
                      }`}>
                      {selectedDetection.detections_count || 0} objek
                    </span>
                  </div>

                  {selectedDetection.processing_time && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-coffee-dark">
                        Waktu Proses:
                      </span>
                      <span className="text-coffee-dark font-mono">
                        {selectedDetection.processing_time.toFixed(2)} detik
                      </span>
                    </div>
                  )}
                </div>

                {/* Enhanced Confidence Score Section - hanya untuk deteksi berhasil */}
                {getActualDetectionStatus(selectedDetection) === "success" && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Gauge className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">
                        Detailed Confidence Analysis
                      </h4>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-blue-800">
                          Average Confidence:
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-blue-900">
                            {formatConfidenceScore(
                              getAverageConfidencePerDetection(
                                selectedDetection
                              )
                            )}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getConfidenceStyle(
                              getAverageConfidencePerDetection(
                                selectedDetection
                              )
                            )}`}>
                            {getConfidenceIcon(
                              getAverageConfidencePerDetection(
                                selectedDetection
                              )
                            )}
                            {getConfidenceLabel(
                              getAverageConfidencePerDetection(
                                selectedDetection
                              )
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Individual Confidence Scores */}
                      {selectedDetection.confidence_scores &&
                        selectedDetection.confidence_scores.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-blue-800">
                                Individual Scores:
                              </span>
                              <span className="text-xs text-blue-600">
                                {selectedDetection.confidence_scores.length}{" "}
                                objects
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                              {selectedDetection.confidence_scores.map(
                                (score, index) => (
                                  <div
                                    key={index}
                                    className="bg-white p-2 rounded-lg flex items-center justify-between">
                                    <span className="text-xs text-gray-600">
                                      #{index + 1}:
                                    </span>
                                    <span
                                      className={`text-xs font-semibold px-2 py-1 rounded ${getConfidenceStyle(
                                        score
                                      )}`}>
                                      {formatConfidenceScore(score)}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>

                            {/* Statistics */}
                            <div className="bg-white p-3 rounded-lg">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Min:</span>
                                  <span className="font-semibold text-gray-800 ml-2">
                                    {formatConfidenceScore(
                                      Math.min(
                                        ...selectedDetection.confidence_scores
                                      )
                                    )}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Max:</span>
                                  <span className="font-semibold text-gray-800 ml-2">
                                    {formatConfidenceScore(
                                      Math.max(
                                        ...selectedDetection.confidence_scores
                                      )
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Confidence Score</strong> mengukur tingkat
                          kepercayaan model AI terhadap setiap deteksi objek.
                          Skor yang lebih tinggi menunjukkan model lebih yakin
                          dengan hasil deteksinya.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Class Distribution - hanya untuk deteksi berhasil */}
                {getActualDetectionStatus(selectedDetection) === "success" && (
                  <div className="bg-coffee-cream/20 p-4 rounded-xl">
                    <div className="flex items-center space-x-2 mb-3">
                      <Coffee className="w-4 h-4 text-coffee-light" />
                      <h4 className="font-semibold text-coffee-dark">
                        Distribusi Kelas:
                      </h4>
                    </div>
                    {formatClassDistribution(selectedDetection).length > 0 ? (
                      <div className="space-y-2">
                        {formatClassDistribution(selectedDetection).map(
                          ({ class: cls, count, label }) => (
                            <div
                              key={cls}
                              className="flex justify-between items-center p-3 bg-white rounded-lg border border-coffee-cream hover:bg-coffee-cream/30 transition-colors">
                              <span className="font-medium text-coffee-dark">
                                {label}
                              </span>
                              <span className="bg-coffee-light text-white px-3 py-1 rounded-full text-sm font-semibold">
                                {count} objek
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-coffee-medium text-center py-4">
                        Tidak ada deteksi
                      </p>
                    )}
                  </div>
                )}

                {/* Summary dengan informasi status yang lebih jelas */}
                <div className="bg-coffee-cream/20 p-4 rounded-xl">
                  <div className="flex items-center space-x-2 mb-3">
                    <Target className="w-4 h-4 text-coffee-light" />
                    <h4 className="font-semibold text-coffee-dark">
                      Ringkasan:
                    </h4>
                  </div>
                  <p className="text-coffee-dark leading-relaxed">
                    {formatDetections(selectedDetection)}
                  </p>
                </div>

                {/* ESP32 IP and Capture Method */}
                <div className="bg-coffee-cream/20 p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-coffee-dark">
                      Source:
                    </span>
                    <span className="text-coffee-dark font-mono text-sm">
                      {selectedDetection.esp32_ip || "Manual Upload"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-coffee-dark">
                      Capture Method:
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedDetection.capture_method === "live-stream"
                          ? "bg-blue-100 text-blue-800"
                          : selectedDetection.capture_method === "esp32-direct"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                      {selectedDetection.capture_method || "upload"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportsPage;
