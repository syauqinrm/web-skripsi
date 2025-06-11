import React from "react";

const Footer = () => {
  return (
    <footer className="w-full py-3 bg-surface border-t border-background mt-auto flex-shrink-0">
      <p className="text-center text-sm text-text-light">
        © {new Date().getFullYear()} Kopi Prediction System. All rights
        reserved.
      </p>
    </footer>
  );
};

export default Footer;
