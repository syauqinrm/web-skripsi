import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ScanLine,
  FileText,
  Coffee,
  Activity,
  X,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    `flex items-center p-4 my-2 rounded-xl transition-all duration-300 text-coffee-cream font-medium transform hover:scale-105 ${
      isActive
        ? "bg-coffee-light shadow-coffee text-white"
        : "hover:bg-coffee-medium/50 hover:shadow-coffee"
    }`;

  // Handle navigation click - close sidebar on mobile
  const handleNavClick = () => {
    if (window.innerWidth < 768 && onClose) {
      onClose();
    }
  };

  // Handle logo click - navigate to welcome page
  const handleLogoClick = () => {
    navigate("/");
    if (window.innerWidth < 768 && onClose) {
      onClose();
    }
  };

  return (
    <aside
      data-sidebar
      className={`bg-gradient-to-b from-coffee-dark to-coffee-medium w-64 flex-shrink-0 transition-all duration-300 ease-in-out z-50 shadow-coffee-lg
                 fixed inset-y-0 left-0 md:relative md:translate-x-0
                 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="p-6 flex flex-col h-full">
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between mb-4 md:hidden">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:bg-coffee-cream/10 p-2 rounded-lg transition-colors duration-200"
            aria-label="Go to welcome page">
            <div className="p-2 bg-gradient-to-br from-coffee-light to-amber-600 rounded-xl shadow-coffee">
              <Coffee className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-coffee-cream">CoVi</h1>
              <p className="text-coffee-cream/70 text-sm font-medium">
                Coffee Vision
              </p>
            </div>
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-coffee-cream/20 rounded-lg transition-colors duration-200"
            aria-label="Close sidebar">
            <X className="w-5 h-5 text-coffee-cream" />
          </button>
        </div>

        {/* Logo Section - Hidden on mobile when close button is shown */}
        <button
          onClick={handleLogoClick}
          className="hidden md:flex items-center justify-center gap-3 mb-10 mt-4 flex-shrink-0 hover:bg-coffee-cream/10 p-3 rounded-2xl transition-colors duration-200"
          aria-label="Go to welcome page">
          <div className="p-3 bg-gradient-to-br from-coffee-light to-amber-600 rounded-2xl shadow-coffee">
            <Coffee className="text-white" size={28} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-coffee-cream">CoVi</h1>
            <p className="text-coffee-cream/70 text-sm font-medium">
              Coffee Vision
            </p>
          </div>
        </button>

        {/* Status Indicator */}
        <div className="mb-8 p-4 bg-coffee-cream/10 backdrop-blur-sm border border-coffee-cream/20 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-coffee-cream/90 text-sm font-medium">
                System Online
              </span>
            </div>
            <Activity className="w-4 h-4 text-coffee-cream/70" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/dashboard"
                className={navLinkClass}
                onClick={handleNavClick}>
                <div className="flex items-center space-x-4 w-full">
                  <div className="p-2 bg-coffee-cream/10 rounded-lg">
                    <LayoutDashboard size={20} />
                  </div>
                  <span className="text-lg">Dashboard</span>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/prediction"
                className={navLinkClass}
                onClick={handleNavClick}>
                <div className="flex items-center space-x-4 w-full">
                  <div className="p-2 bg-coffee-cream/10 rounded-lg">
                    <ScanLine size={20} />
                  </div>
                  <span className="text-lg">Prediction</span>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/reports"
                className={navLinkClass}
                onClick={handleNavClick}>
                <div className="flex items-center space-x-4 w-full">
                  <div className="p-2 bg-coffee-cream/10 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <span className="text-lg">Reports</span>
                </div>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Footer Info */}
        <div className="mt-auto pt-6 border-t border-coffee-cream/20">
          <div className="text-center">
            <p className="text-coffee-cream/70 text-sm font-medium">
              Powered by YOLOv8
            </p>
            <p className="text-coffee-cream/60 text-xs mt-1">
              v1.0.0 • ESP32-CAM Ready
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
