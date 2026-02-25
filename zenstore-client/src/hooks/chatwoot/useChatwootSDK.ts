/**
 * useChatwootSDK Hook
 * 負責 Chatwoot SDK 的載入與初始化
 */

"use client";

import { useEffect, useRef } from "react";
import { loadChatwootScript } from "@/utils/chatwoot.utils";

interface UseChatwootSDKOptions {
  enabled: boolean;
}

export const useChatwootSDK = ({ enabled }: UseChatwootSDKOptions) => {
  const sdkInitialized = useRef(false);

  useEffect(() => {
    if (!enabled || sdkInitialized.current) {
      return;
    }

    sdkInitialized.current = true;

    // 載入 Chatwoot SDK
    loadChatwootScript().catch((error) => {
      console.error("Chatwoot SDK 載入失敗:", error);
      sdkInitialized.current = false;
    });
  }, [enabled]);

  return { sdkInitialized: sdkInitialized.current };
};
