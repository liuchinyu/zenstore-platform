import { Router, RequestHandler } from "express";
import {
  getHotProducts,
  getNewProducts,
  getSaleProducts,
  batchGetCategoryCountById,
  getSearchResult,
  getProductCategoriesRelation,
  getProductsByCategory,
  getCategoriesByManufacturer,
} from "@/models/client/product/product.model";

// 共用區域
import { getProductFormatted } from "@/models/shared/product.model";

// 導入快取中介軟體
import {
  productCacheMiddleware,
  setCacheMiddleware,
} from "@/middlewares/cache.middleware";

const router = Router();

// 在檔案頂部加入類型斷言
const cacheMiddleware = productCacheMiddleware as RequestHandler;
const setCache = setCacheMiddleware() as RequestHandler;

router.use((req, res, next) => {
  next();
});

// 取得商品分類及製造商對應分類，用以前台-製造商導覽列多階層選單
router.get("/category", cacheMiddleware, setCache, (async (req, res) => {
  try {
    const result = await getCategoriesByManufacturer();
    res.status(200).json({
      success: true,
      data: { product: result?.product, manufacture: result?.manufacture },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      error: "獲取分類失敗",
    });
  }
}) as RequestHandler);

// 產品關聯用以篩選下拉選單連動
router.get("/productCategoriesRelation", cacheMiddleware, setCache, (async (
  req,
  res,
) => {
  try {
    const categoryIdStr = req.query.category_ids as string[];
    const categoryIds = categoryIdStr.map((id) => parseInt(id));

    const result = await getProductCategoriesRelation(categoryIds);
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error("獲取所有產品失敗:", e);
    res.status(500).json({
      success: false,
      error: "獲取產品列表失敗",
    });
  }
}) as RequestHandler);

// 分類產品路由 - 使用快取
router.get("/productsByCategory", cacheMiddleware, setCache, (async (
  req,
  res,
) => {
  try {
    // 類型守衛:確保參數是字串類型後再轉換
    const categoryIdStr = req.query.categoryId as string[];
    const categoryId = categoryIdStr.map((id) => parseInt(id));

    // 驗證 categoryId 是否有效
    if (!categoryId || categoryId.length === 0) {
      return res.status(400).json({
        success: false,
        error: "缺少或無效的 categoryId 參數",
      });
    }

    // 處理分頁參數,提供預設值
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const result = await getProductsByCategory(categoryId, page, pageSize);
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      error: "獲取分類產品失敗",
    });
  }
}) as RequestHandler);

// 搜尋產品
router.get("/search", cacheMiddleware, setCache, (async (req, res) => {
  try {
    const query = req.query.query as string;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 25;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: "缺少 query 參數",
      });
    }
    const result = await getSearchResult(query, page, pageSize);
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "獲取搜尋結果失敗",
    });
  }
}) as RequestHandler);

router.get("/categoryCounts/batch", cacheMiddleware, setCache, (async (
  req,
  res,
) => {
  try {
    const categoryIds = req.query.categoryIds as string[];
    const category_id = categoryIds.map((id) => parseInt(id));
    const result = await batchGetCategoryCountById(category_id);
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      error: "獲取分類數量失敗",
    });
  }
}) as RequestHandler);

// 查詢已格式化商品
router.get("/formatted/:oracle_id", (async (req, res) => {
  const { oracle_id } = req.params;
  const result = await getProductFormatted(oracle_id);
  res.send(result);
}) as RequestHandler);

// 熱門商品路由 - 使用快取
router.get("/hotProducts", cacheMiddleware, setCache, (async (req, res) => {
  try {
    const result = await getHotProducts();
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      error: "獲取熱門商品失敗",
    });
  }
}) as RequestHandler);

// 新品路由 - 使用快取
router.get("/newProducts", cacheMiddleware, setCache, (async (req, res) => {
  try {
    const result = await getNewProducts();
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      error: "獲取新品失敗",
    });
  }
}) as RequestHandler);

// 特價商品路由 - 使用快取
router.get("/saleProducts", cacheMiddleware, setCache, (async (req, res) => {
  try {
    const result = await getSaleProducts();
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      error: "獲取特價商品失敗",
    });
  }
}) as RequestHandler);

export default router;
