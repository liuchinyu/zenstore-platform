"use client";

import React from "react";
import { Card } from "../ui/Card";

type IconType = "box" | "wallet" | "tag";
type BgColorType = "primary" | "info" | "danger" | "success" | "warning";

interface StatsCardProps {
  title: string;
  value: number;
  icon: IconType;
  iconBg: BgColorType;
}

// 圖標映射
const iconMap: Record<IconType, string> = {
  box: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-seam" viewBox="0 0 16 16">
        <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2zm3.564 1.426L5.596 5 8 5.961 14.154 3.5zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464z"/>
        </svg>`,
  wallet: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-wallet2" viewBox="0 0 16 16">
          <path d="M12.136.326A1.5 1.5 0 0 1 14 1.78V3h.5A1.5 1.5 0 0 1 16 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-9a1.5 1.5 0 0 1 1.432-1.499L12.136.326zM5.562 3H13V1.78a.5.5 0 0 0-.621-.484zM1.5 4a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z"/>
          </svg>`,
  tag: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-tag" viewBox="0 0 16 16">
        <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0"/>
        <path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1m0 5.586 7 7L13.586 9l-7-7H2z"/>
        </svg>`,
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  iconBg,
}) => {
  console.log("title", title);
  console.log("value", value);
  return (
    <Card className="stats-card">
      <div className="d-flex align-items-center">
        <div
          className={`icon-container rounded-circle d-flex align-items-center justify-content-center me-3 bg-${iconBg} bg-opacity-10`}
          style={{ width: "48px", height: "48px" }}
          dangerouslySetInnerHTML={{ __html: iconMap[icon] }}
        />
        <div>
          <h6 className="text-muted mb-1 small">{title}</h6>
          <h3 className="mb-0 fw-bold">{value}</h3>
        </div>
      </div>
    </Card>
  );
};
