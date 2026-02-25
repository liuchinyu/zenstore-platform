import {
  Request,
  Response,
  NextFunction,
  Router,
  RequestHandler,
} from "express";

import fileUpload from "express-fileupload";
import fs from "fs";
import path from "path";

import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  addCarousel,
  updateCarousel,
  updateCarouselOrder,
  deleteCarousel,
  getMarquees,
  createMarquee,
  updateMarqueePartial,
  deleteMarquee,
  activateMarquee,
  deactivateMarquee,
  createNews,
  updateNews,
  deleteNews,
  getStoreInfo,
  createStoreInfo,
  deleteStoreInfo,
  updateStoreInfo,
  activateStoreInfo,
  deactivateStoreInfo,
  createTechResource,
  updateTechResource,
  deleteTechResource,
} from "@/models/admin/content/content.model";

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

// 建立技術資源
router.post("/tech-resources", (async (req, res) => {
  const { data } = req.body;
  const result = await createTechResource(data);
  res.send(result);
}) as RequestHandler);

// 更新技術資源
router.put("/tech-resources/:id", (async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  const result = await updateTechResource(id, data);
  res.send(result);
}) as RequestHandler);

router.delete("/tech-resources/:id", (async (req, res) => {
  const { id } = req.params;
  const result = await deleteTechResource(id);
  res.send(result);
}) as RequestHandler);

// 公告
// 獲取公告
router.get("/announcements", cacheMiddleware, setCache, (async (req, res) => {
  try {
    const result = await getAnnouncements();
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

// 建立公告
router.post("/announcements", (async (req, res) => {
  const { data } = req.body;
  const result = await createAnnouncement(data);
  res.send(result);
}) as RequestHandler);

// 更新公告
router.put("/announcements/:id", (async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  const result = await updateAnnouncement(id, data);
  res.send(result);
}) as RequestHandler);

// 刪除公告
router.delete("/announcements/:id", (async (req, res) => {
  const { id } = req.params;
  const result = await deleteAnnouncement(id);
  res.send(result);
}) as RequestHandler);

// 輪播圖
export const uploadCarouselImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const files = req.files as fileUpload.FileArray | null | undefined;
    if (!files || Object.keys(files).length === 0) {
      res.status(400).json({ success: false, message: "沒有提供圖片" });
      return;
    }

    // 1. 取得上傳的圖片檔案
    const image = files.image as fileUpload.UploadedFile;
    if (!image) {
      res.status(400).json({ success: false, message: "沒有找到圖片檔案" });
      return;
    }

    // 2. 驗證檔案類型（只允許圖片）
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedMimeTypes.includes(image.mimetype)) {
      res.status(400).json({
        success: false,
        message: "只允許上傳圖片檔案 (JPEG, PNG, GIF, WebP)",
      });
      return;
    }

    // 3. 設定目標路徑
    const networkRootPath = "\\\\10.1.1.132\\DMaker\\html\\upload\\Ecommerce";
    const targetDir = path.join(networkRootPath, "carousel");

    console.log("上傳的圖片資訊:", {
      name: image.name,
      size: image.size,
      mimetype: image.mimetype,
    });

    // 4. 確保目標目錄存在
    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
    } catch (mkdirError) {
      console.error("創建目錄時出錯:", mkdirError);
      res.status(500).json({
        success: false,
        message: "伺服器無法建立儲存目錄",
      });
      return;
    }

    // 5. 儲存圖片檔案
    const fileName = image.name;
    const filePath = path.join(targetDir, fileName);

    await fs.promises.writeFile(filePath, image.data);

    console.log("成功上傳輪播圖片:", { filePath, fileName });

    // 6. 返回上傳結果
    const publicBaseUrl = "https://comeon.zenitron.com.tw";
    const localBasePath = "\\\\10.1.1.132\\DMaker\\html";
    const publicFilePath = filePath
      .replace(localBasePath, publicBaseUrl)
      .replace(/\\/g, "/");

    console.log("公開檔案路徑:", publicFilePath);

    res.json({
      success: true,
      message: "輪播圖片上傳成功",
      file_path: publicFilePath,
      file_name: fileName,
      file_size: image.size,
    });
  } catch (error) {
    console.error("上傳輪播圖片時發生錯誤:", error);
    res.status(500).json({
      success: false,
      message: "上傳輪播圖片時發生錯誤",
    });
  }
};

router.post("/carousel/upload", uploadCarouselImage);

// 獲取輪播圖 - 使用快取
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

// 新增輪播資料
router.post("/carousel", (async (req, res) => {
  const result = await addCarousel(req.body);
  res.send(result);
}) as RequestHandler);

// 更新輪播資料
router.put("/carousel/:id", (async (req, res) => {
  const result = await updateCarousel(req.body);
  res.send(result);
}) as RequestHandler);

// 更新輪播順序
router.patch("/carousel/order/:id", (async (req, res) => {
  const result = await updateCarouselOrder(
    parseInt(req.params.id),
    req.body.display_order,
    req.body.change,
  );
  res.send(result);
}) as RequestHandler);

// 刪除輪播資料
router.delete("/carousel/:id", (async (req, res) => {
  const { index } = req.body;
  const result = await deleteCarousel(parseInt(req.params.id), index);
  res.send(result);
}) as RequestHandler);

// 獲取新聞 - 使用快取
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

// 建立技術資源
router.post("/news", (async (req, res) => {
  const { data } = req.body;
  const result = await createNews(data);
  res.send(result);
}) as RequestHandler);

// 更新技術資源
router.put("/news/:id", (async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  const result = await updateNews(id, data);
  res.send(result);
}) as RequestHandler);

router.delete("/news/:id", (async (req, res) => {
  const { id } = req.params;
  const result = await deleteNews(id);
  res.send(result);
}) as RequestHandler);

// 跑馬燈
// 取得跑馬燈列表（使用快取）
router.get("/marquee", cacheMiddleware, setCache, (async (req, res) => {
  try {
    const result = await getMarquees();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("獲取跑馬燈失敗:", error);
    res.status(500).json({ success: false, message: "獲取跑馬燈失敗" });
  }
}) as RequestHandler);

// 新增跑馬燈
router.post("/marquee", (async (req, res) => {
  try {
    const { item } = req.body;
    const result = await createMarquee(item);
    res.json(result);
  } catch (error) {
    console.error("新增跑馬燈失敗:", error);
    res.status(500).json({ success: false, message: "新增跑馬燈失敗" });
  }
}) as RequestHandler);

// 部分更新跑馬燈
router.patch("/marquee/:id", (async (req, res) => {
  try {
    const { id } = req.params;
    const { item } = req.body;
    const result = await updateMarqueePartial(id, item);
    console.log("result...", result);
    res.json(result);
  } catch (error) {
    console.error("更新跑馬燈失敗:", error);
    res.status(500).json({ success: false, message: "更新跑馬燈失敗" });
  }
}) as RequestHandler);

// 刪除跑馬燈
router.delete("/marquee/:id", (async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteMarquee(id);
    res.json(result);
  } catch (error) {
    console.error("刪除跑馬燈失敗:", error);
    res.status(500).json({ success: false, message: "刪除跑馬燈失敗" });
  }
}) as RequestHandler);

// 啟用（單一啟用）
router.post("/marquee/:id/activate", (async (req, res) => {
  try {
    const { id } = req.params;
    const result = await activateMarquee(id);
    res.json(result);
  } catch (error) {
    console.error("啟用跑馬燈失敗:", error);
    res.status(500).json({ success: false, message: "啟用跑馬燈失敗" });
  }
}) as RequestHandler);

// 停用
router.post("/marquee/:id/deactivate", (async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deactivateMarquee(id);
    res.json(result);
  } catch (error) {
    console.error("停用跑馬燈失敗:", error);
    res.status(500).json({ success: false, message: "停用跑馬燈失敗" });
  }
}) as RequestHandler);

// 商場資訊
export const uploadStoreInfoImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const files = req.files as fileUpload.FileArray | null | undefined;
    if (!files || Object.keys(files).length === 0) {
      res.status(400).json({ success: false, message: "沒有提供圖片" });
      return;
    }

    // 1. 取得上傳的圖片檔案
    const image = files.image as fileUpload.UploadedFile;
    if (!image) {
      res.status(400).json({ success: false, message: "沒有找到圖片檔案" });
      return;
    }
    console.log("image...", image);

    // 2. 驗證檔案類型（只允許圖片）
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedMimeTypes.includes(image.mimetype)) {
      res.status(400).json({
        success: false,
        message: "只允許上傳圖片檔案 (JPEG, PNG, GIF, WebP)",
      });
      return;
    }

    // 3. 設定目標路徑
    const networkRootPath = "\\\\10.1.1.132\\DMaker\\html\\upload\\Ecommerce";
    const targetDir = path.join(networkRootPath, "storeInfo");

    console.log("上傳的圖片資訊:", {
      name: image.name,
      size: image.size,
      mimetype: image.mimetype,
    });

    // 4. 確保目標目錄存在
    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
    } catch (mkdirError) {
      console.error("創建目錄時出錯:", mkdirError);
      res.status(500).json({
        success: false,
        message: "伺服器無法建立儲存目錄",
      });
      return;
    }

    // 5. 儲存圖片檔案
    const fileName = image.name;
    const filePath = path.join(targetDir, fileName);

    await fs.promises.writeFile(filePath, image.data);

    console.log("成功上傳輪播圖片:", { filePath, fileName });

    // 6. 返回上傳結果
    const publicBaseUrl = "https://comeon.zenitron.com.tw";
    const localBasePath = "\\\\10.1.1.132\\DMaker\\html";
    const publicFilePath = filePath
      .replace(localBasePath, publicBaseUrl)
      .replace(/\\/g, "/");

    console.log("公開檔案路徑:", publicFilePath);

    res.json({
      success: true,
      message: "輪播圖片上傳成功",
      file_path: publicFilePath,
      file_name: fileName,
      file_size: image.size,
    });
  } catch (error) {
    console.error("上傳輪播圖片時發生錯誤:", error);
    res.status(500).json({
      success: false,
      message: "上傳輪播圖片時發生錯誤",
    });
  }
};

// 取得商店資訊
router.get("/store-info", cacheMiddleware, setCache, (async (req, res) => {
  try {
    const result = await getStoreInfo();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("獲取商店資訊失敗:", error);
    res.status(500).json({ success: false, message: "獲取商店資訊失敗" });
  }
}) as RequestHandler);

// 創建商店資訊
router.post("/store-info", (async (req, res) => {
  try {
    console.log("req.body", req.body);
    const result = await createStoreInfo(req.body.data);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("新增商店資訊失敗:", error);
    res.status(500).json({ success: false, message: "新增商店資訊失敗" });
  }
}) as RequestHandler);

// 上傳商店資訊圖片
router.post("/store-info/upload", uploadStoreInfoImage);

// 刪除商店資訊
router.delete("/store-info/:id", (async (req, res) => {
  try {
    const result = await deleteStoreInfo(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("刪除商店資訊失敗:", error);
    res.status(500).json({ success: false, message: "刪除商店資訊失敗" });
  }
}) as RequestHandler);

// 修改商店資訊
router.patch("/store-info/:id", (async (req, res) => {
  try {
    const result = await updateStoreInfo(req.params.id, req.body.data);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("修改商店資訊失敗:", error);
    res.status(500).json({ success: false, message: "修改商店資訊失敗" });
  }
}) as RequestHandler);

// 啟用（單一啟用）
router.post("/store-info/:id/activate", (async (req, res) => {
  try {
    const { id } = req.params;
    const result = await activateStoreInfo(id);
    res.json(result);
  } catch (error) {
    console.error("啟用商場資訊失敗:", error);
    res.status(500).json({ success: false, message: "啟用商場資訊失敗" });
  }
}) as RequestHandler);

// 停用
router.post("/store-info/:id/deactivate", (async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id", id);
    const result = await deactivateStoreInfo(id);
    res.json(result);
  } catch (error) {
    console.error("停用商場資訊失敗:", error);
    res.status(500).json({ success: false, message: "停用商場資訊失敗" });
  }
}) as RequestHandler);

export default router;
