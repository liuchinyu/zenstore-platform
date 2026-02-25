"use client";

import React from "react";
import Link from "next/link";
import { Card } from "../ui/Card";

interface ChartCardProps {
  title: string;
  value: number | string;
  moreLink?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  value,
  moreLink,
}) => {
  const headerAction = moreLink ? (
    <Link href={moreLink} className="text-decoration-none small">
      查看更多
    </Link>
  ) : null;

  return (
    <Card
      title={title}
      headerAction={headerAction}
      className="chart-card h-100"
    >
      <div className="mb-4">
        <h3 className="mb-0 fw-bold">{value}</h3>
      </div>

      {/* 簡易圖表展示區 */}
      <div
        className="chart-placeholder"
        style={{
          height: "150px",
          background: "#f8f9fa",
          borderRadius: "0.25rem",
        }}
      >
        {/* <div className="d-flex align-items-center justify-content-center h-100 text-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            className="bi bi-graph-up me-2"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M0 0h1v15h15v1H0zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z"
            />
          </svg>
          <span>圖表區域</span>
        </div> */}
      </div>

      {/* X軸標籤 */}
      {/* <div className="d-flex justify-content-between mt-2 text-muted small">
        <span>7.5月</span>
        <span>13.5月</span>
        <span>19.5月</span>
        <span>25.5月</span>
        <span>31.5月</span>
      </div> */}
    </Card>
  );
};
