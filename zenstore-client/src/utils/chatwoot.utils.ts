/**
 * Chatwoot 工具函數
 * 提供 Chatwoot SDK 相關的輔助函數
 */

import { CHATWOOT_CONFIG } from "@/config/chatwoot.config";
import type { ChatwootConfig } from "@/types/chatwoot";

/**
 * 檢查 Chatwoot Script 是否已載入
 */
export const isChatwootScriptLoaded = (): boolean => {
  return !!document.querySelector('script[src*="packs/js/sdk.js"]');
};

/**
 * 初始化 Chatwoot SDK
 */
export const initializeChatwootSDK = (): boolean => {
  if (!window.chatwootSDK || window.__chatwoot_initialized) {
    return false;
  }

  try {
    const config: ChatwootConfig = {
      websiteToken: CHATWOOT_CONFIG.WEBSITE_TOKEN || "",
      baseUrl: CHATWOOT_CONFIG.BASE_URL,
    };

    window.chatwootSDK.run(config);
    window.__chatwoot_initialized = true;
    return true;
  } catch (error) {
    console.error("Chatwoot SDK 初始化失敗:", error);
    return false;
  }
};

/**
 * 載入 Chatwoot SDK Script
 */
export const loadChatwootScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 如果 script 已存在,嘗試初始化
    if (isChatwootScriptLoaded()) {
      initializeChatwootSDK();
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = CHATWOOT_CONFIG.BASE_URL + CHATWOOT_CONFIG.SDK_SCRIPT_PATH;
    script.async = true;

    script.onerror = () => {
      console.error("Chatwoot SDK 載入失敗");
      reject(new Error("Failed to load Chatwoot SDK"));
    };

    script.onload = () => {
      initializeChatwootSDK();
      resolve();
    };

    document.head.appendChild(script);
  });
};

/**
 * 等待 Chatwoot API 準備就緒
 */
export const waitForChatwootAPI = (
  maxRetries = 5,
  delay = CHATWOOT_CONFIG.RETRY_DELAY,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    let retries = 0;

    const checkAPI = () => {
      if (window.$chatwoot) {
        resolve();
        return;
      }

      retries++;
      if (retries >= maxRetries) {
        reject(new Error("Chatwoot API 未能在預期時間內準備好"));
        return;
      }

      setTimeout(checkAPI, delay);
    };

    checkAPI();
  });
};

/**
 * 檢查用戶是否已看過歡迎訊息
 */
export const hasSeenWelcomeMessage = (userId: string): boolean => {
  const key = `chatwoot_welcome_seen_${userId}`;
  return localStorage.getItem(key) === "true";
};

/**
 * 標記用戶已看過歡迎訊息
 */
export const markWelcomeMessageAsSeen = (userId: string): void => {
  const key = `chatwoot_welcome_seen_${userId}`;
  localStorage.setItem(key, "true");
};
