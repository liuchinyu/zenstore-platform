import { createClient, RedisClientType } from "redis";

// Redis 配置
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD, // 使用找到的密碼
  db: parseInt(process.env.REDIS_DB || "0"),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

// Redis 客戶端實例
let redisClient: RedisClientType | null = null;

// 初始化 Redis 客戶端
export async function initializeRedis(): Promise<void> {
  try {
    if (redisClient) {
      console.log("Redis 客戶端已存在，直接使用");
      return;
    }

    redisClient = createClient(REDIS_CONFIG);

    // 錯誤處理
    redisClient.on("error", (err) => {
      console.error("Redis 連線錯誤:", err);
    });

    // 連線成功
    redisClient.on("connect", () => {
      console.log("Redis 連線成功");
    });

    // 連線就緒
    redisClient.on("ready", () => {
      console.log("Redis 客戶端就緒");
    });

    // 連線中斷
    redisClient.on("end", () => {
      console.log("Redis 連線中斷");
    });

    // 連線到 Redis
    await redisClient.connect();
  } catch (error) {
    console.error("Redis 初始化失敗:", error);
    throw error;
  }
}

// 獲取 Redis 客戶端
export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error("Redis 客戶端尚未初始化，請先調用 initializeRedis()");
  }
  return redisClient;
}

// 關閉 Redis 連線
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log("Redis 連線已關閉");
  }
}

// 檢查 Redis 連線狀態
export function isRedisConnected(): boolean {
  return redisClient?.isOpen || false;
}

export default {
  initializeRedis,
  getRedisClient,
  closeRedis,
  isRedisConnected,
};
