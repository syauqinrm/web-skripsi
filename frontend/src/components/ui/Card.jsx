import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-surface p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {children}
    </div>
  );
};

export default Card;
