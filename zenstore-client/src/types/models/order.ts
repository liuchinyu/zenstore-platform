/**
 * 訂單相關類型定義
 * 路徑：src/types/models/order.ts
 */

import { CheckoutShippingInfo } from "./address";

/**
 * 訂單狀態列舉
 */
export enum OrderStatus {
  PENDING = "pending", // 待處理
  CONFIRMED = "confirmed", // 已確認
  PROCESSING = "processing", // 處理中
  SHIPPED = "shipped", // 已出貨
  DELIVERED = "delivered", // 已送達
  CANCELLED = "cancelled", // 已取消
  REFUNDED = "refunded", // 已退款
}

/**
 * 訂單項目
 */
export interface OrderItem {
  product_id: string;
  oracle_id?: string;
  quantity: number;
  price: number;
  options?: Record<string, string>;
}

/**
 * 訂單篩選參數
 */
export interface OrderFilterParams {
  startDate?: string;
  endDate?: string;
  status?: string;
}

/**
 * 建立訂單請求
 */
export interface CreateOrderRequest {
  member_id: string;
  items: OrderItem[];
  shipping: CheckoutShippingInfo;
  payment_method: string;
  coupon_code?: string;
  note?: string;
  shippingFee: number;
}

/**
 * 訂單主檔資料
 */
export interface OrderMaster {
  order_id: string;
  member_id: string;
  order_date: string;
  total_amount: number;
  status: OrderStatus;
  payment_method: string;
  shipping_fee: number;
  note?: string;
}

/**
 * 訂單詳細資料
 */
export interface OrderDetail extends OrderMaster {
  items: OrderItem[];
  shipping: CheckoutShippingInfo;
  created_at: string;
  updated_at: string;
}
