import React from "react";

const Button = ({ children, onClick, className = "", variant = "primary" }) => {
  const baseStyle =
    "px-6 py-3 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-primary text-text-main hover:bg-opacity-90",
    secondary: "bg-secondary text-text-main hover:bg-opacity-90",
    accent: "bg-accent text-text-main hover:bg-opacity-90",
    kopi: "bg-kopi text-text-main hover:bg-opacity-90",
    buttonn: "bg-button text-text-main hover:bg-opacity-90",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default Button;
