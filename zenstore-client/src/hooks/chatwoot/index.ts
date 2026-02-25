/**
 * Chatwoot Hooks 統一匯出
 */

export { useChatwootSDK } from "./useChatwootSDK";
export { useChatwootUser } from "./useChatwootUser";
export { useChatwootWelcome } from "./useChatwootWelcome";

/**
 * 組合式 Hook - 統一管理所有 Chatwoot 功能
 */
import { useChatwootSDK } from "./useChatwootSDK";
import { useChatwootUser } from "./useChatwootUser";
import { useChatwootWelcome } from "./useChatwootWelcome";

interface UseChatwootOptions {
  enabled: boolean;
  userId?: string;
  userEmail?: string;
  userName?: string;
}

export const useChatwoot = ({
  enabled,
  userId,
  userEmail,
  userName,
}: UseChatwootOptions) => {
  // 1. 載入 SDK
  useChatwootSDK({ enabled });

  // 2. 設定用戶
  useChatwootUser({ enabled, userId, userEmail, userName });

  // 3. 控制歡迎訊息
  useChatwootWelcome({ enabled, userId });
};
