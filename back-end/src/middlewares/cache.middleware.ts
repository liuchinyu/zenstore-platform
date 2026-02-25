import { Request, Response, NextFunction } from "express";
import { redisCacheService, CACHE_CONFIG } from "../services/redis.service";

// 快取中介軟體選項
interface CacheOptions {
  ttl?: number; // 快取過期時間（秒）
  key?: string; // 自定義快取鍵值
  prefix?: string; // 快取鍵值前綴
  condition?: (req: Request) => boolean; // 快取條件函數
}

// 生成快取鍵值
function generateCacheKey(
  req: Request,
  prefix?: string,
  customKey?: string,
): string {
  if (customKey) {
    return customKey;
  }

  const baseKey = `${prefix || "api"}:${req.method}:${req.originalUrl}`;

  // 如果有查詢參數，加入快取鍵值
  if (Object.keys(req.query).length > 0) {
    const queryString = JSON.stringify(req.query);
    return `${baseKey}:${Buffer.from(queryString).toString("base64")}`;
  }

  return baseKey;
}

// 快取檢查中介軟體
export function cacheMiddleware(options: CacheOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 檢查是否滿足快取條件
      if (options.condition && !options.condition(req)) {
        return next();
      }

      const cacheKey = generateCacheKey(req, options.prefix, options.key);
      const ttl = options.ttl || CACHE_CONFIG.SYSTEM_CONFIG;

      // 嘗試從快取獲取資料
      const cachedData = await redisCacheService.get(cacheKey);

      if (cachedData) {
        console.log(`快取命中: ${cacheKey}`);
        // console.log("快取資料:", cachedData); // 新增：檢查快取資料內容
        return res.json({
          success: true,
          data: cachedData,
          fromCache: true,
          timestamp: new Date().toISOString(),
        });
      }

      // 快取未命中，繼續執行下一個中介軟體
      console.log(`快取未命中: ${cacheKey}`);

      // 將快取鍵值和 TTL 附加到請求物件，供後續使用
      (req as any).cacheKey = cacheKey;
      (req as any).cacheTTL = ttl;

      next();
    } catch (error) {
      console.error("快取中介軟體錯誤:", error);
      // 快取出錯時繼續執行，不影響主要功能
      next();
    }
  };
}

// 快取設定中介軟體
export function setCacheMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cacheKey = (req as any).cacheKey;
      const cacheTTL = (req as any).cacheTTL;

      if (!cacheKey || !cacheTTL) {
        return next();
      }

      // 攔截原始回應
      const originalSend = res.json;

      res.json = function (data: any) {
        // 設定快取
        if (data && data.success && data.data) {
          redisCacheService
            .set(cacheKey, data.data, cacheTTL)
            .then(() => {
              console.log(`快取已設定: ${cacheKey} (TTL: ${cacheTTL}s)`);
            })
            .catch((error) => {
              console.error(`設定快取失敗: ${cacheKey}`, error);
            });
        }

        // 調用原始回應方法
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error("設定快取中介軟體錯誤:", error);
      next();
    }
  };
}

// 快取清除中介軟體
export function clearCacheMiddleware(pattern: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 清除指定模式的快取
      await redisCacheService.delPattern(pattern);
      console.log(`快取已清除: ${pattern}`);

      next();
    } catch (error) {
      console.error(`清除快取失敗: ${pattern}`, error);
      next();
    }
  };
}

// 產品快取中介軟體（預設配置）
export const productCacheMiddleware = cacheMiddleware({
  prefix: "product",
  ttl: CACHE_CONFIG.PRODUCT,
});

// 搜尋快取中介軟體（預設配置）
export const searchCacheMiddleware = cacheMiddleware({
  prefix: "search",
  ttl: CACHE_CONFIG.PRODUCT_SEARCH,
});

// 儀表板快取中介軟體（預設配置）
export const contentCacheMiddleware = cacheMiddleware({
  prefix: "content",
  ttl: CACHE_CONFIG.CAROUSEL,
});

// 使用者快取中介軟體（預設配置）
export const userCacheMiddleware = cacheMiddleware({
  prefix: "user",
  ttl: CACHE_CONFIG.USER_PROFILE,
  condition: (req) => req.method === "GET", // 只快取 GET 請求
});

// 導出所有中介軟體
export default {
  cacheMiddleware,
  setCacheMiddleware,
  clearCacheMiddleware,
  productCacheMiddleware,
  searchCacheMiddleware,
  contentCacheMiddleware,
  userCacheMiddleware,
};
