import React from "react";
import { Menu, UserCircle, Bell } from "lucide-react";

// Terima prop 'title'
const Header = ({ onMenuClick, title }) => {
  return (
    <header className="bg-surface shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        {/* Tombol Menu untuk Mobile */}
        <button onClick={onMenuClick} className="md:hidden text-text-main">
          <Menu size={24} />
        </button>

        {/* Judul Halaman Dinamis */}
        <div className="hidden md:block">
          {/* Tampilkan judul dari prop */}
          <h1 className="text-lg font-semibold text-text-main">{title}</h1>
        </div>

        {/* Ikon di Sebelah Kanan */}
        <div className="flex items-center gap-4">
          <button className="text-text-light hover:text-text-main">
            <Bell size={22} />
          </button>
          <button className="text-text-light hover:text-text-main">
            <UserCircle size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

// Tambahkan defaultProps untuk fallback jika judul tidak ada
Header.defaultProps = {
  title: "Dashboard",
};

export default Header;
