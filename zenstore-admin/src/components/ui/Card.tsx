"use client";

import React, { ReactNode } from "react";

interface CardProps {
  className?: string;
  children: ReactNode;
  title?: string;
  footer?: ReactNode;
  headerAction?: ReactNode;
}

export const Card: React.FC<CardProps> = ({
  className = "",
  children,
  title,
  footer,
  headerAction,
}) => {
  return (
    <div className={`card h-100 shadow-sm ${className}`}>
      {(title || headerAction) && (
        <div className="card-header d-flex justify-content-between align-items-center bg-white">
          {title && <h5 className="card-title mb-0">{title}</h5>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer bg-white">{footer}</div>}
    </div>
  );
};
