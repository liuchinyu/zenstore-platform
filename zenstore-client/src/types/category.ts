export interface Category {
  CATEGORY_ID: number;
  CATEGORY_TITLE: string;
  PARENT_ID: number;
  CATEGORY_LEVEL: number;
  CATEGORY_TYPE: string;
  CREATED_AT?: string;
  UPDATED_AT?: string;
}

export interface RawCategory {
  0: number; // CATEGORY_ID
  1: string; // CATEGORY_TITLE
  2: number; // PARENT_ID
  3: number; // CATEGORY_LEVEL
  6: string; // CATEGORY_TYPE
}

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

export interface ProductCategory {
  CATEGORY_ID: number;
  CATEGORY_LEVEL: number;
  CATEGORY_TITLE: string;
  CATEGORY_TYPE: string;
}

export interface ProductImage {
  // 根據實際需求定義圖片結構
  IMAGE_ID: number;
  IMAGE_TYPE: string;
  IMAGE_URL: string;
  DISPLAY_ORDER: number;
}

export interface ProductPrice {
  // 根據實際需求定義價格結構
  PRICE_ID: number;
  AREA: string;
  CURRENCY: string;
  MIN: number;
  MAX: number;
  PRICE: number;
  UNIT: string;
}

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

export interface ProductDetail {
  success: boolean;
  message: string;
  data: ProductDetailData;
}

export interface PriceRange {
  minQuantity: string | number;
  maxQuantity: string | number;
  unit: string;
  unitPrice: string | number;
}

// 取得join的購物車資料
export interface CartItem {
  ORACLE_ID: string;
  PRODUCT_ID: string;
  QUANTITY: number; //購買數量
  PRICE: number;
  FIXED_LOT_MULTIPLIER: number;
  BRAND: string;
  IMAGE_URL: string;
}

// 傳遞到後端的interface
export interface AddToCartRequest {
  ORACLE_ID: string;
  ORIGINAL_QUANTITY: number; //初次加入購物車的數量 || 已加入購物車之原本的數量
  NEW_QUANTITY?: number; //本次新增的數量
}

export interface CartState {
  // 查詢/異動效能較快O(1)
  items: { [oracle_id: string]: CartItem };
  // items: number;
  items_request: { [key: string]: AddToCartRequest };
  isLoading: boolean;
  error: string | null;
  showCartModal: boolean;
  cartTotal: number;
  animatingItems: {
    id: string;
    left: number;
    top: number;
    image_url: string;
  }[];
}
