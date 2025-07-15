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
  Info,
  CircleCheck,
  AlertTriangle,
  Layers,
  Database,
} from "lucide-react";
import { useDetections } from "../hooks/useApi";
import apiService from "../services/api";

const ReportsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const { detections, loading, error, pagination, refetch } = useDetections(
    currentPage,
    12
  );

  // Memoized calculations untuk performance
  const detectionSummary = useMemo(() => {
    if (!detections.length) return null;

    const validDetections = detections.filter((d) => d.status === "completed");
    const totalDetections = validDetections.length;
    const totalObjects = validDetections.reduce(
      (sum, d) => sum + (d.detections_count || 0),
      0
    );

    // Confidence score analysis
    const confidenceScores = [];
    validDetections.forEach((detection) => {
      if (detection.confidence_scores && detection.confidence_scores.length > 0) {
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

    const minConfidence = confidenceScores.length > 0 ? Math.min(...confidenceScores) : 0;
    const maxConfidence = confidenceScores.length > 0 ? Math.max(...confidenceScores) : 0;

    // Confidence quality distribution
    const qualityDistribution = {
      veryHigh: confidenceScores.filter((s) => s >= 0.9).length,
      high: confidenceScores.filter((s) => s >= 0.7 && s < 0.9).length,
      medium: confidenceScores.filter((s) => s >= 0.5 && s < 0.7).length,
      low: confidenceScores.filter((s) => s < 0.5).length,
    };

    // Class distribution
    const classDistribution = {};
    validDetections.forEach((detection) => {
      if (detection.detection_classes && detection.detection_classes.length > 0) {
        detection.detection_classes.forEach((cls) => {
          classDistribution[cls] = (classDistribution[cls] || 0) + 1;
        });
      }
    });

    // Processing time analysis
    const processingTimes = validDetections
      .filter((d) => d.processing_time)
      .map((d) => d.processing_time);

    const avgProcessingTime =
      processingTimes.length > 0
        ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
        : 0;

    return {
      totalDetections,
      totalObjects,
      avgConfidence,
      minConfidence,
      maxConfidence,
      qualityDistribution,
      classDistribution,
      avgProcessingTime,
      totalConfidenceScores: confidenceScores.length,
      successRate: detections.length > 0 ? (totalDetections / detections.length) * 100 : 0,
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
    if (numScore >= 0.5) return "bg-yellow-100 text-yellow-800 border-yellow-200";
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

  // Helper function untuk menghitung rata-rata confidence per detection
  const getAverageConfidencePerDetection = (detection) => {
    if (!detection.confidence_scores || detection.confidence_scores.length === 0) {
      return detection.confidence_score || 0;
    }

    const validScores = detection.confidence_scores.filter(
      (score) => score !== null && score !== undefined && !isNaN(score)
    );

    if (validScores.length === 0) return 0;

    return validScores.reduce((sum, score) => sum + parseFloat(score), 0) / validScores.length;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: "bg-green-100 text-green-800 border-green-200",
      processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      uploaded: "bg-blue-100 text-blue-800 border-blue-200",
    };

    return badges[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Filter detections based on search and filters
  const filteredDetections = detections.filter((detection) => {
    const matchesSearch = detection.filename
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || detection.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statsData = [
    {
      title: "Total Laporan",
      value: pagination.total || 0,
      icon: FileText,
      color: "coffee-dark",
      bgColor: "coffee-cream",
    },
    {
      title: "Deteksi Berhasil",
      value: detections.filter((d) => d.status === "completed").length,
      icon: CheckCircle,
      color: "green-600",
      bgColor: "green-50",
    },
    {
      title: "Total Objek",
      value: detections.reduce((sum, d) => sum + (d.detections_count || 0), 0),
      icon: Target,
      color: "coffee-light",
      bgColor: "coffee-cream",
    },
    {
      title: "Avg Confidence",
      value: detectionSummary ? formatConfidenceScore(detectionSummary.avgConfidence) : "N/A",
      icon: Gauge,
      color: "blue-600",
      bgColor: "blue-50",
    },
  ];

  if (loading) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-coffee-dark mb-2">
            Reports & Analytics
          </h1>
          <p className="text-coffee-medium text-lg">
            Laporan lengkap hasil prediksi dengan confidence score analysis
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-coffee-light" />
          <span className="text-coffee-medium">Real-time updates</span>
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* Detection Summary Section */}
      {detectionSummary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Summary */}
          <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-white to-coffee-cream/20 shadow-coffee border-0">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-coffee-dark/10 rounded-xl">
                <BarChart2 className="w-6 h-6 text-coffee-dark" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-coffee-dark">
                  Detection Summary
                </h2>
                <p className="text-coffee-medium">Ringkasan total tingkat deteksi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Performance Metrics */}
              <div className="space-y-4">
                <div className="bg-coffee-cream/30 p-4 rounded-xl">
                  <h3 className="font-semibold text-coffee-dark mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Performance Metrics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-coffee-medium">Success Rate:</span>
                      <span className="font-bold text-green-600">
                        {detectionSummary.successRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-coffee-medium">Avg Processing Time:</span>
                      <span className="font-bold text-coffee-dark">
                        {detectionSummary.avgProcessingTime.toFixed(2)}s
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-coffee-medium">Objects per Detection:</span>
                      <span className="font-bold text-coffee-dark">
                        {detectionSummary.totalDetections > 0
                          ? (detectionSummary.totalObjects / detectionSummary.totalDetections).toFixed(1)
                          : "0"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Gauge className="w-4 h-4 mr-2" />
                    Confidence Analysis
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">Average:</span>
                      <span className="font-bold text-blue-900">
                        {formatConfidenceScore(detectionSummary.avgConfidence)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">Range:</span>
                      <span className="font-bold text-blue-900">
                        {formatConfidenceScore(detectionSummary.minConfidence)} -{" "}
                        {formatConfidenceScore(detectionSummary.maxConfidence)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">Total Scores:</span>
                      <span className="font-bold text-blue-900">
                        {detectionSummary.totalConfidenceScores}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Quality Distribution */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                    <PieChart className="w-4 h-4 mr-2" />
                    Quality Distribution
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-green-700">Very High (≥90%)</span>
                      </div>
                      <span className="font-bold text-green-900">
                        {detectionSummary.qualityDistribution.veryHigh}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-700">High (70-89%)</span>
                      </div>
                      <span className="font-bold text-blue-900">
                        {detectionSummary.qualityDistribution.high}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-yellow-700">Medium (50-69%)</span>
                      </div>
                      <span className="font-bold text-yellow-900">
                        {detectionSummary.qualityDistribution.medium}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-red-700">{`Low (<50%)`}</span>
                      </div>
                      <span className="font-bold text-red-900">
                        {detectionSummary.qualityDistribution.low}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-coffee-cream/30 p-4 rounded-xl">
                  <h3 className="font-semibold text-coffee-dark mb-3 flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    Detection Classes
                  </h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Object.entries(detectionSummary.classDistribution).map(
                      ([className, count]) => (
                        <div key={className} className="flex justify-between items-center">
                          <span className="text-coffee-medium capitalize text-sm">
                            {className.replace("_", " ")}
                          </span>
                          <span className="font-bold text-coffee-dark bg-coffee-cream px-2 py-1 rounded-full text-xs">
                            {count}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Insights */}
          <Card className="p-6 bg-gradient-to-br from-coffee-dark to-coffee-medium text-white shadow-coffee">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-white/10 rounded-lg">
                <Info className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Quick Insights</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CircleCheck className="w-4 h-4 text-green-300" />
                  <span className="font-semibold text-green-100">Model Performance</span>
                </div>
                <p className="text-coffee-cream/90 text-sm">
                  {detectionSummary.avgConfidence >= 0.8
                    ? "Excellent performance with high confidence scores"
                    : detectionSummary.avgConfidence >= 0.6
                    ? "Good performance with reliable detections"
                    : "Model needs improvement for better accuracy"}
                </p>
              </div>

              <div className="bg-white/10 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-300" />
                  <span className="font-semibold text-blue-100">Detection Rate</span>
                </div>
                <p className="text-coffee-cream/90 text-sm">
                  {detectionSummary.successRate >= 90
                    ? "Excellent success rate with consistent results"
                    : detectionSummary.successRate >= 70
                    ? "Good success rate with room for improvement"
                    : "Consider optimizing detection parameters"}
                </p>
              </div>

              <div className="bg-white/10 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-300" />
                  <span className="font-semibold text-yellow-100">Quality Check</span>
                </div>
                <p className="text-coffee-cream/90 text-sm">
                  {detectionSummary.qualityDistribution.veryHigh >= detectionSummary.qualityDistribution.low
                    ? "High quality detections dominate the results"
                    : "Consider reviewing low confidence detections"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      {/* <Card className="p-6 bg-gradient-to-r from-coffee-cream/30 to-white shadow-coffee">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-medium w-5 h-5" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama file..."
              className="w-full pl-10 pr-4 py-3 border border-coffee-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-light focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <select
              className="px-4 py-3 border border-coffee-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-light text-coffee-dark"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Semua Status</option>
              <option value="completed">Completed</option>
              <option value="uploaded">Uploaded</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </Card> */}

      {/* Reports Grid */}
      {filteredDetections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDetections.map((detection) => (
            <Card
              key={detection.id}
              className="overflow-hidden cursor-pointer hover:shadow-coffee-lg transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-white to-coffee-cream/20"
              onClick={() => handleCardClick(detection)}>
              {/* Image Preview */}
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
                      detection.status
                    )}`}>
                    {detection.status}
                  </span>

                  {/* Confidence Score Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getConfidenceStyle(
                      getAverageConfidencePerDetection(detection)
                    )}`}>
                    {getConfidenceIcon(getAverageConfidencePerDetection(detection))}
                    {formatConfidenceScore(getAverageConfidencePerDetection(detection))}
                  </span>
                </div>

                {detection.detections_count > 0 && (
                  <div className="absolute bottom-3 left-3 bg-coffee-dark/80 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {detection.detections_count} deteksi
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  {getStatusIcon(detection.status)}
                  <h3 className="font-bold text-coffee-dark text-lg truncate">
                    {detection.filename}
                  </h3>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-coffee-medium">
                      Objek Terdeteksi:
                    </span>
                    <span className="font-semibold text-coffee-dark">
                      {detection.detections_count || 0}
                    </span>
                  </div>

                  {/* Confidence Score Display */}
                  <div className="flex items-center justify-between">
                    <span className="text-coffee-medium">Avg Confidence:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-coffee-dark">
                        {formatConfidenceScore(getAverageConfidencePerDetection(detection))}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceStyle(getAverageConfidencePerDetection(detection))}`}>
                        {getConfidenceLabel(getAverageConfidencePerDetection(detection))}
                      </span>
                    </div>
                  </div>

                  {detection.processing_time && (
                    <div className="flex items-center justify-between">
                      <span className="text-coffee-medium">Waktu Proses:</span>
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

                {/* Action Buttons */}
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
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center bg-gradient-to-br from-coffee-cream/30 to-white shadow-coffee">
          <div className="w-16 h-16 bg-coffee-cream rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-coffee-medium" />
          </div>
          <h3 className="text-xl font-bold text-coffee-dark mb-2">
            Belum ada laporan
          </h3>
          <p className="text-coffee-medium">
            {searchTerm || statusFilter !== "all"
              ? "Tidak ada hasil yang sesuai dengan filter Anda"
              : "Lakukan deteksi pertama untuk melihat laporan di sini"}
          </p>
        </Card>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="border-coffee-medium text-coffee-medium hover:bg-coffee-medium hover:text-white">
            Previous
          </Button>

          <div className="flex space-x-1">
            {[...Array(pagination.total_pages)].map((_, index) => (
              <Button
                key={index + 1}
                variant={currentPage === index + 1 ? "primary" : "outline"}
                className={
                  currentPage === index + 1
                    ? "bg-coffee-dark text-white"
                    : "border-coffee-medium text-coffee-medium hover:bg-coffee-medium hover:text-white"
                }
                onClick={() => setCurrentPage(index + 1)}>
                {index + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            disabled={currentPage === pagination.total_pages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="border-coffee-medium text-coffee-medium hover:bg-coffee-medium hover:text-white">
            Next
          </Button>
        </div>
      )}

      {/* Modal dengan Enhanced Confidence Score Details */}
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
              {/* Images Section */}
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
                      onClick={() => handleDownloadImage(selectedDetection, false)}
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
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getConfidenceStyle(
                            getAverageConfidencePerDetection(selectedDetection)
                          )}`}>
                          {getConfidenceIcon(getAverageConfidencePerDetection(selectedDetection))}
                          {formatConfidenceScore(getAverageConfidencePerDetection(selectedDetection))}
                        </span>
                        <Button
                          onClick={() => handleDownloadImage(selectedDetection, true)}
                          variant="outline"
                          size="sm"
                          className="border-coffee-medium text-coffee-medium hover:bg-coffee-medium hover:text-white">
                          <ZoomIn size={16} />Show
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

              {/* Details Section */}
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
                        selectedDetection.status
                      )}`}>
                      {selectedDetection.status}
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
                    <span className="font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
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

                {/* Enhanced Confidence Score Section */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Gauge className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">
                      Detailed Confidence Analysis
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-800">Average Confidence:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-blue-900">
                          {formatConfidenceScore(getAverageConfidencePerDetection(selectedDetection))}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getConfidenceStyle(
                            getAverageConfidencePerDetection(selectedDetection)
                          )}`}>
                          {getConfidenceIcon(getAverageConfidencePerDetection(selectedDetection))}
                          {getConfidenceLabel(getAverageConfidencePerDetection(selectedDetection))}
                        </span>
                      </div>
                    </div>

                    {/* Individual Confidence Scores */}
                    {selectedDetection.confidence_scores && selectedDetection.confidence_scores.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-800">Individual Scores:</span>
                          <span className="text-xs text-blue-600">
                            {selectedDetection.confidence_scores.length} objects
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {selectedDetection.confidence_scores.map((score, index) => (
                            <div key={index} className="bg-white p-2 rounded-lg flex items-center justify-between">
                              <span className="text-xs text-gray-600">#{index + 1}:</span>
                              <span className={`text-xs font-semibold px-2 py-1 rounded ${getConfidenceStyle(score)}`}>
                                {formatConfidenceScore(score)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Statistics */}
                        <div className="bg-white p-3 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Min:</span>
                              <span className="font-semibold text-gray-800 ml-2">
                                {formatConfidenceScore(Math.min(...selectedDetection.confidence_scores))}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Max:</span>
                              <span className="font-semibold text-gray-800 ml-2">
                                {formatConfidenceScore(Math.max(...selectedDetection.confidence_scores))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Confidence Score</strong> mengukur tingkat kepercayaan model AI terhadap setiap deteksi objek.
                        Skor yang lebih tinggi menunjukkan model lebih yakin dengan hasil deteksinya.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Class Distribution */}
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

                {/* Summary */}
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
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportsPage;
