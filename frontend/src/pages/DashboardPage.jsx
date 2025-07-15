import React from "react";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import {
  CheckCircle,
  BarChart,
  Clock,
  Image as ImageIcon,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Coffee,
} from "lucide-react";
import { useStats, useDetections } from "../hooks/useApi";

const DashboardPage = () => {
  const { stats, loading: statsLoading, error: statsError } = useStats();
  const { detections, loading: detectionsLoading } = useDetections(1, 50);

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

  // Hitung trend berdasarkan data real
  const calculateTrend = (type) => {
    if (!detections.length) return { value: "0%", isPositive: null };

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = detections.filter(
      (d) => new Date(d.created_at) >= sevenDaysAgo
    );
    const lastWeek = detections.filter(
      (d) =>
        new Date(d.created_at) >= fourteenDaysAgo &&
        new Date(d.created_at) < sevenDaysAgo
    );

    let thisWeekValue = 0;
    let lastWeekValue = 0;

    switch (type) {
      case "total":
        thisWeekValue = thisWeek.length;
        lastWeekValue = lastWeek.length;
        break;
      case "completed":
        thisWeekValue = thisWeek.filter((d) => d.status === "completed").length;
        lastWeekValue = lastWeek.filter((d) => d.status === "completed").length;
        break;
      case "success_rate":
        const thisWeekCompleted = thisWeek.filter(
          (d) => d.status === "completed"
        ).length;
        const lastWeekCompleted = lastWeek.filter(
          (d) => d.status === "completed"
        ).length;
        thisWeekValue = thisWeek.length
          ? (thisWeekCompleted / thisWeek.length) * 100
          : 0;
        lastWeekValue = lastWeek.length
          ? (lastWeekCompleted / lastWeek.length) * 100
          : 0;
        break;
      default:
        return { value: "N/A", isPositive: null };
    }

    if (lastWeekValue === 0) {
      return thisWeekValue > 0
        ? { value: "New", isPositive: true }
        : { value: "N/A", isPositive: null };
    }

    const percentageChange =
      ((thisWeekValue - lastWeekValue) / lastWeekValue) * 100;
    const isPositive = percentageChange > 0;

    return {
      value: `${isPositive ? "+" : ""}${percentageChange.toFixed(1)}%`,
      isPositive,
    };
  };

  // Hitung status deteksi terakhir
  const getLastDetectionStatus = () => {
    if (!detections.length) return { status: "Tidak ada", isActive: false };

    const lastDetection = detections[0];
    const lastTime = new Date(lastDetection.created_at);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastTime) / (1000 * 60));

    if (diffMinutes < 5) return { status: "Live", isActive: true };
    if (diffMinutes < 30) return { status: "Recent", isActive: true };
    return { status: "Idle", isActive: false };
  };

  // Hitung popularitas level roasting
  const getRoastPopularity = () => {
    if (!stats.class_distribution) return { value: "N/A", isPositive: null };

    const classes = stats.class_distribution;
    const total = Object.values(classes).reduce((sum, count) => sum + count, 0);
    const maxCount = Math.max(...Object.values(classes));
    const percentage = total > 0 ? (maxCount / total) * 100 : 0;

    return {
      value: `${percentage.toFixed(1)}%`,
      isPositive: percentage > 50,
    };
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

  const getClassBgColor = (index) => {
    const bgColors = [
      "bg-coffee-dark",
      "bg-coffee-medium",
      "bg-coffee-light",
      "bg-amber-500",
      "bg-emerald-500",
      "bg-violet-500",
    ];
    return bgColors[index % bgColors.length];
  };

  const totalTrend = calculateTrend("total");
  const completedTrend = calculateTrend("completed");
  const lastDetectionStatus = getLastDetectionStatus();
  const roastPopularity = getRoastPopularity();

  const summaryData = [
    {
      title: "Total Deteksi",
      value: stats.total_detections || 0,
      icon: Target,
      color: "coffee-dark",
      bgColor: "coffee-dark/10",
      trend: totalTrend.value,
      isPositive: totalTrend.isPositive,
      subtitle: "Minggu ini",
    },
    {
      title: "Deteksi Berhasil",
      value: stats.completed_detections || 0,
      icon: CheckCircle,
      color: "emerald-600",
      bgColor: "emerald-100",
      trend: completedTrend.value,
      isPositive: completedTrend.isPositive,
      subtitle: "Success rate",
    },
    {
      title: "Deteksi Terakhir",
      value: getLastDetectionTime(),
      icon: Clock,
      color: "emerald-500",
      bgColor: "coffee-light/10",
      trend: lastDetectionStatus.status,
      isPositive: lastDetectionStatus.isActive,
      subtitle: "Real-time",
    },
    {
      title: "Level Terbanyak",
      value: getMostCommonRoast(),
      icon: Coffee,
      color: "amber-600",
      bgColor: "amber-100",
      trend: roastPopularity.value,
      isPositive: roastPopularity.isPositive,
      subtitle: "Dominance",
    },
  ];

  // Helper function untuk styling trend
  const getTrendStyle = (trend, isPositive) => {
    if (isPositive === null) return "bg-gray-100 text-gray-600";
    if (isPositive) return "bg-green-100 text-green-800";
    return "bg-red-100 text-red-800";
  };

  const getTrendIcon = (isPositive) => {
    if (isPositive === null) return null;
    return isPositive ? (
      <TrendingUp className="w-3 h-3" />
    ) : (
      <TrendingDown className="w-3 h-3" />
    );
  };

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
            Prediksi tingkat roasting biji kopi secara real-time
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-3 bg-gradient-to-r from-coffee-light to-amber-600 text-white px-6 py-3 rounded-xl shadow-coffee">
            <Activity className="w-5 h-5" />
            <span className="font-semibold">System Active</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryData.map((item, index) => (
          <Card
            key={index}
            className="p-6 hover:shadow-coffee-lg transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-white to-coffee-cream/20">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${item.bgColor}`}>
                <item.icon className={`w-6 h-6 text-${item.color}`} />
              </div>
              <div className="text-right">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${getTrendStyle(
                    item.trend,
                    item.isPositive
                  )}`}>
                  {getTrendIcon(item.isPositive)}
                  {item.trend}
                </span>
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

      {/* Trend Analysis Info */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Trend Analysis</h3>
            <p className="text-sm text-blue-700">
              Data trend dihitung berdasarkan perbandingan minggu ini vs minggu
              lalu.
              {detections.length > 0
                ? ` Analisis dari ${detections.length} deteksi terbaru.`
                : " Belum ada data untuk analisis trend."}
            </p>
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
                <TrendingUp className="w-5 h-5 text-coffee-light" />
                <span className="text-sm text-coffee-medium">
                  {detections.length} total records
                </span>
              </div>
            </div>

            {detections.length > 0 ? (
              <div className="space-y-4">
                {detections.slice(0, 8).map((detection) => (
                  <div
                    key={detection.id}
                    className="flex items-center justify-between p-4 bg-coffee-cream/30 rounded-xl border border-coffee-cream hover:bg-coffee-cream/50 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          detection.status === "completed"
                            ? "bg-green-500"
                            : detection.status === "processing"
                            ? "bg-yellow-500"
                            : detection.status === "failed"
                            ? "bg-red-500"
                            : "bg-gray-400"
                        }`}></div>
                      <div>
                        <p className="font-semibold text-coffee-dark">
                          {detection.filename}
                        </p>
                        <p className="text-sm text-coffee-medium">
                          {detection.detections_count} deteksi •{" "}
                          {detection.status}
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
                ))}
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

        {/* Class Distribution - FIXED */}
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

                        {/* Fixed Progress Bar */}
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

          {/* Quick Stats */}
          <Card className="p-6 mt-6 border-0 bg-gradient-to-br from-coffee-dark to-coffee-medium text-white shadow-coffee">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Coffee className="w-5 h-5 mr-2" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-coffee-cream/80">Success Rate</span>
                <span className="font-bold">
                  {stats.total_detections
                    ? (
                        (stats.completed_detections / stats.total_detections) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
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
              <div className="flex justify-between">
                <span className="text-coffee-cream/80">Average Detection</span>
                <span className="font-bold">
                  {detections.length
                    ? (
                        detections.reduce(
                          (sum, d) => sum + d.detections_count,
                          0
                        ) / detections.length
                      ).toFixed(1)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-coffee-cream/80">Data Points</span>
                <span className="font-bold">{detections.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
