"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchAnnouncements, fetchNews } from "@/store/contentSlice";
import convertToEmbedUrl from "@/utils/iframeTransform";
import LoadingLink from "@/components/LoadingLink/LoadingLink";

import {
  selectNews,
  selectAnnouncements,
} from "@/store/selectors/contentSelector";

interface NewsProps {
  isContentLoaded: boolean;
}

const News = ({ isContentLoaded }: NewsProps) => {
  const dispatch = useAppDispatch();

  const news = useAppSelector(selectNews);
  const announcements = useAppSelector(selectAnnouncements);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handlePrevious = () => {
    if (news.length > 0) {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? news.length - 1 : prevIndex - 1,
      );
    }
  };

  const handleNext = () => {
    if (news.length > 0) {
      setCurrentIndex((prevIndex) =>
        prevIndex === news.length - 1 ? 0 : prevIndex + 1,
      );
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const getCategoryButtonClass = (category: string) => {
    return `btn ${
      selectedCategory === category ? "btn-primary" : "btn-outline-primary"
    }`;
  };

  useEffect(() => {
    if (!isContentLoaded) return;
    if (!news || news.length === 0) {
      dispatch(fetchNews());
    }
  }, [dispatch, isContentLoaded]);

  useEffect(() => {
    if (!isContentLoaded) return;
    if (!announcements || announcements.length === 0) {
      dispatch(fetchAnnouncements());
    }
  }, [dispatch, isContentLoaded]);

  // 記憶化過濾結果
  const filteredAnnouncements = useMemo(() => {
    if (!announcements) return [];
    if (selectedCategory === "all") return announcements;
    return announcements.filter(
      (announcement: any) => announcement.CATEGORY === selectedCategory,
    );
  }, [announcements, selectedCategory]);

  // slice只顯示3筆公告
  const displayedAnnouncements = filteredAnnouncements.slice(0, 3);
  const hasMoreAnnouncements = filteredAnnouncements.length > 3;
  const currentNewsItem = news[currentIndex] || null;

  // 記憶化轉換後的 URL
  const currentVideoUrl = useMemo(() => {
    return currentNewsItem ? convertToEmbedUrl(currentNewsItem.URL) : "";
  }, [currentNewsItem]);

  // 如果 content reducer 還沒載入，顯示載入狀態
  if (!isContentLoaded) {
    return (
      <section
        className="container-fluid mt-4 border border-secondary text-responsive overflow-y-auto"
        aria-labelledby="news-heading"
      >
        <div className="row justify-content-center pt-3 h-100">
          <div className="col-12 text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">載入中...</span>
            </div>
            <p className="mt-2 text-muted">載入最新消息中...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="container-fluid mt-4 border border-secondary text-responsive overflow-y-auto"
      aria-labelledby="news-heading"
    >
      <div className="row justify-content-center pt-3 h-100">
        <div className="col-12 col-md-6">
          <div className="d-flex mb-3">
            <h3 id="news-heading" className="h3">
              最新消息
            </h3>
          </div>
          {news && news.length > 0 && (
            <>
              <div className="w-100 d-flex justify-content-center">
                <div className="mb-3" style={{ width: "55%" }}>
                  <div className="ratio ratio-16x9 object-fit-cover">
                    <iframe
                      src={currentVideoUrl}
                      title="YouTube 影片"
                      allowFullScreen
                      className="rounded"
                      loading="lazy"
                      aria-label="YouTube 影片內容"
                    ></iframe>
                  </div>
                </div>
              </div>

              {/* 新增導航按鈕 */}
              <div className="d-flex justify-content-center gap-3 mb-3">
                <button
                  className="btn btn-outline-primary"
                  onClick={handlePrevious}
                  aria-label="上一筆資料"
                >
                  <i className="fa-solid fa-chevron-left me-1"></i>
                  上一筆
                </button>
                <span className="align-self-center">
                  {currentIndex + 1} / {news.length}
                </span>
                <button
                  className="btn btn-outline-primary"
                  onClick={handleNext}
                  aria-label="下一筆資料"
                >
                  下一筆
                  <i className="fa-solid fa-chevron-right ms-1"></i>
                </button>
              </div>

              {/* 顯示當前影片標題 */}
              <div className="text-center mb-3">
                <h5>{currentNewsItem?.TITLE}</h5>
              </div>
            </>
          )}
        </div>

        <div className="col-12 col-md-6 mh-100 news-line-height overflow-y-auto">
          {/* 公告列表 - 新增分類標籤和公告列表 */}
          <div className="d-flex mb-3">
            <h4 className="h4 mb-0">公告訊息</h4>
          </div>

          {/* 分類標籤 */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="btn-group" role="group" aria-label="公告分類">
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
              <LoadingLink
                href="/announcements"
                className="text-decoration-none"
                aria-label="查看所有公告"
              >
                <small className="text-primary fw-bold">
                  共 {filteredAnnouncements.length} 筆公告
                  <i
                    className="fa-solid fa-chevron-right ms-1"
                    aria-hidden="true"
                  ></i>
                </small>
              </LoadingLink>
            </div>
          </div>

          {/* 公告列表容器 */}
          <div className="announcementList">
            {!announcements ? (
              <div className="text-center text-muted py-4">
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                >
                  <span className="visually-hidden">載入中...</span>
                </div>
                載入公告中...
              </div>
            ) : displayedAnnouncements.length > 0 ? (
              <>
                <ul className="list-unstyled">
                  {displayedAnnouncements.map((announcement: any) => (
                    <li key={announcement.ANNOUNCEMENTS_ID} className="mb-2">
                      <a
                        href={`/announcements/${announcement.ANNOUNCEMENTS_ID}`}
                        className="text-decoration-none text-dark d-block announcementItem"
                        aria-label={`查看公告：${announcement.TITLE}`}
                      >
                        <div className="d-flex align-items-start">
                          <i
                            className="fa-solid fa-chevron-right text-primary mt-1 me-2"
                            aria-hidden="true"
                          ></i>
                          <div className="flex-grow-1">
                            <div className="fw-bold mb-1 text-primary">
                              {announcement.TITLE}
                            </div>
                            <div className="small text-muted">
                              <span className="badge fw-bold text-dark me-2">
                                {announcement.CATEGORY}
                              </span>
                              <span>
                                <i
                                  className="fa-regular fa-calendar me-1"
                                  aria-hidden="true"
                                ></i>
                                {announcement.PUBLISH_DATE}
                              </span>
                            </div>
                          </div>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>

                {/* 查看更多提示 */}
                {hasMoreAnnouncements && (
                  <div className="text-center mt-3 mb-2">
                    <LoadingLink
                      href="/announcements"
                      className="btn btn-outline-primary btn-sm"
                      aria-label="查看更多公告"
                    >
                      查看更多公告
                      <i
                        className="fa-solid fa-chevron-right ms-1"
                        aria-hidden="true"
                      ></i>
                    </LoadingLink>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-muted py-4">
                <i className="fa-solid fa-inbox fa-2x mb-2"></i>
                <p>此分類暫無公告訊息</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default News;
