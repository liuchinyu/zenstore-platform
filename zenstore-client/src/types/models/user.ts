/**
 * 用戶相關類型定義
 * 路徑：src/types/models/user.ts
 */

/**
 * 會員類型列舉
 */
export enum MemberType {
  PERSON = "person",
  COMPANY = "company",
}

/**
 * 會員狀態列舉
 */
export enum MemberStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

/**
 * 用戶資料介面
 */
export interface UserData {
  MEMBER_ID: string;
  EMAIL: string;
  MEMBER_TYPE: string;
  ISVERIFIED: number;
  STATUS: string;
  USER_NAME: string;
  VERIFICATION_TOKEN?: string;
  MOBILE_PHONE: string;
  GENDER?: string;
  BIRTHDAY?: string;
  REGION?: string;
  CITY?: string;
  ADDRESS?: string;
  PHONE?: string;
}

/**
 * 公司資料介面
 */
export interface CompanyData {
  COMPANY_ID?: string;
  COMPANY_NAME: string;
  TAX_ID: string;
  COMPANY_PHONE?: string;
  COMPANY_ADDRESS?: string;
  INDUSTRY?: string;
  [key: string]: any;
}

/**
 * 登入憑證
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * 註冊憑證
 */
export interface RegisterCredentials {
  MEMBER_TYPE: string;
  USER_NAME: string;
  MOBILE_PHONE: string;
  EMAIL: string;
  PASSWORD_HASH: string;
}

/**
 * 更新用戶資料請求
 */
export type UpdateUserData = Partial<Omit<UserData, "MEMBER_ID" | "EMAIL">>;

/**
 * 更新公司資料請求
 */
export type UpdateCompanyData = Partial<CompanyData>;
