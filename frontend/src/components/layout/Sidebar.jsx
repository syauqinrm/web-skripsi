import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ScanLine, FileText, Coffee } from "lucide-react";

const Sidebar = ({ isOpen, className = "" }) => {
  // Logika styling baru untuk link
  const navLinkClass = ({ isActive }) =>
    `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 text-text-main font-medium ${
      isActive
        ? "bg-surface shadow-inner" // Warna putih saat aktif
        : "hover:bg-background" // Warna background abu-abu muda saat hover
    }`;

  return (
    // Latar belakang utama diubah ke warna biru pastel (#A7C7E7)
    <aside
      className={`bg-primary w-64 flex-shrink-0 transition-transform duration-300 ease-in-out z-30 ${className}`}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-center gap-2 mb-8 mt-4 flex-shrink-0">
          <Coffee className="text-surface" size={32} />
          <h1 className="text-xl font-bold text-surface">PredictKopi</h1>
        </div>
        <nav className="flex-1">
          <ul>
            <li>
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard size={20} className="mr-4" />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/prediction" className={navLinkClass}>
                <ScanLine size={20} className="mr-4" />
                Prediction
              </NavLink>
            </li>
            <li>
              <NavLink to="/reports" className={navLinkClass}>
                <FileText size={20} className="mr-4" />
                Reports
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
