import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Coffee,
  Camera,
  Brain,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  Users,
  Clock,
  Award,
  Eye,
  Target,
  Cpu,
} from "lucide-react";
import Button from "../components/ui/Button";

const WelcomePage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Detection",
      description: "Teknologi YOLOv8 terdepan untuk akurasi tinggi",
      gradient: "from-coffee-dark to-coffee-medium",
      delay: "0ms",
    },
    {
      icon: Camera,
      title: "Real-Time Monitoring",
      description: "Live stream ESP32-CAM untuk monitoring langsung",
      gradient: "from-coffee-medium to-coffee-light",
      delay: "150ms",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Proses deteksi dalam hitungan detik",
      gradient: "from-coffee-light to-amber-500",
      delay: "300ms",
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Dashboard komprehensif dan laporan detail",
      gradient: "from-coffee-medium to-coffee-dark",
      delay: "450ms",
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Quality Assurance",
      description:
        "Kontrol kualitas otomatis untuk standar konsisten setiap batch roasting",
      color: "coffee-dark",
    },
    {
      icon: Clock,
      title: "Efisiensi Waktu",
      description:
        "Hemat waktu dengan deteksi otomatis dan akurat dalam hitungan detik",
      color: "coffee-medium",
    },
    {
      icon: Award,
      title: "Standar Profesional",
      description:
        "Sesuai standar industri coffee processing dan quality control",
      color: "coffee-light",
    },
  ];

  const stats = [
    { number: "99.5%", label: "Akurasi Deteksi", icon: Target },
    { number: "< 2s", label: "Waktu Proses", icon: Zap },
    { number: "24/7", label: "Monitoring", icon: Eye },
    { number: "5+", label: "Level Roasting", icon: Coffee },
  ];

  return (
    <div className="min-h-screen bg-coffee-gradient relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-coffee-cream/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-coffee-light/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-coffee-cream/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-coffee-light to-amber-600 rounded-2xl shadow-coffee">
              <Coffee className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-coffee-cream">
                CoVi
              </span>
              <p className="text-coffee-cream/80 text-sm">
                AI-Powered Quality Control
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-coffee-cream/10 backdrop-blur-sm border border-coffee-cream/20 rounded-xl text-coffee-cream hover:bg-coffee-cream/20 transition-all duration-300 flex items-center space-x-2 shadow-coffee">
            <span className="font-medium">Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div
            className={`text-center mb-20 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}>
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-coffee-light/30 to-amber-600/30 backdrop-blur-sm border border-coffee-light/40 rounded-full px-8 py-3 mb-8 shadow-coffee">
              <Star className="w-6 h-6 text-amber-400" />
              <span className="text-coffee-cream font-semibold text-lg">
                AI-Powered Coffee Detection System
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-coffee-cream mb-8 leading-tight">
              Deteksi Tingkat
              <br />
              <span className="bg-gradient-to-r from-coffee-light via-amber-500 to-orange-500 bg-clip-text text-transparent">
                Roasting Biji Kopi
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-coffee-cream/90 mb-12 max-w-4xl mx-auto leading-relaxed">
              Sistem deteksi real-time dengan teknologi YOLOv8 dan ESP32-CAM
              untuk identifikasi tingkat roasting biji kopi yang akurat dan efisien.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => navigate("/prediction")}
                className="group px-10 py-5 bg-gradient-to-r from-coffee-light to-amber-600 text-white rounded-2xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-coffee-lg">
                <Play className="w-6 h-6" />
                <span>Mulai Deteksi</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/reports")}
                className="px-10 py-5 bg-coffee-cream/15 backdrop-blur-sm border-2 border-coffee-cream/30 text-coffee-cream rounded-2xl font-bold text-lg hover:bg-coffee-cream/25 transition-all duration-300 flex items-center justify-center space-x-3 shadow-coffee">
                <BarChart3 className="w-6 h-6" />
                <span>Lihat Laporan</span>
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}>
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-8 bg-coffee-cream/10 backdrop-blur-sm border border-coffee-cream/20 rounded-3xl hover:bg-coffee-cream/20 transition-all duration-300 shadow-coffee transform hover:scale-105">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-coffee-light to-amber-600 rounded-2xl mb-6 shadow-coffee">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-coffee-cream mb-3">
                  {stat.number}
                </div>
                <div className="text-coffee-cream/80 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="mb-24">
            <div
              className={`text-center mb-16 transition-all duration-1000 delay-500 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}>
              <h2 className="text-5xl font-bold text-coffee-cream mb-6">
                Fitur Unggulan
              </h2>
              <p className="text-xl text-coffee-cream/90 max-w-3xl mx-auto leading-relaxed">
                Teknologi terdepan untuk monitoring kualitas roasting biji kopi
                dengan presisi tinggi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`group p-8 bg-coffee-cream/10 backdrop-blur-sm border border-coffee-cream/20 rounded-3xl hover:bg-coffee-cream/20 transition-all duration-500 cursor-pointer transform hover:scale-105 shadow-coffee ${
                    currentFeature === index
                      ? "ring-2 ring-coffee-light/50 bg-coffee-cream/20 scale-105"
                      : ""
                  }`}
                  style={{
                    animationDelay: feature.delay,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(20px)",
                  }}>
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-coffee`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-coffee-cream mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-coffee-cream/80 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mb-24">
            <div
              className={`text-center mb-16 transition-all duration-1000 delay-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}>
              <h2 className="text-5xl font-bold text-coffee-cream mb-6">
                Keunggulan Sistem
              </h2>
              <p className="text-xl text-coffee-cream/90 max-w-3xl mx-auto leading-relaxed">
                Solusi terpadu untuk industri kopi modern dengan standar
                profesional
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className={`text-center p-10 bg-coffee-cream/10 backdrop-blur-sm border border-coffee-cream/20 rounded-3xl hover:bg-coffee-cream/20 transition-all duration-500 shadow-coffee transform hover:scale-105 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{ animationDelay: `${800 + index * 200}ms` }}>
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 bg-${benefit.color} rounded-2xl mb-8 shadow-coffee`}>
                    <benefit.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-coffee-cream mb-6">
                    {benefit.title}
                  </h3>
                  <p className="text-coffee-cream/80 leading-relaxed text-lg">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div
            className={`text-center p-12 bg-gradient-to-br from-coffee-cream/20 to-coffee-light/20 backdrop-blur-sm border border-coffee-cream/30 rounded-3xl transition-all duration-1000 delay-1000 shadow-coffee-lg ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}>
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-coffee-light to-amber-600 rounded-full px-6 py-3 mb-8 shadow-coffee">
              <Users className="w-6 h-6 text-white" />
              <span className="text-white font-bold">
                Trusted by Coffee Professionals
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-coffee-cream mb-8">
              Siap Meningkatkan Kualitas Roasting Anda?
            </h2>

            <p className="text-xl text-coffee-cream/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Bergabunglah dengan teknologi AI terdepan untuk monitoring dan
              kontrol kualitas roasting biji kopi secara real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => navigate("/prediction")}
                className="group px-10 py-5 bg-gradient-to-r from-coffee-light to-amber-600 text-white rounded-2xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-coffee-lg">
                <Play className="w-6 h-6" />
                <span>Coba Sekarang</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="px-10 py-5 bg-coffee-cream/15 backdrop-blur-sm border-2 border-coffee-cream/30 text-coffee-cream rounded-2xl font-bold text-lg hover:bg-coffee-cream/25 transition-all duration-300 flex items-center justify-center space-x-3 shadow-coffee">
                <BarChart3 className="w-6 h-6" />
                <span>Lihat Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-coffee-cream/20 bg-coffee-dark/80 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <div className="p-3 bg-gradient-to-br from-coffee-light to-amber-600 rounded-2xl shadow-coffee">
                <Coffee className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-coffee-cream">
                  CoVi
                </span>
                <p className="text-coffee-cream/70 text-sm">
                  AI-Powered Quality Control
                </p>
              </div>
            </div>

            <div className="text-coffee-cream/70 text-center md:text-right">
              <p className="text-lg font-medium">© 2025 CoffeeVision</p>
              <p className="text-sm">Powered by YOLOv8 & ESP32-CAM</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
