/**
 * 分類相關類型定義
 * 路徑：src/types/models/category.ts
 */

/**
 * 分類資料介面
 */
export interface Category {
  CATEGORY_ID: number;
  CATEGORY_TITLE: string;
  PARENT_ID: number;
  CATEGORY_LEVEL: number;
  CATEGORY_TYPE: string;
  CREATED_AT?: string;
  UPDATED_AT?: string;
}

/**
 * 原始分類資料（從 API 回傳的陣列格式）
 */
export interface RawCategory {
  0: number; // CATEGORY_ID
  1: string; // CATEGORY_TITLE
  2: number; // PARENT_ID
  3: number; // CATEGORY_LEVEL
  6: string; // CATEGORY_TYPE
}
