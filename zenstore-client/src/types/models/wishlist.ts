/**
 * 收藏清單相關類型定義
 * 路徑：src/types/models/wishlist.ts
 */

/**
 * 收藏清單項目
 */
export interface WishlistItem {
  member_id?: string;
  wishlist_id: number;
  oracle_id: string;
  product_id: string;
  brand: string;
  description: string;
  inventory: number;
  price: number;
  fixed_lot_multiplier: number;
  image_url: string;
  created_at?: string;
}

/**
 * 收藏清單 State
 * Redux store 中的收藏清單狀態
 */
export interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
}
