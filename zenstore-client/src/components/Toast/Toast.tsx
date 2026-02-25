"use client";

import { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
};

const Toast = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 延遲一點時間再顯示，以便有漂亮的動畫效果
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500); // 等待動畫完成後才真正關閉
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`${"toast"} ${type} ${isVisible ? "show" : ""}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="toastContent">
        {type === "success" && (
          <i className="fa-solid fa-circle-check me-2"></i>
        )}
        {type === "error" && <i className="fa-solid fa-circle-xmark me-2"></i>}
        {type === "warning" && (
          <i className="fa-solid fa-triangle-exclamation me-2"></i>
        )}
        {type === "info" && <i className="fa-solid fa-circle-info me-2"></i>}
        <span className="message">{message}</span>
      </div>
      <button
        className="closeButton"
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 500);
        }}
        aria-label="關閉通知"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );
};

export default Toast;
