"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  overlay?: boolean;
  className?: string;
}

const LoadingSpinner = ({
  size = "md",
  text = "載入中...",
  overlay = false,
  className = "",
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "loading-spinner-sm",
    md: "loading-spinner-md",
    lg: "loading-spinner-lg",
  };

  const spinnerSize = sizeClasses[size];

  const spinnerContent = (
    <div className={`simple-loading-container ${className}`}>
      <div className={`simple-spinner ${spinnerSize}`}>
        <div className="spinner-circle"></div>
      </div>
      {text && (
        <div className="loading-text">
          <span className="loading-text-content">{text}</span>
        </div>
      )}
    </div>
  );

  if (overlay) {
    return <div className="simple-loading-overlay">{spinnerContent}</div>;
  }

  return spinnerContent;
};

export default LoadingSpinner;
