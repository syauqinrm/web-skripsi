import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import coffeeImage from "../assets/coffee-seed.png";
import { PlayCircle } from "lucide-react";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <img
        src={coffeeImage}
        alt="Biji Kopi"
        className="w-48 h-48 md:w-64 md:h-64 mb-8 object-contain animate-pulse"
      />
      <h1 className="text-4xl md:text-5xl font-bold text-text-main mb-4">
        Sistem Prediksi Roasting Biji Kopi
      </h1>
      <p className="text-lg text-text-light max-w-2xl mb-12">
        Deteksi tingkat roasting biji kopi secara real-time menggunakan
        teknologi YOLOv8.
      </p>
      <Button
        onClick={() => navigate("/dashboard")}
        className="text-xl"
        variant="kopi">
        Mulai Monitoring
        <PlayCircle size={24} />
      </Button>
    </div>
  );
};

export default WelcomePage;
