import React from "react";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import { CheckCircle, BarChart, Clock, Image as ImageIcon } from "lucide-react";
import { useStats, useDetections } from "../hooks/useApi";

const DashboardPage = () => {
  const { stats, loading: statsLoading, error: statsError } = useStats();
  const { detections, loading: detectionsLoading } = useDetections(1, 5);

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

    return maxClass || "Belum ada data";
  };

  const summaryData = [
    {
      title: "Total Deteksi",
      value: stats.total_detections || 0,
      icon: CheckCircle,
      color: "text-success",
    },
    {
      title: "Deteksi Berhasil",
      value: stats.completed_detections || 0,
      icon: ImageIcon,
      color: "text-primary",
    },
    {
      title: "Deteksi Terakhir",
      value: getLastDetectionTime(),
      icon: Clock,
      color: "text-accent",
    },
    {
      title: "Level Terbanyak",
      value: getMostCommonRoast(),
      icon: BarChart,
      color: "text-secondary",
    },
  ];

  if (statsLoading || detectionsLoading) {
    return <Loader />;
  }

  if (statsError) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Error loading dashboard: {statsError}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryData.map((item, index) => (
          <Card key={index}>
            <div className="flex items-center">
              <div
                className={`p-3 rounded-full bg-opacity-20 ${item.color.replace(
                  "text-",
                  "bg-"
                )}`}>
                <item.icon size={24} className={item.color} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-text-light">{item.title}</p>
                <p className="text-xl font-semibold text-text-main">
                  {item.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-text-main mb-4">
            Aktivitas Terkini
          </h2>
          {detections.length > 0 ? (
            <div className="space-y-3">
              {detections.slice(0, 5).map((detection) => (
                <div
                  key={detection.id}
                  className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{detection.filename}</p>
                    <p className="text-sm text-text-light">
                      {detection.detections_count} deteksi • {detection.status}
                    </p>
                  </div>
                  <span className="text-xs text-text-light">
                    {new Date(detection.created_at).toLocaleTimeString(
                      "en-GB",
                      { hour12: false }
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-light">Belum ada aktivitas</p>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-text-main mb-4">
            Distribusi Kelas
          </h2>
          {stats.class_distribution ? (
            <div className="space-y-2">
              {Object.entries(stats.class_distribution).map(
                ([className, count]) => (
                  <div key={className} className="flex justify-between">
                    <span className="capitalize">
                      {className.replace("_", " ")}
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-text-light">Belum ada data distribusi</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
