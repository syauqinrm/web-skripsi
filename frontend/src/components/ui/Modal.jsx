import React, { useEffect } from "react";
import { X } from "lucide-react";
import Button from "./Button";

const Modal = ({
  isOpen = false,
  onClose = () => {},
  title = "",
  children,
  size = "large",
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-2xl",
    large: "max-w-4xl",
    full: "max-w-7xl",
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}>
      <div
        className={`bg-white rounded-lg ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto relative`}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center p-6 border-b">
            {title && (
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            )}
            {showCloseButton && (
              <Button onClick={onClose} variant="outline" className="p-2">
                <X size={20} />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
