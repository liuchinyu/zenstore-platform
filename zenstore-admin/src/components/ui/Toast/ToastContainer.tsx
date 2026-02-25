import React from "react";
import Toast, { ToastProps } from "./Toast";

interface ToastContainerProps {
  toasts: ToastProps[];
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  onClose: (id: string) => void;
}

const positionStyles = {
  "top-right": {
    top: "1rem",
    right: "1rem",
  },
  "top-left": {
    top: "1rem",
    left: "1rem",
  },
  "bottom-right": {
    bottom: "1rem",
    right: "1rem",
  },
  "bottom-left": {
    bottom: "1rem",
    left: "1rem",
  },
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = "top-right",
  onClose,
}) => {
  const positionStyle = positionStyles[position];

  return (
    <div
      className="toast-container position-fixed d-flex flex-column"
      style={{
        zIndex: 1060,
        ...positionStyle,
        gap: "0.5rem",
        maxWidth: "350px",
      }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
