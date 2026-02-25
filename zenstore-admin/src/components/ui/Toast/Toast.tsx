import React, { useEffect } from "react";
import clsx from "clsx";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  // 根據類型設置不同的圖標和顏色
  const getToastConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: "bi-check-circle-fill",
          bgClass: "bg-success text-white",
          borderClass: "border-success",
        };
      case "error":
        return {
          icon: "bi-x-circle-fill",
          bgClass: "bg-danger text-white",
          borderClass: "border-danger",
        };
      case "warning":
        return {
          icon: "bi-exclamation-triangle-fill",
          bgClass: "bg-warning",
          borderClass: "border-warning",
        };
      case "info":
        return {
          icon: "bi-info-circle-fill",
          bgClass: "bg-info",
          borderClass: "border-info",
        };
      default:
        return {
          icon: "bi-info-circle-fill",
          bgClass: "bg-info",
          borderClass: "border-info",
        };
    }
  };

  const { icon, bgClass, borderClass } = getToastConfig();

  return (
    <div
      className={clsx("toast show position-relative", borderClass)}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={clsx("toast-header", bgClass)}>
        <i className={clsx("bi me-2", icon)}></i>
        <strong className="me-auto">{title}</strong>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="toast"
          aria-label="關閉"
          onClick={() => onClose(id)}
        ></button>
      </div>
      <div className="toast-body">{message}</div>
    </div>
  );
};

export default Toast;
