import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom"; // Import useLocation
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [headerTitle, setHeaderTitle] = useState("Dashboard"); // State untuk judul
  const location = useLocation(); // Dapatkan lokasi saat ini

  // Fungsi untuk memetakan path ke judul
  const getTitleFromPathname = (pathname) => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/prediction":
        return "Prediction";
      case "/reports":
        return "Reports";
      default:
        // Jika ada halaman lain di masa depan, kita bisa memberikan judul default
        return "KopiScan";
    }
  };

  // Gunakan useEffect untuk memperbarui judul setiap kali URL berubah
  useEffect(() => {
    const newTitle = getTitleFromPathname(location.pathname);
    setHeaderTitle(newTitle);
  }, [location.pathname]); // Dependensi array: jalankan efek ini hanya jika pathname berubah

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ... (kode Sidebar dan Overlay tidak berubah) ... */}
      <Sidebar className="hidden md:flex md:flex-col" />

      <div
        className={`fixed inset-0 z-40 md:hidden transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <Sidebar isOpen={isSidebarOpen} className="flex flex-col h-full" />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}></div>
      )}

      {/* Konten Utama (Header, Main, Footer) */}
      <div className="flex-1 flex flex-col">
        {/* 1. Header (Fixed) - Kirimkan judul dinamis sebagai prop */}
        <Header onMenuClick={toggleSidebar} title={headerTitle} />

        {/* 2. Area Konten Utama (Bisa di-scroll) */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>

        {/* 3. Footer (Fixed) */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
