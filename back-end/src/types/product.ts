// 定義類別資訊
export interface CategoryInfo {
  ids: number[];
  type: string[];
  parentId: number[];
}

// 定義產品結構
export interface Product {
  PRODUCT_ID: string;
  DESCRIPTION: string;
  BRAND: string;
  INVENTORY: number;
  FIXED_LOT_MULTIPLIER: number;
  IMAGE_URL: string;
  PRICE: number;
  ORACLE_ID: string;
  categories: {
    [categoryTitle: string]: CategoryInfo;
  };
}
