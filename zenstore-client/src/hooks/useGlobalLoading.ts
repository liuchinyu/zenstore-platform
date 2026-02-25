"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAppDispatch } from "./redux";
import { setIsNavigating, setNavigationText } from "@/store/headerSlice"; //設定跳轉文字、狀態for全域等待動畫(GlobalLoading -> SimpleLoadingIndicator)

interface UseGlobalLoadingOptions {
  defaultText?: string;
  defaultDelay?: number;
}

export const useGlobalLoading = (options: UseGlobalLoadingOptions = {}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { defaultText = "載入中...", defaultDelay = 300 } = options;

  // 設定載入狀態、載入文字
  const showLoading = useCallback(
    (text?: string) => {
      dispatch(setNavigationText(text || defaultText));
      dispatch(setIsNavigating(true));
    },
    [dispatch, defaultText]
  );

  // 關閉載入動畫
  const hideLoading = useCallback(() => {
    dispatch(setIsNavigating(false));
  }, [dispatch]);

  // 取得目前相對路徑（含 query 與 hash）
  const getCurrentRelativeHref = useCallback((): string => {
    // 客戶端(SSR)
    if (typeof window !== "undefined" && window.location) {
      return `${window.location.pathname}${window.location.search}${window.location.hash}`;
    }
    // Server端(SSR)
    const query = searchParams?.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  }, [pathname, searchParams]);

  // 正規化任意輸入為相對路徑，統一URL格式（含 query 與 hash）
  const toRelative = useCallback((input: string): string => {
    if (typeof window === "undefined") {
      return input;
    }
    try {
      const url = new URL(input, window.location.origin);
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return input;
    }
  }, []);

  const isSameRoute = useCallback(
    (target: string): boolean => {
      const current = getCurrentRelativeHref();
      const next = toRelative(target);
      return current === next;
    },
    [getCurrentRelativeHref, toRelative]
  );

  // 帶等待動畫的導航（同一路由則不導覽並關閉 Loading）
  const navigateWithLoading = useCallback(
    (path: string, text?: string, delay?: number) => {
      if (!path) {
        hideLoading();
        return;
      }

      if (isSameRoute(path)) {
        hideLoading();
        return;
      }

      showLoading(text);

      setTimeout(() => {
        router.push(path);
      }, delay || defaultDelay);
    },
    [defaultDelay, hideLoading, isSameRoute, router, showLoading]
  );

  // 帶等待動畫的直接跳轉(硬跳轉)
  const redirectWithLoading = useCallback(
    (path: string, text?: string, delay?: number) => {
      if (!path) {
        hideLoading();
        return;
      }

      showLoading(text);

      setTimeout(() => {
        window.location.href = path;
        // 備援關閉，防止特殊情況卡住
        setTimeout(() => {
          hideLoading();
        }, 2000);
      }, delay || defaultDelay);
    },
    [showLoading, hideLoading, defaultDelay]
  );

  return {
    showLoading,
    hideLoading,
    navigateWithLoading,
    redirectWithLoading,
  };
};
