import React from "react";
import Card from "../components/ui/Card";
import { CheckCircle, BarChart, Clock, Image as ImageIcon } from "lucide-react";

const DashboardPage = () => {
  // Data tiruan
  const summaryData = [
    {
      title: "Total Deteksi",
      value: "1,245",
      icon: CheckCircle,
      color: "text-success",
    },
    {
      title: "Gambar Disimpan",
      value: "89",
      icon: ImageIcon,
      color: "text-primary",
    },
    {
      title: "Waktu Deteksi Terakhir",
      value: "2 menit lalu",
      icon: Clock,
      color: "text-accent",
    },
    {
      title: "Level Roasting Terbanyak",
      value: "Medium Roast",
      icon: BarChart,
      color: "text-secondary",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-6">Dashboard</h1>
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

      <div className="mt-8">
        <Card>
          <h2 className="text-xl font-semibold text-text-main mb-4">
            Aktivitas Terkini
          </h2>
          <p className="text-text-light">
            Grafik aktivitas akan ditampilkan di sini saat backend terhubung.
          </p>
          {/* Placeholder untuk grafik */}
          <div className="bg-background h-64 mt-4 rounded-lg flex items-center justify-center">
            <BarChart size={48} className="text-text-light opacity-50" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
