import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

const MainLayout = ({ children, title = "Coffee Bean Detection" }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [headerTitle, setHeaderTitle] = useState("Dashboard");
  const [pageDescription, setPageDescription] = useState("");
  const location = useLocation();

  const getPageInfo = (pathname) => {
    switch (pathname) {
      case "/dashboard":
        return {
          title: "Dashboard",
          description: "Monitor dan analisis sistem deteksi",
        };
      case "/prediction":
        return {
          title: "Real-Time Prediction",
          description: "Deteksi tingkat roasting secara langsung",
        };
      case "/reports":
        return {
          title: "Reports & Analytics",
          description: "Laporan lengkap dan analisis data",
        };
      default:
        return {
          title: "CoVi",
          description: "Coffee Vision AI Detection System",
        };
    }
  };

  useEffect(() => {
    const pageInfo = getPageInfo(location.pathname);
    setHeaderTitle(pageInfo.title);
    setPageDescription(pageInfo.description);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && window.innerWidth < 768) {
        // Check if click is outside sidebar area
        const sidebar = document.querySelector("[data-sidebar]");
        if (sidebar && !sidebar.contains(event.target)) {
          closeSidebar();
        }
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen bg-cream-gradient overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Overlay untuk mobile - Fixed z-index */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-coffee-dark/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={closeSidebar}
          style={{ touchAction: "none" }} // Prevent touch scrolling
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Header
          onMenuToggle={toggleSidebar}
          title={headerTitle}
          isMobileMenuOpen={isSidebarOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-coffee-cream/20 to-white">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-transparent to-transparent border-b border-coffee-cream/50 px-4 sm:px-6 lg:px-0 pb-3">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                  <div></div>
                  {/* Breadcrumb */}
                  <nav className="hidden md:flex items-center space-x-2 text-sm">
                    <span className="text-coffee-medium">Home</span>
                    <span className="text-coffee-medium">/</span>
                    <span className="text-coffee-dark font-medium">
                      {headerTitle}
                    </span>
                  </nav>
                </div>
              </div>
            </div>
            <div className="min-h-full pt-3">
              {children}
              <Outlet />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
