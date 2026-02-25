/**
 * 購物車相關類型定義
 * 路徑：src/types/models/cart.ts
 */

/**
 * 購物車項目
 * 從資料庫取得的購物車資料格式
 */
export interface CartItem {
  ORACLE_ID: string;
  PRODUCT_ID: string;
  QUANTITY: number; // 購買數量
  PRICE: number;
  FIXED_LOT_MULTIPLIER: number;
  BRAND: string;
  IMAGE_URL: string;
}

/**
 * 加入購物車請求
 * 用於傳遞到後端的資料格式
 */
export interface AddToCartRequest {
  ORACLE_ID: string;
  ORIGINAL_QUANTITY: number; // 初次加入購物車的數量 || 已加入購物車之原本的數量
  NEW_QUANTITY?: number; // 本次新增的數量
}

/**
 * 更新購物車項目請求
 */
export interface UpdateCartItemRequest {
  oracle_id: string;
  quantity: number;
}

/**
 * 購物車動畫項目
 * 用於購物車加入動畫效果
 */
export interface CartAnimatingItem {
  id: string;
  left: number;
  top: number;
  image_url: string;
}

/**
 * 購物車 State
 * Redux store 中的購物車狀態
 */
export interface CartState {
  items: { [oracle_id: string]: CartItem }; // 查詢/異動效能較快 O(1)
  items_request: { [key: string]: AddToCartRequest }; // 請求資料快取
  isLoading: boolean;
  error: string | null;
  showCartModal: boolean;
  cartTotal: number;
  animatingItems: CartAnimatingItem[];
}
