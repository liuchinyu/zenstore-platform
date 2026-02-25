export interface Product {
  ORACLE_ID: string;
  PRODUCT_ID: string;
  DESCRIPTION: string;
  BRAND: string;
  INVENTORY: number;
  FIXED_LOT_MULTIPLIER: number;
  IMAGE_URL: string;
  PRICE: number;
  STATUS?: string; // 上架狀態: "已上架", "缺貨", etc.
  UPDATED_AT?: string; // 最後修改時間
  CATEGORY?: string; // 商品分類
  IS_PUBLISHED: number; // 上下架狀態
  CATEGORY_TITLES?: string; // 商品分類
  TAG_NAMES?: string; // 標籤
}
