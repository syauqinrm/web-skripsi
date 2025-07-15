import React from "react";
import { Menu, X, Bell, Settings, User, Wifi, WifiOff } from "lucide-react";
import Button from "../ui/Button";

const Header = ({
  title = "Coffee Bean Detection",
  onMenuToggle = () => {},
  isMobileMenuOpen = false,
}) => {
  const [notifications] = React.useState(3);
  const [isOnline] = React.useState(true);

  return (
    <header className="bg-gradient-to-r from-white to-coffee-cream/30 shadow-coffee border-b border-coffee-cream/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={onMenuToggle}
                className="p-2 border-coffee-medium text-coffee-medium hover:bg-coffee-medium hover:text-white">
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>

            {/* Title */}
            <div className="flex-shrink-0">
              <p className="text-coffee-medium text-md font-bold">
                Real-time Coffee Prediction System
              </p>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-coffee-cream/30 rounded-xl border border-coffee-cream">
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Online
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">
                      Offline
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
