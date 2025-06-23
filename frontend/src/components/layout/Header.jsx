import React from "react";
import { Menu, X } from "lucide-react";
import Button from "../ui/Button";

// 👈 Gunakan default parameters instead of defaultProps
const Header = ({
  title = "Coffee Bean Detection",
  onMenuToggle = () => {},
  isMobileMenuOpen = false,
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary">{title}</h1>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={onMenuToggle}
              className="p-2">
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

// 👈 Hapus defaultProps
// Header.defaultProps = {
//   title: "Coffee Bean Detection",
//   onMenuToggle: () => {},
//   isMobileMenuOpen: false,
// };

export default Header;
