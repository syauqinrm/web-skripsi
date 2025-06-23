import React from "react";

// 👈 Gunakan default parameters
const Card = ({ children, className = "", onClick = null, ...props }) => {
  const baseClasses =
    "bg-white rounded-lg shadow-sm border border-gray-200 p-6";
  const clickableClasses = onClick
    ? "cursor-pointer hover:shadow-md transition-shadow"
    : "";

  return (
    <div
      className={`${baseClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      {...props}>
      {children}
    </div>
  );
};

// 👈 Hapus defaultProps jika ada
export default Card;
