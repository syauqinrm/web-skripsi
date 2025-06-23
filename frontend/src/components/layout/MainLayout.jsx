import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

const MainLayout = ({ children, title = "Coffee Bean Detection" }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [headerTitle, setHeaderTitle] = useState("Dashboard");
  const location = useLocation();

  const getTitleFromPathname = (pathname) => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/prediction":
        return "Prediction";
      case "/reports":
        return "Reports";
      default:
        return "KopiScan";
    }
  };

  useEffect(() => {
    // Tutup sidebar setiap kali pindah halaman di mobile
    if (isSidebarOpen) {
      setSidebarOpen(false);
    }
    const newTitle = getTitleFromPathname(location.pathname);
    setHeaderTitle(newTitle);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* 1. Sidebar (Hanya satu instance) */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Overlay untuk menutup sidebar saat diklik di area gelap (hanya di mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}></div>
      )}

      {/* 2. Konten Utama (Header, Main, Footer) */}
      <div className="flex-1 flex flex-col">
        <Header
          onMenuClick={toggleSidebar}
          title={headerTitle}
          isSidebarOpen={isSidebarOpen} // Kirim state ke Header
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            {children}
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
