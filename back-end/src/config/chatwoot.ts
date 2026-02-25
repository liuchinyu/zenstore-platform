import dotenv from "dotenv";

dotenv.config();

export const chatwootConfig = {
  // Chatwoot 帳戶 ID
  accountId: process.env.CHATWOOT_ACCOUNT_ID,
  // Chatwoot API 存取權杖
  apiToken: process.env.CHATWOOT_API_TOKEN,
  // Chatwoot 平台的基本 URL
  baseUrl: process.env.CHATWOOT_BASE_URL || "http://localhost:3002",
  // 用於發送訊息的收件匣 ID
  inboxId: process.env.CHATWOOT_INBOX_ID,
};
