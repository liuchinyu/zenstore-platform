"use client";

import React from "react";
import Link from "next/link";
import clsx from "clsx";

const ContentPage: React.FC = () => {
  const ContentItems = [
    {
      id: "marquee",
      title: "跑馬燈",
      description: "設定跑馬燈文字、顏色、速度與啟停日期（單一啟用）",
      icon: "bi-sliders",
      path: "/content/marquee",
      color: "danger",
    },
    {
      id: "technical-resources",
      title: "技術資源",
      description: "管理技術文檔、API 文檔、開發指南等技術相關資源",
      icon: "bi-diagram-3",
      path: "/content/technical-resources",
      color: "primary",
    },
    {
      id: "carousel",
      title: "輪播圖",
      description: "管理首頁輪播圖片的顯示順序、內容和連結",
      icon: "bi-images",
      path: "/content/carousel",
      color: "success",
    },
    {
      id: "store-info",
      title: "商場資訊",
      description: "管理商場基礎資訊、標題、內容和圖片設定",
      icon: "bi-building",
      path: "/content/store-info",
      color: "secondary",
    },
    {
      id: "news",
      title: "最新消息",
      description: "發布和管理網站的最新消息、活動公告等內容",
      icon: "bi-newspaper",
      path: "/content/news",
      color: "info",
    },
    {
      id: "announcements",
      title: "公告欄",
      description: "管理重要公告、系統維護通知等公告內容",
      icon: "bi-megaphone",
      path: "/content/announcements",
      color: "warning",
    },
  ];

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="h3 mb-0">主畫面設定</h1>
          <p className="text-muted">管理網站首頁的各項設定和內容</p>
        </div>
      </div>

      <div className="row g-4">
        {ContentItems.map((item) => (
          <div key={item.id} className="col-12 col-md-6 col-lg">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body d-flex flex-column">
                <div className="text-center mb-3">
                  <div
                    className={clsx(
                      `bg-${item.color}`,
                      "bg-opacity-10",
                      "rounded-circle",
                      "d-inline-flex",
                      "align-items-center",
                      "justify-content-center",
                    )}
                    style={{ width: "60px", height: "60px" }}
                  >
                    <i
                      className={clsx("bi", item.icon, `text-${item.color}`)}
                    ></i>
                  </div>
                </div>

                <h5 className="card-title h5 text-center mb-2">{item.title}</h5>
                <p className="card-text text-muted text-center flex-grow-1">
                  {item.description}
                </p>

                <Link href={item.path} className="mt-auto">
                  <button
                    className={clsx("btn", `btn-${item.color}`, "w-100")}
                    type="button"
                  >
                    進入設定
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentPage;
