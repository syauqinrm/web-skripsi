import React, { useEffect } from "react";
import { X } from "lucide-react";
import Button from "./Button";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
  className = "",
  showCloseButton = true,
  preventBackdropClose = false,
}) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
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

  if (!isOpen) return null;

  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-2xl",
    large: "max-w-4xl",
    xlarge: "max-w-6xl",
    full: "max-w-7xl",
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !preventBackdropClose) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-dark/70 backdrop-blur-sm"
      onClick={handleBackdropClick}>
      <div
        className={`
          relative w-full ${sizeClasses[size]} max-h-[90vh] 
          bg-gradient-to-br from-white to-coffee-cream/20 
          rounded-2xl shadow-coffee-lg border border-coffee-cream/30 
          overflow-hidden animate-in fade-in duration-300 zoom-in-95
          ${className}
        `}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-coffee-cream/30 bg-gradient-to-r from-coffee-cream/20 to-white">
            {title && (
              <h2 className="text-2xl font-bold text-coffee-dark pr-8">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="border-coffee-cream text-coffee-medium hover:bg-coffee-cream/50 hover:text-coffee-dark flex-shrink-0">
                <X size={18} />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
