/**
 * useChatwootUser Hook
 * 負責設定 Chatwoot 用戶資訊與 HMAC 驗證
 */

"use client";

import { useEffect } from "react";
import { waitForChatwootAPI } from "@/utils/chatwoot.utils";
import AuthService from "@/services/authService";
import type { ChatwootUserConfig } from "@/types/chatwoot";

interface UseChatwootUserOptions {
  enabled: boolean;
  userId?: string;
  userEmail?: string;
  userName?: string;
}

export const useChatwootUser = ({
  enabled,
  userId,
  userEmail,
  userName,
}: UseChatwootUserOptions) => {
  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    let isMounted = true;

    const setupUser = async () => {
      try {
        // 等待 Chatwoot API 準備就緒
        await waitForChatwootAPI();
        if (!isMounted) return;

        // 獲取 HMAC
        const hmacResponse = await AuthService.getChatwootHmac(userId);
        if (!isMounted) return;

        if (!hmacResponse.success || !hmacResponse.data?.hmac) {
          console.error("獲取 HMAC 失敗:", hmacResponse.message);
          return;
        }

        // 設定用戶資訊
        const userConfig: ChatwootUserConfig = {
          email: userEmail || "",
          name: userName || "",
          identifier_hash: hmacResponse.data.hmac,
        };

        window.$chatwoot?.setUser(userId, userConfig);
        console.log("Chatwoot: 使用者身分設定完成");
      } catch (error) {
        console.error("設置 Chatwoot 用戶時出錯:", error);
      }
    };

    setupUser();

    return () => {
      isMounted = false;
    };
  }, [enabled, userId, userEmail, userName]);
};
