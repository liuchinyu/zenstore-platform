"use client";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchMarquee } from "@/store/contentSlice";
import { selectMarquee } from "@/store/selectors/contentSelector";

interface TextMarqueeItem {
  ID: number;
  TEXT: string;
  SPEED_MS: number;
  TEXT_COLOR?: string;
  BACKGROUND_COLOR?: string;
}

interface TextMarqueeProps {
  /** 覆蓋預設速度 (毫秒) */
  defaultSpeedMs?: number;
  isContentLoaded: boolean;
}

const TextMarquee = ({
  defaultSpeedMs = 8000,
  isContentLoaded,
}: TextMarqueeProps) => {
  const dispatch = useAppDispatch();
  const rawData = useAppSelector(selectMarquee) as TextMarqueeItem[];

  useEffect(() => {
    if (!isContentLoaded) return;
    dispatch(fetchMarquee());
  }, [dispatch, isContentLoaded]);

  const items = useMemo<TextMarqueeItem[]>(() => {
    if (!Array.isArray(rawData)) return [];
    return rawData.map((row: TextMarqueeItem, index: number) => ({
      ID: Number(row.ID ?? index + 1),
      TEXT: String(row.TEXT ?? ""),
      SPEED_MS: Number(row.SPEED_MS ?? defaultSpeedMs),
      TEXT_COLOR: String(row.TEXT_COLOR ?? "#FFFFFF"),
      BACKGROUND_COLOR: String(row.BACKGROUND_COLOR ?? "#0d6efd"),
    }));
  }, [rawData, defaultSpeedMs]);

  const first = useMemo<TextMarqueeItem | null>(() => {
    if (items.length === 0) return null;
    return items[0];
  }, [items]);

  // 如果 Content 還未載入，顯示載入狀態
  if (!isContentLoaded) {
    return (
      <div className="marqueeContainer" aria-live="polite" aria-busy="true">
        <div className="marqueeWrapper bg-secondary bg-opacity-10" />
      </div>
    );
  }

  // 如果沒有資料，不顯示
  if (!first) {
    return null;
  }

  const inlineStyle: React.CSSProperties = {
    ["--marquee-duration" as any]: `${Math.max(first.SPEED_MS, 1000)}ms`,
    ["--marquee-text-color" as any]: first.TEXT_COLOR || "#FFFFFF",
    ["--marquee-bg-color" as any]: first.BACKGROUND_COLOR || "#0d6efd",
  };

  return (
    <div className="marqueeContainer" style={inlineStyle}>
      <div
        className="marqueeWrapper"
        style={{ backgroundColor: first.BACKGROUND_COLOR || undefined }}
      >
        <span
          className="marqueeText"
          style={{ color: first.TEXT_COLOR || undefined }}
          role="text"
          aria-label={first.TEXT}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.currentTarget.click();
            }
          }}
        >
          {first.TEXT}
        </span>
      </div>
    </div>
  );
};

export default TextMarquee;
