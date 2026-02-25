"use client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchAnnouncements } from "@/store/contentSlice";
import LoadingLink from "@/components/LoadingLink/LoadingLink";

export default function Announcements() {
  const dispatch = useAppDispatch();
  const announcements = useAppSelector(
    (state: any) => state.content?.announcements,
  );
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (!announcements || announcements.length === 0) {
      dispatch(fetchAnnouncements());
    }
  }, [announcements, dispatch]);

  // 處理分類切換
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // 過濾公告列表
  const filteredAnnouncements =
    announcements?.filter((announcement: any) => {
      if (selectedCategory === "all" && announcement.STATUS === 1) return true;
      return (
        announcement.CATEGORY === selectedCategory && announcement.STATUS === 1
      );
    }) || [];

  // 獲取分類標籤的樣式類
  const getCategoryButtonClass = (category: string) => {
    return `btn ${
      selectedCategory === category ? "btn-primary" : "btn-outline-primary"
    }`;
  };

  return (
    <>
      <div className="container-fluid p-3 mt-3">
        <div className="row">
          <div className="col-12">
            {/* 頁面標題 */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h2 mb-0">最新消息</h1>
              <div className="text-muted">
                共 {filteredAnnouncements.length} 筆公告
              </div>
            </div>

            {/* 分類標籤 */}
            <div className="mb-4">
              <div
                className="d-flex flex-wrap gap-2"
                role="group"
                aria-label="公告分類"
              >
                <button
                  type="button"
                  className={getCategoryButtonClass("all")}
                  onClick={() => handleCategoryChange("all")}
                  aria-label="顯示全部公告"
                >
                  全部
                </button>
                <button
                  type="button"
                  className={getCategoryButtonClass("活動公告")}
                  onClick={() => handleCategoryChange("活動公告")}
                  aria-label="顯示活動公告"
                >
                  活動公告
                </button>
                <button
                  type="button"
                  className={getCategoryButtonClass("最新消息")}
                  onClick={() => handleCategoryChange("最新消息")}
                  aria-label="顯示最新消息"
                >
                  最新消息
                </button>
                <button
                  type="button"
                  className={getCategoryButtonClass("其他")}
                  onClick={() => handleCategoryChange("其他")}
                  aria-label="顯示其他公告"
                >
                  其他
                </button>
              </div>
            </div>

            {/* 公告列表 */}
            <div className="announcementList">
              {!announcements ? (
                <div className="text-center text-muted py-5">
                  <div
                    className="spinner-border spinner-border-lg me-3"
                    role="status"
                  >
                    <span className="visually-hidden">載入中...</span>
                  </div>
                  <div className="mt-3">載入公告中...</div>
                </div>
              ) : filteredAnnouncements.length > 0 ? (
                <div className="row">
                  {filteredAnnouncements.map((announcement: any) => (
                    <div
                      key={announcement.ANNOUNCEMENTS_ID}
                      className="col-12 mb-3"
                    >
                      <LoadingLink
                        href={`/announcements/${announcement.ANNOUNCEMENTS_ID}`}
                        className="text-decoration-none text-dark d-block announcementItem"
                        aria-label={`查看公告：${announcement.TITLE}`}
                      >
                        <div className="d-flex align-items-start">
                          <i
                            className="fa-solid fa-chevron-right text-primary mt-1 me-3"
                            aria-hidden="true"
                          ></i>
                          <div className="flex-grow-1">
                            <div className="fw-bold mb-2 text-primary fs-5">
                              {announcement.TITLE}
                            </div>
                            <div className="d-flex align-items-center gap-3">
                              <span className="badge fw-bold text-dark">
                                {announcement.CATEGORY}
                              </span>
                              <span className="text-muted">
                                <i
                                  className="fa-regular fa-calendar me-1"
                                  aria-hidden="true"
                                ></i>
                                {announcement.PUBLISH_DATE}
                              </span>
                            </div>
                          </div>
                        </div>
                      </LoadingLink>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="fa-solid fa-inbox fa-3x mb-3"></i>
                  <p className="fs-5">此分類暫無公告訊息</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
