/**
 * 產品相關類型定義
 * 路徑：src/types/models/product.ts
 */

/**
 * 產品基本資訊
 */
export interface Product {
  ORACLE_ID: string;
  PRODUCT_ID: string;
  DESCRIPTION: string;
  BRAND: string;
  INVENTORY: number;
  FIXED_LOT_MULTIPLIER: number;
  IMAGE_URL: string;
  PRICE: number;
  CATEGORY_TITLE?: string;
  PRODUCT_COUNT?: number;
  IS_PUBLISHED: number;
}

/**
 * 產品分類
 */
export interface ProductCategory {
  CATEGORY_ID: number;
  CATEGORY_LEVEL: number;
  CATEGORY_TITLE: string;
  CATEGORY_TYPE: string;
}

/**
 * 產品圖片
 */
export interface ProductImage {
  IMAGE_ID: number;
  IMAGE_TYPE: string;
  IMAGE_URL: string;
  DISPLAY_ORDER: number;
}

/**
 * 產品價格
 */
export interface ProductPrice {
  PRICE_ID: number;
  AREA: string;
  CURRENCY: string;
  MIN: number;
  MAX: number;
  PRICE: number;
  UNIT: string;
}

/**
 * 價格區間
 */
export interface PriceRange {
  minQuantity: string | number;
  maxQuantity: string | number;
  unit: string;
  unitPrice: string | number;
}

/**
 * 產品詳細資料
 */
export interface ProductDetailData {
  categories: ProductCategory[];
  images: ProductImage[];
  prices: ProductPrice[];
  product: {
    BRAND: string;
    CURRENT_ZAP: string | null;
    DESCRIPTION: string;
    FIXED_LOT_MULTIPLIER: number;
    HIGH_TEMP: string | null;
    HIGH_VOLTAGE: string | null;
    IMAGE_URL: string;
    INVENTORY: number;
    IS_PUBLISHED: number;
    LOW_TEMP: string | null;
    LOW_VOLTAGE: string | null;
    ORACLE_ID: string;
    PACKAGE_METHOD: string | null;
    PRICE: number;
    PRODUCT_APPLICATION: string | null;
    PRODUCT_ID: string;
    SEO_DESCRIPTION: string | null;
    SEO_TITLE: string | null;
    UNIT_WEIGHT: number;
    VENDOR_LEAD_TIME: string | null;
  };
  tags: string[];
}

/**
 * 產品詳情 API 回應
 */
export interface ProductDetail {
  success: boolean;
  message: string;
  data: ProductDetailData;
}
