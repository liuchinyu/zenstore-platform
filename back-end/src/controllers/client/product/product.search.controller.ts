// controllers/product/product.search.controller.ts
import { Request, Response } from "express";
import { searchProducts } from "../../../services/client/elasticsearch/product.elastic";

export async function searchProductsController(req: Request, res: Response) {
  try {
    const {
      query = "", // 搜索關鍵字
      page = 1, // 當前頁碼
      pageSize = 25, // 每頁數量
      minPrice, // 最低價格
      maxPrice, // 最高價格
      categoryId, // 分類ID
      sortBy = "score", // 排序欄位
      sortOrder = "desc", // 排序方向
    } = req.query;

    // 計算分頁參數
    const from = (Number(page) - 1) * Number(pageSize);

    // 構建過濾條件
    const filters: any = {};
    if (minPrice || maxPrice) {
      filters.minPrice = Number(minPrice);
      filters.maxPrice = Number(maxPrice);
    }
    if (categoryId) {
      filters.categoryId = categoryId;
    }

    // 執行搜索
    const result = await searchProducts(
      query as string,
      from,
      Number(pageSize),
      filters,
    );

    // 格式化響應
    res.json({
      success: true,
      data: {
        total: result.total,
        items: result.hits,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(
          ((result.total as any)?.value ?? 0) / Number(pageSize),
        ),
      },
    });
  } catch (error) {
    console.error("搜索產品時發生錯誤:", error);
    res.status(500).json({
      success: false,
      message: "搜索產品時發生錯誤",
    });
  }
}
