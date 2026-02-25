/**
 * 支付相關類型定義
 * 路徑：src/types/models/payment.ts
 */

/**
 * 支付方式列舉
 */
export enum PaymentMethod {
  ATM = "ATM",
  CREDIT_CARD = "CREDIT_CARD",
}

/**
 * 發票類型列舉
 */
export enum InvoiceType {
  PERSON = "person", // 個人發票（二聯式）
  COMPANY = "company", // 公司發票（三聯式）
}

/**
 * 發票處理方式列舉
 */
export enum InvoiceHandling {
  DONATE = "donate", // 捐贈
  PRINT = "print", // 紙本
}

/**
 * 信用卡類型列舉
 */
export enum CreditCardType {
  VISA = "VISA",
  MASTERCARD = "MASTERCARD",
  JCB = "JCB",
  AMEX = "AMEX",
}

/**
 * 支付資訊介面
 * 用於結帳流程中的支付資料
 */
export interface PaymentInfo {
  paymentMethod: PaymentMethod; // 支付方式
  invoiceType?: InvoiceType;
  isPersonInvoice?: boolean; // 是否為二聯式發票
  invoiceHandling?: InvoiceHandling; // 發票處理方式
  invoiceTitle?: string; // 企業會員發票抬頭
  tax_id?: string; // 企業會員統一編號
}

/**
 * ATM 支付資訊
 */
export interface ATMPaymentInfo extends PaymentInfo {
  paymentMethod: PaymentMethod.ATM;
  atmLastFiveDigits: string;
}

/**
 * 信用卡支付資訊
 */
export interface CreditCardPaymentInfo extends PaymentInfo {
  paymentMethod: PaymentMethod.CREDIT_CARD;
  creditCardType?: CreditCardType;
}
