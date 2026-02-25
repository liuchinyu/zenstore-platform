/**
 * Chatwoot 配置檔
 * 集中管理 Chatwoot 相關設定
 */

export const CHATWOOT_CONFIG = {
  // Chatwoot 伺服器基礎 URL (優先讀取 env，否則使用預設值)
  BASE_URL:
    process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || "http://localhost:3002",

  // Chatwoot 網站 Token
  WEBSITE_TOKEN: process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN,

  // SDK Script 路徑
  SDK_SCRIPT_PATH: "/packs/js/sdk.js",

  // 歡迎訊息延遲時間 (毫秒)
  WELCOME_MESSAGE_DELAY: 3000,

  // 重試延遲時間 (毫秒)
  RETRY_DELAY: 1000,
} as const;

/**
 * 生成 LocalStorage Key
 */
export const getChatwootWelcomeKey = (userId: string): string => {
  return `chatwoot_welcome_seen_${userId}`;
};
