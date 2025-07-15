import React from "react";
import { Coffee, Github, Heart, Cpu, Camera, Zap } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-r from-coffee-dark to-coffee-medium text-white border-t border-coffee-cream/20 mt-auto flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        

        {/* Bottom Section */}
        <div className="border-t border-coffee-cream/20 mt-0 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-coffee-cream/80 text-sm">
                © {currentYear} CoffeeVision Detection System. All rights
                reserved.
              </p>
              <p className="text-coffee-cream/60 text-xs mt-1">
                Developed for Coffee Industry Quality Control
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-coffee-cream/70 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>System Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>High Performance</span>
              </div>
              <div className="flex items-center space-x-2">
                <Coffee className="w-4 h-4" />
                <span>Coffee Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
