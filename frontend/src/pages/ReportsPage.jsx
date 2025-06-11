import React from "react";
import Card from "../components/ui/Card";

const ReportsPage = () => {
  // Data tiruan untuk laporan
  const mockReports = [
    {
      id: 1,
      timestamp: "2023-10-27 10:30:15",
      imageUrl: "/placeholder-stream.jpg",
      detections: "1 Dark, 2 Medium",
    },
    {
      id: 2,
      timestamp: "2023-10-27 10:28:45",
      imageUrl: "/placeholder-stream.jpg",
      detections: "3 Medium",
    },
    {
      id: 3,
      timestamp: "2023-10-27 10:25:02",
      imageUrl: "/placeholder-stream.jpg",
      detections: "4 Light",
    },
    {
      id: 4,
      timestamp: "2023-10-26 15:10:20",
      imageUrl: "/placeholder-stream.jpg",
      detections: "2 Green, 1 Light",
    },
    {
      id: 5,
      timestamp: "2023-10-26 15:10:20",
      imageUrl: "/placeholder-stream.jpg",
      detections: "2 Green, 1 Light",
    },
    {
      id: 5,
      timestamp: "2023-10-26 15:10:20",
      imageUrl: "/placeholder-stream.jpg",
      detections: "2 Green, 1 Light",
    },
    {
      id: 6,
      timestamp: "2023-10-26 15:10:20",
      imageUrl: "/placeholder-stream.jpg",
      detections: "2 Green, 1 Light",
    },
    {
      id: 7,
      timestamp: "2023-10-26 15:10:20",
      imageUrl: "/placeholder-stream.jpg",
      detections: "2 Green, 1 Light",
    },
    {
      id: 8,
      timestamp: "2023-10-26 15:10:20",
      imageUrl: "/placeholder-stream.jpg",
      detections: "2 Green, 1 Light",
    },
    {
      id: 9,
      timestamp: "2023-10-26 15:10:20",
      imageUrl: "/placeholder-stream.jpg",
      detections: "2 Green, 1 Light",
    },
    {
      id: 10,
      timestamp: "2023-10-26 15:10:20",
      imageUrl: "/placeholder-stream.jpg",
      detections: "2 Green, 1 Light",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-6">
        Laporan Deteksi
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockReports.map((report) => (
          <Card key={report.id} className="p-0 overflow-hidden group">
            <img
              src={report.imageUrl}
              alt={`Laporan ${report.id}`}
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
            />
            <div className="p-4">
              <p className="text-sm text-text-light">{report.timestamp}</p>
              <h3 className="font-semibold text-text-main mt-1">
                Hasil: {report.detections}
              </h3>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
