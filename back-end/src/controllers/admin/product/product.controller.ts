import { Router, RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  checkChildCategories,
  publishProduct,
  getAllCategory,
  getCategoryRelation,
  applyCategory,
  createTag,
  getTag,
  getTagRelation,
  applyTag,
  updateTagCount,
  createProduct,
  getProduct,
  updateProduct,
  updateTag,
  deleteTag,
  getProductListByPage,
  getProductCategory,
  getManufactureCategory,
} from "@/models/admin/product/product.model";

import {
  uploadFile,
  deleteImage,
  exportToExcel,
  importFromExcel,
} from "../file/file.controller";

// 共用區域
import { getProductFormatted } from "@/models/shared/product.model";

import {
  productCacheMiddleware,
  setCacheMiddleware,
} from "@/middlewares/cache.middleware";

const router = Router();

const cacheMiddleware = productCacheMiddleware as RequestHandler;
const setCache = setCacheMiddleware() as RequestHandler;

router.use((req, res, next) => {
  // console.log("正在接收admin_product的請求");
  next();
});

// 獲取所有商品(有分頁)
router.get(
  "/productListByPage",
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 100;
    const filters = req.query.filters;
    const result = await getProductListByPage(page, pageSize, filters);
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  }),
);

// 取得商品、製造商所有分類
router.get(
  "/allCategory",
  cacheMiddleware,
  setCache,
  asyncHandler(async (req, res) => {
    const result = await getAllCategory();
    res.status(200).json({
      success: true,
      data: result,
    });
  }),
);

// 取得商品分類
router.get(
  "/productCategory",
  cacheMiddleware,
  setCache,
  asyncHandler(async (req, res) => {
    const result = await getProductCategory();
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  }),
);

// 取得製造商分類
router.get(
  "/manufactureCategory",
  cacheMiddleware,
  setCache,
  asyncHandler(async (req, res) => {
    const result = await getManufactureCategory();
    res.status(200).json({
      success: true,
      data: result,
    });
  }),
);

router.get(
  "/categoryRelation",
  asyncHandler(async (req, res) => {
    const result = await getCategoryRelation();
    res.status(200).json({
      success: true,
      data: result,
    });
  }),
);

router.post(
  "/applyCategory",
  asyncHandler(async (req, res) => {
    let { payload } = req.body;
    const result = await applyCategory(payload);
    res.status(200).json({
      success: true,
      data: result,
    });
  }),
);

// 新增分類
router.post(
  "/category",
  asyncHandler(async (req, res) => {
    let { category_title, parent_id, category_level, category_type } = req.body;
    const result = await createCategory(
      category_title,
      parent_id,
      category_level,
      category_type,
    );
    res.send(result);
  }),
);

// 更新分類
router.patch(
  "/category",
  asyncHandler(async (req, res) => {
    let { category_id, category_title } = req.body;
    const result = await updateCategory(category_id, category_title);
    res.send(result);
  }),
);

// 確認是否有子分類
router.get(
  "/checkChildCategories/:category_id",
  asyncHandler(async (req, res) => {
    let { category_id } = req.params;
    const result = await checkChildCategories(Number(category_id));
    res.json(result);
  }),
);

// 刪除分類
router.delete(
  "/category",
  asyncHandler(async (req, res) => {
    let { category_id } = req.body;
    const result = await deleteCategory(category_id);
    res.send(result);
  }),
);

// 新增商品
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const result = await createProduct(req.body);
    res.send(result);
  }),
);

// 更新商品
router.patch(
  "/",
  asyncHandler(async (req, res) => {
    const result = await updateProduct(req.body);
    res.send(result);
  }),
);

// 新增標籤
router.post(
  "/tag",
  asyncHandler(async (req, res) => {
    let { tag_name } = req.body;
    const result = await createTag(tag_name);
    res.send(result);
  }),
);

// 取得所有標籤
router.get(
  "/tag",
  asyncHandler(async (req, res) => {
    const result = await getTag();
    res.status(200).json({
      success: true,
      data: result,
    });
  }),
);

//更新標籤
router.patch(
  "/tag",
  asyncHandler(async (req, res) => {
    const { tag_id, tag_name } = req.body;
    const result = await updateTag(tag_id, tag_name);
    res.status(200).json({
      success: true,
      data: result,
    });
  }),
);

// 刪除標籤
router.delete(
  "/tag",
  asyncHandler(async (req, res) => {
    const { tag_id } = req.body;
    const result = await deleteTag(tag_id);
    res.status(200).json({
      success: true,
      data: result,
    });
  }),
);

// 取得標籤關聯
router.get(
  "/tagRelation",
  asyncHandler(async (req, res) => {
    const result = await getTagRelation();
    res.status(200).json({
      success: true,
      data: result,
    });
  }),
);

// 套用標籤
router.post(
  "/applyTag",
  asyncHandler(async (req, res) => {
    let { payload } = req.body;
    const result = await applyTag(payload);
    res.status(200).json({
      success: true,
      data: result,
    });
  }),
);

//更新標籤數量
router.patch(
  "/updateTagCount",
  asyncHandler(async (req, res) => {
    const result = await updateTagCount();
    res.status(200).json({
      success: true,
      data: result,
    });
  }),
);

//上下架商品
router.patch(
  "/publish",
  asyncHandler(async (req, res) => {
    let { oracle_id, is_published } = req.body;
    const result = await publishProduct(oracle_id, is_published);
    res.send(result);
  }),
);

// 圖片與 Excel 匯入匯出 API
router.post("/upload", asyncHandler(uploadFile));
router.delete("/delete-image", asyncHandler(deleteImage));
router.get("/export-excel", asyncHandler(exportToExcel));
router.post("/import-excel", asyncHandler(importFromExcel));

// 查詢指定商品
router.get(
  "/:oracle_id",
  asyncHandler(async (req, res) => {
    const { oracle_id } = req.params;
    const result = await getProduct(oracle_id);
    res.send(result);
  }),
);

// 查詢已格式化商品
router.get(
  "/formatted/:oracle_id",
  asyncHandler(async (req, res) => {
    const { oracle_id } = req.params;
    const result = await getProductFormatted(oracle_id);
    res.send(result);
  }),
);

export default router;
