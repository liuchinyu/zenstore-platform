"use client";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchStoreInfo } from "@/store/contentSlice";
import { selectStoreInfo } from "@/store/selectors/contentSelector";

type StoreInfoItem = {
  ID?: number;
  TITLE: string;
  CONTENT: string;
  TITLE_COLOR?: string;
  CONTENT_COLOR?: string;
  IMAGE_URL?: string;
  IS_ACTIVE?: number;
  TITLE_FONT_SIZE?: number;
  CONTENT_FONT_SIZE?: number;
};

interface StoreInfoProps {
  isContentLoaded: boolean;
}

const StoreInfo = ({ isContentLoaded }: StoreInfoProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isContentLoaded) return;
    dispatch(fetchStoreInfo());
  }, [dispatch, isContentLoaded]);

  const rawData = useAppSelector(selectStoreInfo) as StoreInfoItem[];

  const storeInfo = useMemo(() => {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return null;
    }

    const item = rawData[0];
    return {
      title: item.TITLE || "",
      content: item.CONTENT || "",
      titleColor: item.TITLE_COLOR || "#000000",
      contentColor: item.CONTENT_COLOR || "#666666",
      imageUrl: item.IMAGE_URL || "",
      titleFontSize: item.TITLE_FONT_SIZE || 32,
      contentFontSize: item.CONTENT_FONT_SIZE || 16,
    };
  }, [rawData]);

  // 如果 content reducer 還沒載入，顯示載入狀態
  if (!isContentLoaded) {
    return (
      <div
        className="container my-5 text-center"
        role="status"
        aria-label="載入中"
      >
        <div className="spinner-border text-primary" />
        <p className="mt-2 text-muted">載入商店資訊中...</p>
      </div>
    );
  }

  if (!storeInfo) {
    return null;
  }

  return (
    <section className="container-fluid my-5">
      <div className="row justify-content-center">
        <div className="col-12">
          <h2
            className="text-center fw-bold"
            style={{
              color: storeInfo.titleColor,
              fontSize: storeInfo.titleFontSize,
            }}
          >
            {storeInfo.title}
          </h2>

          <p
            className="mt-4 mb-4 text-start fw-bold px-5"
            style={{
              color: storeInfo.contentColor,
              fontSize: `${storeInfo.contentFontSize}px`,
              whiteSpace: "pre-wrap",
            }}
          >
            {storeInfo.content}
          </p>

          {storeInfo.imageUrl && (
            <div>
              <img
                src={storeInfo.imageUrl}
                alt={storeInfo.title || "Store Info Image"}
                className="img-fluid rounded w-100 object-fit-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StoreInfo;
