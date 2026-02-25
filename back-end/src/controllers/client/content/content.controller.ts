import { Router, RequestHandler } from "express";

import {
  getActiveAnnouncements,
  getActiveMarquees,
  getActiveStoreInfo,
} from "@/models/client/content/content.model";

import {
  getCarousel,
  getNews,
  getTechResources,
} from "@/models/shared/content.model";

// 導入快取中介軟體
import {
  contentCacheMiddleware,
  setCacheMiddleware,
} from "@/middlewares/cache.middleware";

const router = Router();

// 類型斷言解決 TypeScript 錯誤
const cacheMiddleware = contentCacheMiddleware as RequestHandler;
const setCache = setCacheMiddleware() as RequestHandler;

// 技術資源
router.get("/tech-resources", cacheMiddleware, setCache, (async (req, res) => {
  try {
    const result = await getTechResources();
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("獲取技術資源失敗:", error);
    res.status(500).json({
      success: false,
      message: "獲取技術資源失敗",
    });
  }
}) as RequestHandler);

// 公告
router.get("/announcements/active", cacheMiddleware, setCache, (async (
  req,
  res,
) => {
  try {
    const result = await getActiveAnnouncements();
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("獲取公告失敗:", error);
    res.status(500).json({
      success: false,
      message: "獲取公告失敗",
    });
  }
}) as RequestHandler);

// 輪播圖
router.get("/carousel", cacheMiddleware, setCache, (async (req, res) => {
  try {
    const result = await getCarousel();
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("獲取輪播圖失敗:", error);
    res.status(500).json({
      success: false,
      message: "獲取輪播圖失敗",
    });
  }
}) as RequestHandler);

// 最新消息
router.get("/news", cacheMiddleware, setCache, (async (req, res) => {
  try {
    const result = await getNews();
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("獲取新聞失敗:", error);
    res.status(500).json({
      success: false,
      message: "獲取新聞失敗",
    });
  }
}) as RequestHandler);

// 跑馬燈
router.get("/marquee/active", cacheMiddleware, setCache, (async (req, res) => {
  try {
    const result = await getActiveMarquees();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("獲取跑馬燈失敗:", error);
    res.status(500).json({ success: false, message: "獲取跑馬燈失敗" });
  }
}) as RequestHandler);

// 商場資訊
router.get("/store-info/active", cacheMiddleware, setCache, (async (
  req,
  res,
) => {
  try {
    const result = await getActiveStoreInfo();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("獲取商店資訊失敗:", error);
    res.status(500).json({ success: false, message: "獲取商店資訊失敗" });
  }
}) as RequestHandler);

export default router;
