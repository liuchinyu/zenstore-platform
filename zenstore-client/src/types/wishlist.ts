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
}
