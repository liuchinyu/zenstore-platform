"use client";
import { useEffect, useRef, useState, useCallback } from "react";
// 移除 import styles
import { brandsData } from "@/utils/manufacture";

import { useIsMobile } from "@/hooks/useIsMobile";

const Brands = () => {
  // 模擬資料介面
  interface Brand {
    brand_id: number;
    brand: string;
    imageUrl: string;
  }

  const mockProducts: Brand[] = brandsData.map((item, index) => ({
    brand_id: index + 1,
    brand: item.brand,
    imageUrl: item.imageUrl,
  }));

  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [cardWidth, setCardWidth] = useState<number>(0);

  const handleResize = useCallback(() => {
    if (!cardContainerRef.current) return;
    const newCardWidth =
      cardContainerRef.current.offsetWidth / (isMobile ? 3 : 6);
    setCardWidth(newCardWidth);
    const newMaxScroll = -(
      newCardWidth *
      (mockProducts.length - (isMobile ? 3 : 6))
    );
    setCurrentPosition((position) =>
      Math.max(newMaxScroll, Math.min(0, position))
    );
  }, [mockProducts.length]); // 移除 isMobile 避免循環

  const isMobile = useIsMobile({
    breakpoint: 768,
    onResize: handleResize,
  });

  // 重新計算邏輯
  const recalculate = useCallback(() => {
    if (!cardContainerRef.current) return;

    const newCardWidth =
      cardContainerRef.current.offsetWidth / (isMobile ? 3 : 6);
    setCardWidth(newCardWidth);

    const newMaxScroll = -(
      newCardWidth *
      (mockProducts.length - (isMobile ? 3 : 6))
    );

    setCurrentPosition((position) => {
      const normalizedPosition = Math.max(newMaxScroll, Math.min(0, position));
      return normalizedPosition;
    });
  }, [mockProducts.length]); // 移除 isMobile 依賴

  // 使用共用 hook

  // 初始設定
  useEffect(() => {
    recalculate();
  }, [recalculate]);

  // 計算是否需要輪播（資料筆數是否超過一次顯示的數量）
  const needCarousel = mockProducts.length > (isMobile ? 3 : 6);

  const getCardWidth = () => {
    return cardWidth;
  };

  // 計算最大滾動距離
  const getMaxScroll = () => {
    const cardWidth = getCardWidth();
    return -(cardWidth * (mockProducts.length - (isMobile ? 3 : 6)));
  };

  const handlePrev = () => {
    const cardWidth = getCardWidth();
    const newPosition = Math.min(currentPosition + cardWidth, 0);
    setCurrentPosition(newPosition);
  };

  const handleNext = () => {
    const cardWidth = getCardWidth();
    const maxScroll = getMaxScroll();
    const newPosition = Math.max(currentPosition - cardWidth, maxScroll);
    setCurrentPosition(newPosition);
  };

  return (
    <div className="container-fluid mt-5 border border-dark py-3">
      <div className="row">
        <div className="col-12">
          <div className="d-flex">
            <h2 className="h4 me-auto">優勢品牌</h2>
            <a href="/" className="brandLink">
              查看所有製造商
            </a>
          </div>
        </div>

        <div className="col position-relative px-1 px-sm-5">
          {/* 只在需要輪播時顯示左箭頭按鈕 */}
          {needCarousel && (
            <button
              className="btn position-absolute start-0 top-50 translate-middle-y arrowBtn"
              onClick={handlePrev}
              disabled={currentPosition === 0}
            >
              <i className="bi bi-chevron-left fs-1"></i>
            </button>
          )}

          <div className="cardWrapper">
            <div
              ref={cardContainerRef}
              className="cardContainer"
              style={{
                transform: `translateX(${currentPosition}px)`,
              }}
            >
              {mockProducts.map((brand) => (
                <div key={brand.brand_id} className="cardItem">
                  <div className=" h-100 align-items-center px-4">
                    <img
                      src={brand.imageUrl}
                      className=" w-100 object-position-center"
                      alt={brand.brand}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 只在需要輪播時顯示右箭頭按鈕 */}
          {needCarousel && (
            <button
              className="btn position-absolute end-0 top-50 translate-middle-y arrowBtn"
              onClick={handleNext}
              disabled={currentPosition <= getMaxScroll()}
            >
              <i className="bi bi-chevron-right fs-1"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Brands;
