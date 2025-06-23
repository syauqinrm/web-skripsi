import React from "react";

// 👈 Gunakan default parameters
const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  onClick = () => {},
  type = "button",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-primary text-white hover:b73946Bg-primary-dark focus:ring-primary",
    secondary:
      "bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary",
    success: "bg-primary text-white hover:bg-green-600 focus:ring-green-500",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      type={type}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${disabledClasses}
        ${className}
      `}
      disabled={disabled}
      onClick={onClick}
      {...props}>
      {children}
    </button>
  );
};

// 👈 Hapus defaultProps jika ada
export default Button;
