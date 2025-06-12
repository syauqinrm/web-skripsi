import React from "react";
import { Menu, X } from "lucide-react"; // Tambahkan import X

// Terima prop 'title' dan 'isSidebarOpen'
const Header = ({ onMenuClick, title, isSidebarOpen }) => {
  return (
    <header className="bg-surface shadow-sm sticky top-0 z-20 flex-shrink-0">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        <div className="flex items-center">
          {/* Tombol Menu untuk Mobile */}
          <button
            onClick={onMenuClick}
            className="md:hidden text-text-main mr-4">
            {/* Ganti ikon berdasarkan state isSidebarOpen */}
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Judul Halaman Dinamis */}
          <h1 className="text-lg font-semibold text-text-main">{title}</h1>
        </div>

        {/* Anda bisa menambahkan ikon profil atau notifikasi di sini jika perlu */}
        {/* <div className="flex items-center gap-4"> ... </div> */}
      </div>
    </header>
  );
};

Header.defaultProps = {
  title: "Dashboard",
  isSidebarOpen: false, // Tambahkan default prop
};

export default Header;
