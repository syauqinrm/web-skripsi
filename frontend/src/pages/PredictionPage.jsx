import React from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Save } from "lucide-react";

const PredictionPage = () => {
  // Data tiruan untuk bounding box
  const mockDetections = [
    { id: 1, class: "medium_roast", confidence: 0.92, box: [15, 25, 30, 30] }, // [x, y, w, h] in %
    { id: 2, class: "light_roast", confidence: 0.88, box: [50, 40, 25, 25] },
    { id: 3, class: "dark_roast", confidence: 0.95, box: [70, 60, 28, 28] },
  ];

  const classColors = {
    light_roast: "border-accent",
    medium_roast: "border-primary",
    dark_roast: "border-secondary",
    green_bean: "border-success",
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-6">
        Real-Time Prediction
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Video Stream */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="relative">
              {/* Placeholder untuk stream video */}
              <img
                src="/placeholder-stream.jpg"
                alt="Live stream"
                className="w-full h-auto"
              />

              {/* Render Bounding Box dari data tiruan */}
              {mockDetections.map((det) => (
                <div
                  key={det.id}
                  className={`absolute border-2 ${
                    classColors[det.class] || "border-danger"
                  }`}
                  style={{
                    left: `${det.box[0]}%`,
                    top: `${det.box[1]}%`,
                    width: `${det.box[2]}%`,
                    height: `${det.box[3]}%`,
                  }}>
                  <span
                    className={`text-xs text-white p-1 ${classColors[
                      det.class
                    ].replace("border-", "bg-")}`}>
                    {det.class} ({det.confidence.toFixed(2)})
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Kolom Informasi & Kontrol */}
        <div>
          <Card>
            <h2 className="text-xl font-semibold text-text-main mb-4">
              Hasil Deteksi
            </h2>
            <div className="space-y-3">
              <p>
                <strong>Status:</strong>{" "}
                <span className="text-success font-semibold">
                  Mendeteksi...
                </span>
              </p>
              <p>
                <strong>Total Biji Kopi:</strong> {mockDetections.length}
              </p>
              <div className="border-t my-4"></div>
              <h3 className="font-semibold">Detail per Kelas:</h3>
              <ul className="list-disc list-inside text-text-light">
                <li>Light Roast: 1</li>
                <li>Medium Roast: 1</li>
                <li>Dark Roast: 1</li>
              </ul>
            </div>
            <Button
              onClick={() => alert("Fitur Simpan akan diimplementasikan!")}
              className="w-full mt-6"
              variant="primary">
              <Save size={18} />
              Simpan Hasil
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PredictionPage;
