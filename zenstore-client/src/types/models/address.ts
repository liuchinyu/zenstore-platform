/**
 * 地址相關類型定義
 * 路徑：src/types/models/address.ts
 */

/**
 * 基礎收件地址介面
 * 用於儲存和管理用戶的收件地址
 */
export interface ShippingAddress {
  ID?: string;
  NAME: string;
  MOBILE_PHONE: string;
  LANDLINE_PHONE: string;
  EMAIL: string;
  REGION: string;
  DISTRICT: string;
  ADDRESS: string;
  POSTAL_CODE: string;
}

/**
 * 更新收件地址請求
 * 所有欄位都是可選的，但必須包含 id
 */
export interface UpdateShippingAddress {
  ID?: string;
  NAME?: string;
  MOBILE_PHONE?: string;
  LANDLINE_PHONE?: string;
  EMAIL?: string;
  REGION?: string;
  DISTRICT?: string;
  ADDRESS?: string;
  postal_code?: string;
}

/**
 * 結帳用的收件資訊
 * 繼承基礎地址，並新增配送相關欄位
 */
export interface CheckoutShippingInfo {
  name: string;
  mobile_phone: string;
  landline_phone: string;
  email: string;
  postal_code: string;
  region: string;
  district: string;
  address: string;
  deliveryTime: string;
  deliveryMethod: string;
  note?: string;
}

/**
 * 配送方式列舉
 */
export enum DeliveryMethod {
  HOME_DELIVERY = "home_delivery",
  // STORE_PICKUP = "store_pickup",
  // CONVENIENCE_STORE = "convenience_store",
}

/**
 * 配送時段列舉
 */
export enum DeliveryTime {
  MORNING = "morning", // 上午 (9:00-13:00)
  AFTERNOON = "afternoon", // 下午 (13:00-18:00)
  ANYTIME = "anytime", // 不指定
}
