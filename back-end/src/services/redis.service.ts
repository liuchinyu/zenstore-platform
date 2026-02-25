import { getRedisClient } from "../config/redis";

// 快取配置
export const CACHE_CONFIG = {
  // 產品相關快取時間（秒）
  PRODUCT: 30 * 60, // 30 分鐘
  PRODUCT_SEARCH: 10 * 60, // 10 分鐘

  // 儀表板相關快取時間（秒）
  CAROUSEL: 60 * 60, // 1 小時
  NEWS: 60 * 60, // 1 小時
  ANNOUNCEMENTS: 60 * 60, // 1 小時
  TECH_RESOURCES: 60 * 60, // 1 小時

  // 使用者相關快取時間（秒）
  USER_PROFILE: 15 * 60, // 15 分鐘
  USER_ORDERS: 10 * 60, // 10 分鐘

  // 系統相關快取時間（秒）
  SYSTEM_CONFIG: 24 * 60 * 60, // 24 小時
};

// Redis 快取服務類別
export class RedisCacheService {
  private client: any = null;

  // 延遲獲取客戶端
  private async getClient() {
    if (!this.client) {
      try {
        this.client = getRedisClient();
      } catch (error) {
        console.error("Redis 客戶端獲取失敗:", error);
        throw error;
      }
    }
    return this.client;
  }

  /**
   * 設定快取
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const client = await this.getClient();
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await client.setEx(key, ttl, serializedValue);
      } else {
        await client.set(key, serializedValue);
      }
    } catch (error) {
      console.error(`Redis 設定快取失敗 [${key}]:`, error);
      // 不拋出錯誤，讓應用程式繼續運行
    }
  }

  /**
   * 獲取快取
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const client = await this.getClient();
      const value = await client.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      console.error(`Redis 獲取快取失敗 [${key}]:`, error);
      return null;
    }
  }

  /**
   * 刪除快取
   */
  async del(key: string): Promise<void> {
    try {
      const client = await this.getClient();
      await client.del(key);
    } catch (error) {
      console.error(`Redis 刪除快取失敗 [${key}]:`, error);
    }
  }

  /**
   * 檢查快取是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis 檢查快取失敗 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 設定快取（如果不存在）
   */
  async setNX(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const client = await this.getClient();
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        const result = await client.setNX(key, serializedValue);
        if (result === 1) {
          await client.expire(key, ttl);
        }
        return result === 1;
      } else {
        const result = await client.setNX(key, serializedValue);
        return result === 1;
      }
    } catch (error) {
      console.error(`Redis 設定快取失敗 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 獲取快取並延長過期時間
   */
  async getAndExtend<T>(key: string, ttl: number): Promise<T | null> {
    try {
      const client = await this.getClient();
      const value = await client.get(key);
      if (value) {
        await client.expire(key, ttl);
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      console.error(`Redis 獲取並延長快取失敗 [${key}]:`, error);
      return null;
    }
  }

  /**
   * 批量刪除快取（支援模式匹配）
   */
  // src/services/redis.service.ts
  async delPattern(pattern: string): Promise<void> {
    try {
      const client = await this.getClient();
      const keys: string[] = await client.keys(pattern);

      console.log(
        `[Redis] delPattern match count=${keys.length} pattern=${pattern}`
      );
      if (keys.length > 0) {
        // 為避免參數過長，分批刪除（每批最多 1000）
        const batchSize = 1000;
        for (let i = 0; i < keys.length; i += batchSize) {
          const batch = keys.slice(i, i + batchSize);
          console.log(
            `[Redis] deleting batch size=${batch.length}, sample=${batch
              .slice(0, 3)
              .join(", ")}`
          );
          await client.del(...batch);
        }
        // 再次檢查是否刪光
        const remain = await client.keys(pattern);
        console.log(
          `[Redis] remain after delete count=${remain.length} pattern=${pattern}`
        );
      }
    } catch (error) {
      console.error(`Redis 批量刪除快取失敗 [${pattern}]:`, error);
    }
  }

  /**
   * 清空所有快取
   */
  async flushAll(): Promise<void> {
    try {
      const client = await this.getClient();
      await client.flushDb();
    } catch (error) {
      console.error("Redis 清空快取失敗:", error);
    }
  }

  /**
   * 獲取快取統計資訊
   */
  async getStats(): Promise<{ totalKeys: number; memoryUsage: string }> {
    try {
      const client = await this.getClient();
      const info = await client.info("memory");
      const keys = await client.dbSize();

      // 解析記憶體使用量
      const memoryMatch = info.match(/used_memory_human:(\S+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1] : "Unknown";

      return {
        totalKeys: keys,
        memoryUsage,
      };
    } catch (error) {
      console.error("Redis 獲取統計資訊失敗:", error);
      return { totalKeys: 0, memoryUsage: "Unknown" };
    }
  }
}

// 建立服務實例
export const redisCacheService = new RedisCacheService();

// 導出預設實例
export default redisCacheService;
