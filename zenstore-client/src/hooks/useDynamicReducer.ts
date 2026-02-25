// src/hooks/useDynamicReducer.ts
import { useEffect, useState, useRef } from "react";
import { injectReducer } from "@/store/store";

/**
 * 自定義 Hook 用於動態導入和注入 Redux reducer
 * @param key reducer 的鍵名
 * @param importFn 導入 reducer 的函數
 * @returns 是否已載入完成
 */

// 全局追蹤已嘗試注入的 reducers
const attemptedInjection = new Set<string>();

export function useDynamicReducer(
  key: string,
  importFn: () => Promise<any>
): boolean {
  const [isLoaded, setIsLoaded] = useState(false);
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    // 如果已經嘗試過注入，直接返回
    if (attemptedInjection.has(key) || hasAttemptedRef.current) {
      setIsLoaded(true);
      return;
    }

    const loadReducer = async () => {
      try {
        // 記錄注入的資訊
        hasAttemptedRef.current = true;
        attemptedInjection.add(key);

        const module = await importFn();
        injectReducer(key, module.default);
        setIsLoaded(true);
      } catch (error) {
        console.error(`Failed to load ${key} reducer:`, error);
        setIsLoaded(false);
        attemptedInjection.delete(key); // 失敗時移除標記
        hasAttemptedRef.current = false;
      }
    };

    loadReducer();
  }, [key]);

  return isLoaded;
}
