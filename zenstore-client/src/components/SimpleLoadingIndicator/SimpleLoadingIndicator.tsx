"use client";

import React from "react";

interface SimpleLoadingIndicatorProps {
  text?: string;
}

const SimpleLoadingIndicator = ({
  text = "載入中...",
}: SimpleLoadingIndicatorProps) => {
  return (
    <div className="simple-loading-indicator">
      <div className="loading-dot"></div>
      <span className="loading-text">{text}</span>
    </div>
  );
};

export default SimpleLoadingIndicator;
