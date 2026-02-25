/**
 * useChatwootWelcome Hook
 * 負責控制歡迎訊息的顯示邏輯
 */

"use client";

import { useEffect } from "react";
import { CHATWOOT_CONFIG } from "@/config/chatwoot.config";
import {
  hasSeenWelcomeMessage,
  markWelcomeMessageAsSeen,
} from "@/utils/chatwoot.utils";

interface UseChatwootWelcomeOptions {
  enabled: boolean;
  userId?: string;
}

export const useChatwootWelcome = ({
  enabled,
  userId,
}: UseChatwootWelcomeOptions) => {
  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    const handleChatwootReady = () => {
      if (!window.$chatwoot) {
        return;
      }

      const hasSeenWelcome = hasSeenWelcomeMessage(userId);

      // 對話按鈕是否延遲顯示
      if (!hasSeenWelcome) {
        // 延遲顯示歡迎訊息,避免與頁面載入衝突
        setTimeout(() => {
          markWelcomeMessageAsSeen(userId);
          window.$chatwoot?.toggleBubbleVisibility("show");
        }, CHATWOOT_CONFIG.WELCOME_MESSAGE_DELAY);
      } else {
        // 已看過歡迎訊息,只顯示對話氣泡
        window.$chatwoot.toggleBubbleVisibility("show");
      }
    };

    // 監聽 chatwoot:ready 事件
    window.addEventListener("chatwoot:ready", handleChatwootReady);

    // 如果 Chatwoot 已經準備好,直接執行
    if (window.$chatwoot && window.__chatwoot_initialized) {
      handleChatwootReady();
    }

    return () => {
      window.removeEventListener("chatwoot:ready", handleChatwootReady);
    };
  }, [enabled, userId]);
};
