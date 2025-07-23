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
  Thermometer,
  Timer,
  Droplet,
  Flame,
  ChevronRight,
  BookOpen,
  Layers,
  Info,
} from "lucide-react";
import Button from "../components/ui/Button";

// Import gambar biji kopi
import greenBeansImg from "../assets/green-beans.webp";
import lightRoastImg from "../assets/light-roast.jpg";
import mediumRoastImg from "../assets/medium-roast.jpg";
import darkRoastImg from "../assets/dark-roast.jpeg";

const WelcomePage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [currentRoast, setCurrentRoast] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 4);
    }, 4000);

    const roastInterval = setInterval(() => {
      setCurrentRoast((prev) => (prev + 1) % 4);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(roastInterval);
    };
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
      title: "Real-Time Prediksi",
      description: "Live stream Raspberry Pi untuk prediksi langsung",
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

  const roastingLevels = [
    {
      id: "green",
      name: "Green Beans",
      title: "Biji Kopi Hijau",
      description:
        "Biji kopi mentah sebelum proses roasting. Memiliki kadar air tinggi dan tekstur keras.",
      color: "#2D5016",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-900",
      temperature: "Suhu Ruang",
      time: "0 menit",
      characteristics: [
        "Kadar air 10-12%",
        "Tekstur keras",
        "Warna hijau kebiruan",
        "Tidak memiliki aroma kopi",
      ],
      image: greenBeansImg,
      gradient: "from-green-100 to-coffee-cream/30",
      cardGradient: "from-green-50 to-green-100",
    },
    {
      id: "light",
      name: "Light Roast",
      title: "Roasting Ringan",
      description:
        "Roasting ringan dengan suhu 180-205°C. Mempertahankan karakter asli biji kopi.",
      color: "#D2A96B",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-900",
      temperature: "180-205°C",
      time: "3-5 menit",
      characteristics: [
        "Warna coklat muda",
        "Rasa asam yang menonjol",
        "Aroma floral/fruity",
        "Kadar kafein tinggi",
      ],
      image: lightRoastImg,
      gradient: "from-amber-100 to-coffee-cream/30",
      cardGradient: "from-amber-50 to-amber-100",
    },
    {
      id: "medium",
      name: "Medium Roast",
      title: "Roasting Sedang",
      description:
        "Roasting sedang dengan suhu 210-220°C. Keseimbangan antara keasaman dan body.",
      color: "#A27B5C",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-900",
      temperature: "210-220°C",
      time: "5-8 menit",
      characteristics: [
        "Warna coklat sedang",
        "Rasa seimbang",
        "Aroma karamel",
        "Body medium",
      ],
      image: mediumRoastImg,
      gradient: "from-orange-100 to-coffee-cream/30",
      cardGradient: "from-orange-50 to-orange-100",
    },
    {
      id: "dark",
      name: "Dark Roast",
      title: "Roasting Gelap",
      description:
        "Roasting gelap dengan suhu 225-250°C. Rasa pahit dominan dengan body penuh.",
      color: "#2C3930",
      bgColor: "bg-stone-50",
      borderColor: "border-stone-200",
      textColor: "text-stone-900",
      temperature: "225-250°C",
      time: "8-12 menit",
      characteristics: [
        "Warna coklat gelap",
        "Rasa pahit dominan",
        "Aroma smoky",
        "Body penuh",
      ],
      image: darkRoastImg,
      gradient: "from-stone-100 to-coffee-cream/30",
      cardGradient: "from-stone-50 to-stone-100",
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
    { number: "24/7", label: "Real-time", icon: Eye },
    { number: "4+", label: "Level Roasting", icon: Coffee },
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
              <span className="text-2xl font-bold text-coffee-cream">CoVi</span>
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
              Sistem deteksi real-time dengan teknologi YOLOv8 dan Raspberry Pi
              4 untuk identifikasi tingkat roasting biji kopi yang akurat dan
              efisien.
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

          {/* Coffee Roasting Education Section */}
          <div className="mb-24">
            <div
              className={`text-center mb-16 transition-all duration-1000 delay-300 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}>
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-coffee-cream/20 to-coffee-light/20 backdrop-blur-sm border border-coffee-cream/30 rounded-full px-6 py-3 mb-6 shadow-coffee">
                <BookOpen className="w-5 h-5 text-coffee-cream" />
                <span className="text-coffee-cream font-semibold">
                  Pengenalan Roasting Kopi
                </span>
              </div>

              <h2 className="text-5xl font-bold text-coffee-cream mb-6">
                Apa itu Roasting Kopi?
              </h2>

              <p className="text-xl text-coffee-cream/90 max-w-4xl mx-auto leading-relaxed mb-8">
                Roasting adalah proses pemanggangan biji kopi hijau menggunakan
                panas untuk mengembangkan rasa, aroma, dan karakteristik unik
                setiap biji kopi. Proses ini mengubah biji kopi dari mentah
                menjadi siap seduh dengan berbagai tingkatan yang mempengaruhi
                profil rasa.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-coffee-cream/10 backdrop-blur-sm border border-coffee-cream/20 rounded-2xl p-6 shadow-coffee">
                  <div className="flex items-center space-x-3 mb-4">
                    <Thermometer className="w-6 h-6 text-amber-400" />
                    <h3 className="text-xl font-bold text-coffee-cream">
                      Suhu & Waktu
                    </h3>
                  </div>
                  <p className="text-coffee-cream/80 leading-relaxed">
                    Roasting dilakukan pada suhu 180-250°C selama 3-15 menit,
                    tergantung tingkat roasting yang diinginkan.
                  </p>
                </div>

                <div className="bg-coffee-cream/10 backdrop-blur-sm border border-coffee-cream/20 rounded-2xl p-6 shadow-coffee">
                  <div className="flex items-center space-x-3 mb-4">
                    <Layers className="w-6 h-6 text-amber-400" />
                    <h3 className="text-xl font-bold text-coffee-cream">
                      4 Tingkatan Utama
                    </h3>
                  </div>
                  <p className="text-coffee-cream/80 leading-relaxed">
                    Setiap tingkatan roasting menghasilkan karakteristik rasa,
                    aroma, dan warna yang berbeda.
                  </p>
                </div>
              </div>
            </div>

            {/* Roasting Levels Interactive Display */}
            <div className="bg-coffee-cream/10 backdrop-blur-sm border border-coffee-cream/20 rounded-3xl p-8 md:p-12 shadow-coffee-lg">
              <h3 className="text-3xl font-bold text-coffee-cream text-center mb-12">
                4 Tingkatan Utama Roasting Biji Kopi
              </h3>

              {/* Interactive Roasting Level Cards - Alternative Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                {roastingLevels.map((level, index) => (
                  <div
                    key={level.id}
                    className={`group cursor-pointer transition-all duration-500 transform hover:scale-105 hover:shadow-xl ${
                      currentRoast === index
                        ? "scale-105 ring-2 ring-coffee-light shadow-xl"
                        : ""
                    }`}
                    onClick={() => setCurrentRoast(index)}>
                    {/* Clean modern card design */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 h-full hover:shadow-xl transition-shadow duration-300">
                      {/* Image Section */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={level.image}
                          alt={level.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        {/* Fallback placeholder */}
                        <div
                          className="absolute inset-0 flex items-center justify-center bg-gray-100"
                          style={{ display: "none" }}>
                          <div
                            className="w-32 h-32 rounded-full shadow-lg border-4 border-white/50"
                            style={{ backgroundColor: level.color }}>
                            <div className="w-full h-full flex items-center justify-center">
                              <Coffee className="w-16 h-16 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Color indicator strip */}
                        <div
                          className="absolute bottom-0 left-0 right-0 h-2"
                          style={{ backgroundColor: level.color }}></div>

                        {/* Level name overlay */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-800 shadow-lg">
                            {level.name}
                          </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6 space-y-4">
                        {/* Title */}
                        <div>
                          <h4 className="text-xl font-bold text-gray-800 mb-2">
                            {level.title}
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {level.description}
                          </p>
                        </div>

                        {/* Stats Row */}
                        <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Thermometer className="w-4 h-4 text-red-500" />
                            <div>
                              <p className="text-xs text-gray-500">Suhu</p>
                              <p className="text-sm font-bold text-gray-800">
                                {level.temperature}
                              </p>
                            </div>
                          </div>
                          <div className="w-px h-8 bg-gray-300"></div>
                          <div className="flex items-center space-x-2">
                            <Timer className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="text-xs text-gray-500">Waktu</p>
                              <p className="text-sm font-bold text-gray-800">
                                {level.time}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Quick characteristics */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-semibold text-gray-700">
                            Karakteristik Utama:
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {level.characteristics
                              .slice(0, 2)
                              .map((char, charIndex) => (
                                <span
                                  key={charIndex}
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md border">
                                  {char}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed View of Selected Roasting Level */}
              <div className="bg-coffee-cream/10 backdrop-blur-sm border border-coffee-cream/30 rounded-2xl p-8 shadow-coffee-lg">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Large Image and Basic Info */}
                  <div className="space-y-6">
                    <div className="relative h-80 rounded-xl overflow-hidden bg-coffee-cream/20 shadow-xl border border-coffee-cream/30">
                      <img
                        src={roastingLevels[currentRoast].image}
                        alt={roastingLevels[currentRoast].title}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      {/* Fallback placeholder */}
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ display: "none" }}>
                        <div
                          className="w-48 h-48 rounded-full shadow-xl border-4 border-coffee-cream/50"
                          style={{
                            backgroundColor: roastingLevels[currentRoast].color,
                          }}>
                          <div className="w-full h-full flex items-center justify-center">
                            <Coffee className="w-24 h-24 text-coffee-cream" />
                          </div>
                        </div>
                      </div>

                      {/* Image overlay with gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-coffee-dark/40 to-transparent"></div>
                    </div>

                    <div className="text-center">
                      <h4 className="text-3xl font-bold text-coffee-cream mb-2">
                        {roastingLevels[currentRoast].title}
                      </h4>
                      <p className="text-coffee-cream/80 text-lg">
                        {roastingLevels[currentRoast].description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Detailed Characteristics */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-coffee-cream/20 rounded-xl p-4 backdrop-blur-sm border border-coffee-cream/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <Thermometer className="w-5 h-5 text-coffee-light" />
                          <span className="text-coffee-cream font-semibold">
                            Suhu
                          </span>
                        </div>
                        <p className="text-coffee-cream/90 text-lg font-bold">
                          {roastingLevels[currentRoast].temperature}
                        </p>
                      </div>

                      <div className="bg-coffee-cream/20 rounded-xl p-4 backdrop-blur-sm border border-coffee-cream/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <Timer className="w-5 h-5 text-coffee-medium" />
                          <span className="text-coffee-cream font-semibold">
                            Waktu
                          </span>
                        </div>
                        <p className="text-coffee-cream/90 text-lg font-bold">
                          {roastingLevels[currentRoast].time}
                        </p>
                      </div>
                    </div>

                    <div className="bg-coffee-cream/20 rounded-xl p-6 backdrop-blur-sm border border-coffee-cream/30">
                      <h5 className="text-xl font-bold text-coffee-cream mb-4 flex items-center">
                        <Info className="w-5 h-5 mr-2" />
                        Karakteristik Utama
                      </h5>
                      <ul className="space-y-3">
                        {roastingLevels[currentRoast].characteristics.map(
                          (char, index) => (
                            <li
                              key={index}
                              className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-coffee-light rounded-full"></div>
                              <span className="text-coffee-cream/90">
                                {char}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    {/* Additional Visual Info */}
                    <div className="bg-gradient-to-r from-coffee-light/20 to-coffee-medium/20 rounded-xl p-4 backdrop-blur-sm border border-coffee-cream/30">
                      <div className="flex items-center space-x-3 mb-3">
                        <Eye className="w-5 h-5 text-coffee-cream" />
                        <h5 className="font-bold text-coffee-cream">
                          Visual Characteristics
                        </h5>
                      </div>
                      <p className="text-coffee-cream/80 text-sm">
                        {roastingLevels[currentRoast].id === "green" &&
                          "Biji mentah dengan warna hijau kebiruan, permukaan halus dan keras."}
                        {roastingLevels[currentRoast].id === "light" &&
                          "Warna coklat muda dengan permukaan kering, tidak berminyak."}
                        {roastingLevels[currentRoast].id === "medium" &&
                          "Warna coklat sedang dengan sedikit minyak di permukaan."}
                        {roastingLevels[currentRoast].id === "dark" &&
                          "Warna coklat gelap hingga hitam dengan permukaan berminyak."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center space-x-2 mt-8">
                {roastingLevels.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentRoast(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentRoast === index
                        ? "bg-coffee-light scale-125 shadow-coffee"
                        : "bg-coffee-cream/40 hover:bg-coffee-cream/60"
                    }`}
                    aria-label={`View ${roastingLevels[index].title}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-24">
            <div
              className={`text-center mb-16 transition-all duration-1000 delay-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}>
              <h2 className="text-5xl font-bold text-coffee-cream mb-6">
                Fitur Unggulan
              </h2>
              <p className="text-xl text-coffee-cream/90 max-w-3xl mx-auto leading-relaxed">
                Teknologi terdepan untuk prediksi tingkat roasting biji kopi
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
              className={`text-center mb-16 transition-all duration-1000 delay-900 ${
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
                  style={{ animationDelay: `${1000 + index * 200}ms` }}>
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
            className={`text-center p-12 bg-gradient-to-br from-coffee-cream/20 to-coffee-light/20 backdrop-blur-sm border border-coffee-cream/30 rounded-3xl transition-all duration-1000 delay-1200 shadow-coffee-lg ${
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
              Bergabunglah dengan teknologi AI terdepan untuk prediksi dan
              deteksi tingkat roasting biji kopi secara real-time.
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
              <p className="text-sm">Powered by YOLOv8 & Raspberry Pi 4</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
