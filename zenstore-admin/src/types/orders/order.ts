export interface OrderDetail {
  // 基本訂單資訊
  order_id: string;
  order_status: string;
  order_date: string;
  last_updated: string;

  // 商品資訊
  item_id: string;
  oracle_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;

  // 金額資訊
  subtotal: number;
  shipping_fee: number;
  total_amount: number;

  // 收件人資訊
  receiver_name: string;
  receiver_phone: string;
  receiver_landing_phone: string;
  receiver_email: string;
  postal_code: string;
  region: string;
  district: string;
  address: string;

  // 配送資訊
  delivery_method: string;
  delivery_time: string;
  shipping_status: string;

  // 付款資訊
  payment_status: string;
  payment_due_date: string;

  // 其他
  notes: string | null;
}

// 商品明細介面
export interface ProductDetail {
  brand: string;
  image_url: string;
  item_id: string;
  oracle_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

// 將訂單資料按功能分組的介面
export interface GroupedOrderDetail {
  basicInfo: {
    order_id: string;
    order_status: string;
    order_date: string;
    last_updated: string;
    invoice_type: string;
  };
  productDetails: ProductDetail[];
  financialInfo: {
    subtotal: number;
    shipping_fee: number;
    total_amount: number;
  };
  receiverInfo: {
    name: string;
    receiver_phone: string;
    receiver_landing_phone: string;
    email: string;
    postal_code: string;
    region: string;
    district: string;
    address: string;
  };
  shippingInfo: {
    method: string;
    time: string;
    status: string;
  };
  paymentInfo: {
    status: string;
    due_date: string;
    payment_method: string;
    Atm_Last_Five_Digits: string;
  };
  additionalInfo: {
    notes: string | null;
  };
  cancelInfo: {
    cancel_reason: string | null;
    cancel_verified: string | null;
    refund_method: string | null;
    refund_bank: string | null;
    refund_account_name: string | null;
    refund_account: string | null;
  };
}

// 狀態變動記錄介面
export interface OrderStatusChangeLog {
  log_id: string;
  order_id: string;
  status_type: "order_status" | "payment_status" | "shipping_status";
  operation_id?: number;
  previous_value: string;
  new_value: string;
  changed_by?: string; // 操作人員（可選）
  changed_source?: string;
  created_at: string;
  metadata?: string; // 備註（可選）
}

// 擴展 OrderStatusUpdate 介面，加入變動記錄功能
export interface OrderStatusUpdate {
  order_id: string | string[];
  order_status?: string;
  payment_status?: string;
  shipping_status?: string;
  notes?: string;
  tracking_number?: string;
  // 新增：記錄變動的原始狀態
  original_status?: {
    order_status?: string;
    payment_status?: string;
    shipping_status?: string;
  };
}

// 訂單狀態類型
export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  VOIDED = "VOIDED",
}

// 付款狀態類型
export enum PaymentStatus {
  UNPAID = "UNPAID",
  PENDING_CONFIRMATION = "PENDING_CONFIRMATION",
  PAID = "PAID",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  REFUNDING = "REFUNDING",
  REFUNDED = "REFUNDED",
  PAYMENT_TIMEOUT = "PAYMENT_TIMEOUT",
}

// 配送狀態類型
export enum ShippingStatus {
  UNSHIPPED = "UNSHIPPED",
  PREPARING = "PREPARING",
  SHIPPED = "SHIPPED",
  ARRIVED = "ARRIVED",
  RETURNING = "RETURNING",
  RETURNED = "RETURNED",
}
