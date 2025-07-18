import React from "react";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import {
  CheckCircle,
  BarChart,
  Clock,
  Image as ImageIcon,
  Activity,
  Target,
  Coffee,
  Package,
} from "lucide-react";
import { useStats, useDetections } from "../hooks/useApi";

const DashboardPage = () => {
  const { stats, loading: statsLoading, error: statsError } = useStats();
  const { detections, loading: detectionsLoading } = useDetections(1, 50);

  // Calculate total objects detected
  const getTotalObjects = () => {
    if (!detections.length) return 0;
    return detections.reduce((total, detection) => {
      return total + (detection.detections_count || 0);
    }, 0);
  };

  // Calculate average objects per detection
  const getAverageObjects = () => {
    if (!detections.length) return 0;
    const totalObjects = getTotalObjects();
    return (totalObjects / detections.length).toFixed(1);
  };

  // Calculate successful detections (completed AND has objects)
  const getSuccessfulDetections = () => {
    if (!detections.length) return 0;
    return detections.filter(
      (detection) =>
        detection.status === "completed" && detection.detections_count > 0
    ).length;
  };

  // Calculate failed detections (failed OR no objects detected)
  const getFailedDetections = () => {
    if (!detections.length) return 0;
    return detections.filter(
      (detection) =>
        detection.status === "failed" ||
        (detection.status === "completed" && detection.detections_count === 0)
    ).length;
  };

  // Calculate success rate based on object detection
  const getActualSuccessRate = () => {
    if (!detections.length) return 0;
    const successfulDetections = getSuccessfulDetections();
    return ((successfulDetections / detections.length) * 100).toFixed(1);
  };

  // Get detections with objects only
  const getDetectionsWithObjects = () => {
    return detections.filter((detection) => detection.detections_count > 0);
  };

  // Calculate average objects per successful detection
  const getAverageObjectsPerSuccess = () => {
    const detectionsWithObjects = getDetectionsWithObjects();
    if (!detectionsWithObjects.length) return 0;
    const totalObjects = getTotalObjects();
    return (totalObjects / detectionsWithObjects.length).toFixed(1);
  };

  // Format waktu terakhir
  const getLastDetectionTime = () => {
    if (detections.length === 0) return "Belum ada";

    const lastDetection = detections[0];
    const lastTime = new Date(lastDetection.created_at);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastTime) / (1000 * 60));

    if (diffMinutes < 1) return "Baru saja";
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  };

  // Dapatkan level roasting terbanyak
  const getMostCommonRoast = () => {
    if (!stats.class_distribution) return "Belum ada data";

    const classes = stats.class_distribution;
    const maxClass = Object.keys(classes).reduce(
      (a, b) => (classes[a] > classes[b] ? a : b),
      Object.keys(classes)[0]
    );

    return maxClass?.replace("_", " ").toUpperCase() || "Belum ada data";
  };

  // Hitung status deteksi terakhir
  const getLastDetectionStatus = () => {
    if (!detections.length) return "Tidak ada";

    const lastDetection = detections[0];
    const lastTime = new Date(lastDetection.created_at);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastTime) / (1000 * 60));

    if (diffMinutes < 5) return "Tersimpan";
    if (diffMinutes < 30) return "Tersimpan";
    return "Idle";
  };

  // Hitung popularitas level roasting
  const getRoastPopularity = () => {
    if (!stats.class_distribution) return "N/A";

    const classes = stats.class_distribution;
    const total = Object.values(classes).reduce((sum, count) => sum + count, 0);
    const maxCount = Math.max(...Object.values(classes));
    const percentage = total > 0 ? (maxCount / total) * 100 : 0;

    return `${percentage.toFixed(1)}%`;
  };

  // Get detection status with proper logic
  const getDetectionDisplayStatus = (detection) => {
    if (detection.status === "processing") return "processing";
    if (detection.status === "failed") return "failed";
    if (detection.status === "completed" && detection.detections_count === 0)
      return "no_objects";
    if (detection.status === "completed" && detection.detections_count > 0)
      return "success";
    return "unknown";
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "processing":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      case "no_objects":
        return "bg-orange-500";
      default:
        return "bg-gray-400";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "success":
        return "berhasil";
      case "processing":
        return "processing";
      case "failed":
        return "gagal";
      case "no_objects":
        return "tidak ada objek";
      default:
        return "unknown";
    }
  };

  // Fixed: Pre-defined color classes untuk distribusi kelas
  const getClassColor = (index) => {
    const colors = [
      "#2C3930", // coffee-dark
      "#5F8B4C", // coffee-green
      "#B99470", // coffee-light
      "#876445", // coffee-medium
      "#10B981", // emerald-500
      "#8B5CF6", // violet-500
    ];
    return colors[index % colors.length];
  };

  const summaryData = [
    {
      title: "Total Deteksi",
      value: detections.length || 0,
      icon: Target,
      color: "coffee-dark",
      bgColor: "coffee-dark/10",
      subtitle: "Total keseluruhan",
    },
    {
      title: "Total Objek",
      value: getTotalObjects(),
      icon: Package,
      color: "blue-600",
      bgColor: "blue-100",
      subtitle: "Objek terdeteksi",
    },
    {
      title: "Deteksi Berhasil",
      value: getSuccessfulDetections(),
      icon: CheckCircle,
      color: "emerald-600",
      bgColor: "emerald-100",
      subtitle: "Ada objek terdeteksi",
    },
    {
      title: "Deteksi Terakhir",
      value: getLastDetectionTime(),
      icon: Clock,
      color: "emerald-500",
      bgColor: "coffee-light/10",
      subtitle: getLastDetectionStatus(),
    },
    {
      title: "Level Terbanyak",
      value: getMostCommonRoast(),
      icon: Coffee,
      color: "amber-600",
      bgColor: "amber-100",
      subtitle: getRoastPopularity(),
    },
  ];

  if (statsLoading || detectionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-coffee-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="text-center p-12 bg-red-50 rounded-2xl border border-red-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-red-800 mb-2">
          Error loading dashboard
        </h3>
        <p className="text-red-600">{statsError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-coffee-dark mb-2">
            Dashboard
          </h1>
          <p className="text-coffee-medium text-lg">
            Prediksi tingkat roasting biji kopi
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-3 bg-gradient-to-r from-coffee-light to-amber-600 text-white px-6 py-3 rounded-xl shadow-coffee">
            <Activity className="w-5 h-5" />
            <span className="font-semibold">System Active</span>
          </div>
        </div>
      </div>

      {/* Summary Cards - With corrected logic */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {summaryData.map((item, index) => (
          <Card
            key={index}
            className="p-6 hover:shadow-coffee-lg transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-white to-coffee-cream/20">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${item.bgColor}`}>
                <item.icon className={`w-6 h-6 text-${item.color}`} />
              </div>
            </div>

            <div>
              <p className="text-sm text-coffee-medium font-medium mb-1">
                {item.title}
              </p>
              <p className="text-2xl font-bold text-coffee-dark mb-1">
                {item.value}
              </p>
              <p className="text-xs text-coffee-medium">{item.subtitle}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Enhanced Summary Info Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">System Status</h3>
              <p className="text-sm text-blue-700">
                Sistem detection berjalan normal dengan performance optimal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">
                Detection Summary
              </h3>
              <p className="text-sm text-green-700">
                {getTotalObjects()} objek dari{" "}
                {getDetectionsWithObjects().length} deteksi berhasil
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">Success Rate</h3>
              <p className="text-sm text-purple-700">
                {getActualSuccessRate()}% berhasil menemukan objek
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900">Detection Stats</h3>
              <p className="text-sm text-orange-700">
                Avg: {getAverageObjectsPerSuccess()} objek per deteksi berhasil
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="p-6 border-0 bg-gradient-to-br from-white to-coffee-cream/10 shadow-coffee">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-coffee-dark/10 rounded-lg">
                  <Activity className="w-5 h-5 text-coffee-dark" />
                </div>
                <h2 className="text-xl font-bold text-coffee-dark">
                  Aktivitas Terkini
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-coffee-light" />
                <span className="text-sm text-coffee-medium">
                  {detections.length} total • {getSuccessfulDetections()}{" "}
                  berhasil
                </span>
              </div>
            </div>

            {detections.length > 0 ? (
              <div className="space-y-4">
                {detections.slice(0, 8).map((detection) => {
                  const displayStatus = getDetectionDisplayStatus(detection);
                  return (
                    <div
                      key={detection.id}
                      className="flex items-center justify-between p-4 bg-coffee-cream/30 rounded-xl border border-coffee-cream hover:bg-coffee-cream/50 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-3 h-3 rounded-full ${getStatusColor(
                            displayStatus
                          )}`}></div>
                        <div>
                          <p className="font-semibold text-coffee-dark">
                            {detection.filename}
                          </p>
                          <p className="text-sm text-coffee-medium">
                            {detection.detections_count} objek •{" "}
                            {getStatusText(displayStatus)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-coffee-medium bg-coffee-cream px-2 py-1 rounded-full">
                          {new Date(detection.created_at).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-coffee-cream rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-coffee-medium" />
                </div>
                <p className="text-coffee-medium">
                  Belum ada aktivitas deteksi
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Class Distribution */}
        <div>
          <Card className="p-6 border-0 bg-gradient-to-br from-white to-coffee-cream/10 shadow-coffee">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-coffee-light/10 rounded-lg">
                <BarChart className="w-5 h-5 text-coffee-light" />
              </div>
              <h2 className="text-xl font-bold text-coffee-dark">
                Distribusi Kelas
              </h2>
            </div>

            {stats.class_distribution ? (
              <div className="space-y-4">
                {Object.entries(stats.class_distribution).map(
                  ([className, count], index) => {
                    const percentage =
                      (count /
                        Object.values(stats.class_distribution).reduce(
                          (a, b) => a + b,
                          0
                        )) *
                      100;

                    return (
                      <div key={className} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: getClassColor(index),
                              }}></div>
                            <span className="font-medium text-coffee-dark capitalize">
                              {className.replace("_", " ")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-coffee-dark">
                              {count}
                            </span>
                            <span className="text-xs text-coffee-medium">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-coffee-cream/50 rounded-full h-3 border border-coffee-cream">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: getClassColor(index),
                            }}></div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-coffee-cream rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart className="w-6 h-6 text-coffee-medium" />
                </div>
                <p className="text-coffee-medium">Belum ada data distribusi</p>
              </div>
            )}
          </Card>

          {/* Enhanced Quick Stats */}
          <Card className="p-6 mt-6 border-0 bg-gradient-to-br from-coffee-dark to-coffee-medium text-white shadow-coffee">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Coffee className="w-5 h-5 mr-2" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-coffee-cream/80">Success Rate</span>
                <span className="font-bold">{getActualSuccessRate()}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-coffee-cream/80">Total Objects</span>
                <span className="font-bold text-yellow-300">
                  {getTotalObjects()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-coffee-cream/80">
                  Successful Detections
                </span>
                <span className="font-bold text-green-300">
                  {getSuccessfulDetections()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-coffee-cream/80">Failed Detections</span>
                <span className="font-bold text-red-300">
                  {getFailedDetections()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-coffee-cream/80">Avg per Success</span>
                <span className="font-bold">
                  {getAverageObjectsPerSuccess()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-coffee-cream/80">Total Classes</span>
                <span className="font-bold">
                  {stats.class_distribution
                    ? Object.keys(stats.class_distribution).length
                    : 0}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
