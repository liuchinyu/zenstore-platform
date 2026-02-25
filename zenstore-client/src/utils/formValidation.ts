// src/utils/formValidation.ts

/**
 * 表單驗證工具函數
 */

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * 驗證台灣手機號碼格式
 * 格式: 09XX-XXX-XXX 或 09XXXXXXXX
 */
export const validateMobilePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === "") {
    return { isValid: false, message: "手機號碼為必填欄位" };
  }

  // 移除所有非數字字元
  const cleanPhone = phone.replace(/\D/g, "");

  // 檢查是否為 10 位數字且以 09 開頭
  if (!/^09\d{8}$/.test(cleanPhone)) {
    return {
      isValid: false,
      message: "手機號碼格式不正確，應為 09 開頭的 10 位數字",
    };
  }

  return { isValid: true, message: "" };
};

/**
 * 驗證台灣統一編號格式
 * 格式: 8 位數字
 */
export const validateTaxId = (taxId: string): ValidationResult => {
  if (!taxId || taxId.trim() === "") {
    return { isValid: false, message: "統一編號為必填欄位" };
  }

  // 移除所有非數字字元
  const cleanTaxId = taxId.replace(/\D/g, "");

  // 檢查是否為 8 位數字
  if (!/^\d{8}$/.test(cleanTaxId)) {
    return {
      isValid: false,
      message: "統一編號格式不正確，應為 8 位數字",
    };
  }

  // 統一編號邏輯驗證 (使用標準演算法)
  const weights = [1, 2, 1, 2, 1, 2, 4, 1];
  let sum = 0;

  for (let i = 0; i < 8; i++) {
    let product = parseInt(cleanTaxId[i]) * weights[i];
    // 如果乘積大於 9，則將十位數和個位數相加
    sum += Math.floor(product / 10) + (product % 10);
  }

  // 第 7 位數字為 7 時的特殊處理
  const isValid =
    sum % 10 === 0 || (parseInt(cleanTaxId[6]) === 7 && (sum + 1) % 10 === 0);

  if (!isValid) {
    return {
      isValid: false,
      message: "統一編號驗證失敗，請確認號碼是否正確",
    };
  }

  return { isValid: true, message: "" };
};

/**
 * 驗證電子郵件格式
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === "") {
    return { isValid: false, message: "電子信箱為必填欄位" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: "電子信箱格式不正確",
    };
  }

  return { isValid: true, message: "" };
};

/**
 * 驗證必填欄位
 */
export const validateRequired = (
  value: string,
  fieldName: string,
): ValidationResult => {
  if (!value || value.trim() === "") {
    return { isValid: false, message: `${fieldName}為必填欄位` };
  }

  return { isValid: true, message: "" };
};

/**
 * 驗證市話格式 (選填)
 * 格式: 區碼-號碼 或 區碼號碼
 * 例如: 02-12345678, 0212345678
 */
export const validatePhone = (phone: string): ValidationResult => {
  // 市話為選填，空值視為有效
  if (!phone || phone.trim() === "") {
    return { isValid: true, message: "" };
  }

  // 移除所有非數字字元
  const cleanPhone = phone.replace(/\D/g, "");

  // 檢查長度 (區碼 2-3 位 + 號碼 6-8 位 = 8-11 位)
  if (cleanPhone.length < 8 || cleanPhone.length > 11) {
    return {
      isValid: false,
      message: "市話格式不正確",
    };
  }

  return { isValid: true, message: "" };
};

/**
 * 驗證公司行業別 (至少選擇一項)
 */
export const validateCompanyIndustry = (
  industries: string[],
): ValidationResult => {
  if (!industries || industries.length === 0) {
    return { isValid: false, message: "請至少選擇一項公司行業別" };
  }

  return { isValid: true, message: "" };
};

/**
 * 驗證「其他」行業別的說明文字
 */
export const validateOtherIndustry = (
  industries: string[],
  otherText: string,
): ValidationResult => {
  // 如果選擇了「其他」，則必須填寫說明
  if (industries.includes("其他") && (!otherText || otherText.trim() === "")) {
    return {
      isValid: false,
      message: "請填寫其他行業別的說明",
    };
  }

  return { isValid: true, message: "" };
};

/**
 * 驗證整個公司會員表單
 */
/**
 * 基礎會員資料介面 (共用欄位)
 */
export interface BaseProfileData {
  name: string;
  mobilePhone: string;
  email: string;
  phone?: string;
}

/**
 * 驗證基礎會員資料 (共用驗證邏輯)
 */
export const validateBaseProfile = (
  data: BaseProfileData,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // 驗證姓名
  const nameResult = validateRequired(data.name, "姓名");
  if (!nameResult.isValid) errors.name = nameResult.message;

  // 驗證手機號碼
  const mobileResult = validateMobilePhone(data.mobilePhone);
  if (!mobileResult.isValid) errors.mobilePhone = mobileResult.message;

  // 驗證電子信箱
  const emailResult = validateEmail(data.email);
  if (!emailResult.isValid) errors.email = emailResult.message;

  // 驗證市話 (選填)
  if (data.phone) {
    const phoneResult = validatePhone(data.phone);
    if (!phoneResult.isValid) errors.phone = phoneResult.message;
  }

  return errors;
};

/**
 * 驗證整個公司會員表單
 */
export interface CompanyFormValidationData extends BaseProfileData {
  companyName: string;
  taxid: string;
  jobTitle: string;
  companyIndustry: string[];
  otherCompanyIndustry: string;
}

export const validateCompanyForm = (
  data: CompanyFormValidationData,
): { isValid: boolean; errors: Record<string, string> } => {
  // 1. 先執行基礎驗證
  const baseErrors = validateBaseProfile(data);
  const errors: Record<string, string> = { ...baseErrors };

  // 2. 執行公司特定驗證
  // 驗證公司抬頭
  const companyNameResult = validateRequired(data.companyName, "公司抬頭");
  if (!companyNameResult.isValid)
    errors.companyName = companyNameResult.message;

  // 驗證統一編號
  const taxIdResult = validateTaxId(data.taxid);
  if (!taxIdResult.isValid) errors.taxid = taxIdResult.message;

  // 驗證職稱
  const jobTitleResult = validateRequired(data.jobTitle, "職稱");
  if (!jobTitleResult.isValid) errors.jobTitle = jobTitleResult.message;

  // 驗證公司行業別
  const industryResult = validateCompanyIndustry(data.companyIndustry);
  if (!industryResult.isValid) errors.companyIndustry = industryResult.message;

  // 驗證「其他」行業別說明
  const otherIndustryResult = validateOtherIndustry(
    data.companyIndustry,
    data.otherCompanyIndustry,
  );
  if (!otherIndustryResult.isValid)
    errors.otherCompanyIndustry = otherIndustryResult.message;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * 驗證個人會員表單
 */
export interface PersonFormValidationData extends BaseProfileData {}

export const validatePersonForm = (
  data: PersonFormValidationData,
): { isValid: boolean; errors: Record<string, string> } => {
  // 直接使用基礎驗證
  const errors = validateBaseProfile(data);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * 驗證收貨地址表單
 */
export interface AddressFormValidationData {
  NAME: string;
  MOBILE_PHONE: string;
  LANDLINE_PHONE: string;
  EMAIL: string;
  REGION: string;
  DISTRICT: string;
  ADDRESS: string;
  POSTAL_CODE: string;
}

export const validateAddressForm = (
  data: AddressFormValidationData,
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // 驗證姓名
  const nameResult = validateRequired(data.NAME, "收貨人姓名");
  if (!nameResult.isValid) errors.NAME = nameResult.message;

  // 驗證行動電話
  const mobileResult = validateMobilePhone(data.MOBILE_PHONE);
  if (!mobileResult.isValid) errors.MOBILE_PHONE = mobileResult.message;

  // 驗證室內電話 (必填)
  const landlineResult = validateRequired(data.LANDLINE_PHONE, "室內電話");
  if (!landlineResult.isValid) {
    errors.LANDLINE_PHONE = landlineResult.message;
  } else {
    // 驗證格式
    const phoneFormatResult = validatePhone(data.LANDLINE_PHONE);
    if (!phoneFormatResult.isValid) {
      errors.LANDLINE_PHONE = phoneFormatResult.message;
    }
  }

  // 驗證電子信箱
  const emailResult = validateEmail(data.EMAIL);
  if (!emailResult.isValid) errors.EMAIL = emailResult.message;

  // 驗證地區
  const regionResult = validateRequired(data.REGION, "地區");
  if (!regionResult.isValid) errors.REGION = regionResult.message;

  // 驗證行政區
  const districtResult = validateRequired(data.DISTRICT, "行政區");
  if (!districtResult.isValid) errors.DISTRICT = districtResult.message;

  // 驗證收件地址
  const addressResult = validateRequired(data.ADDRESS, "收件地址");
  if (!addressResult.isValid) errors.ADDRESS = addressResult.message;

  // 驗證郵遞區號
  const postalCodeResult = validateRequired(data.POSTAL_CODE, "郵遞區號");
  if (!postalCodeResult.isValid) {
    errors.POSTAL_CODE = postalCodeResult.message;
  } else {
    // 簡單驗證郵遞區號格式 (3-6碼數字)
    if (!/^[0-9]{3,6}$/.test(data.POSTAL_CODE)) {
      errors.POSTAL_CODE = "郵遞區號格式不正確";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
