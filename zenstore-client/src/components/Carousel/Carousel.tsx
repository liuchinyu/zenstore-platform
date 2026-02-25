"use client";
import Image from "next/image";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchCarousel } from "@/store/contentSlice";
// 匯入Content選擇器
import { selectCarousel } from "@/store/selectors/contentSelector";

interface CarouselItem {
  ID: number;
  POSITION: "left" | "right";
  IMAGE_URL: string;
  TITLE: string;
  DESCRIPTION: string;
  BUTTON_LINK: string;
  BUTTON_TEXT: string;
  BACKGROUND_COLOR: string;
  TEXT_COLOR: string;
}

interface CarouselProps {
  isContentLoaded: boolean;
}

// 創建自定義樣式函數，根據背景顏色
const getBackgroundStyle = (bgColor: string) => {
  return {
    backgroundColor: bgColor,
  };
};

// 創建文字顏色樣式函數
const getTextColorStyle = (textColor: string) => {
  return {
    color: textColor,
  };
};

const Carousel = ({ isContentLoaded }: CarouselProps) => {
  const dispatch = useAppDispatch();
  const carousel = useAppSelector(selectCarousel) as CarouselItem[];
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!isContentLoaded) return;
    dispatch(fetchCarousel());
  }, [dispatch, isContentLoaded]);

  // 如果輪播圖數據還未加載，顯示加載狀態或返回空
  if (!isContentLoaded) {
    return (
      <div className="vh-40 d-flex justify-content-center align-items-center">
        載入中...
      </div>
    );
  }

  // 處理圖片加載錯誤
  const handleImageError = (index: number) => {
    setImageError((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  return (
    <div
      id="carouselAutoplaying"
      className="carousel slide"
      data-bs-ride="carousel"
      data-bs-interval="4000"
      data-bs-touch="true"
    >
      <div className="carousel-indicators bottom11">
        {carousel.map((item, index) => (
          <button
            key={item.ID}
            type="button"
            data-bs-target="#carouselAutoplaying"
            data-bs-slide-to={index.toString()}
            className={`wSm15 ${index === 0 ? "active" : ""}`}
            aria-current={index === 0 ? "true" : undefined}
            aria-label={`Slide ${index + 1}`}
          ></button>
        ))}
      </div>

      <div className="carousel-inner">
        {carousel.map((item, index) => (
          <div
            key={item.ID}
            className={`carousel-item ${index === 0 ? "active" : ""}`}
          >
            <div
              className={`d-flex flex-wrap ${
                item.POSITION === "right" ? "" : "flex-row-reverse"
              } align-items-stretch `}
            >
              <div className="position-relative col-12 col-md-6 carousel-image-wrapper">
                {imageError[index] ? (
                  <div
                    className="w-100 bg-light d-flex justify-content-center align-items-center"
                    style={{ minHeight: "250px" }}
                  >
                    <p>圖片無法載入</p>
                  </div>
                ) : (
                  <Image
                    src={item.IMAGE_URL}
                    alt={item.TITLE || "輪播圖"}
                    width={800}
                    height={400}
                    className="w-100 carousel-img"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index === 0}
                    onError={() => handleImageError(index)}
                  />
                )}
              </div>
              <div
                className="col-12 col-md-6 d-flex flex-column justify-content-center align-items-center p-3 text-white"
                style={getBackgroundStyle(item.BACKGROUND_COLOR)}
              >
                <h2 className="mt-3 carouselTitle">{item.TITLE}</h2>
                <h4
                  className="mt-3 p-0 carouselText"
                  style={getTextColorStyle(item.TEXT_COLOR)}
                >
                  {item.DESCRIPTION}
                </h4>
                <a
                  href={item.BUTTON_LINK}
                  className="btn btn-light w-30 rounded-pill fw-bold carouselText mb-4"
                  style={getTextColorStyle(item.BACKGROUND_COLOR)}
                >
                  {item.BUTTON_TEXT}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="carousel-control-prev wSm15 mxSm6"
        type="button"
        data-bs-target="#carouselAutoplaying"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next wSm15 mxSm6"
        type="button"
        data-bs-target="#carouselAutoplaying"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default Carousel;
