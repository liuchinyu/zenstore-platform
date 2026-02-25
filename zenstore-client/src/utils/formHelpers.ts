// src/utils/formHelpers.ts

/**
 * 表單輔助工具函數
 */

/**
 * 格式化日期為 YYYY-MM-DD 字串
 */
export const formatDateToString = (date: Date | null): string => {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * 比對兩個物件的欄位,回傳變更的欄位
 * @param current 當前的表單資料
 * @param original 原始的資料
 * @param fieldMap 欄位對應表 { 表單欄位名: 資料庫欄位名 }
 * @returns 變更的欄位物件
 */
export const getChangedFields = <T extends Record<string, any>>(
  current: Record<string, any>,
  original: Record<string, any>,
  fieldMap: Record<string, string>
): Partial<T> => {
  const changes: any = {};

  // 比較初始表單資料跟變更後的表單資料是否相同
  Object.entries(fieldMap).forEach(([formKey, dbKey]) => {
    const currentValue = current[formKey];
    const originalValue = original[dbKey] || "";

    // 處理不同類型的值
    if (currentValue !== originalValue) {
      changes[dbKey] = currentValue;
    }
  });

  return changes; //return變動的欄位及資料
};

/**
 * 比對陣列欄位的變更
 * @param currentArray 當前的陣列 (例如: ["同行", "貿易商"])
 * @param originalString 原始的字串 (例如: "同行,貿易商")
 * @returns 是否有變更
 */
export const hasArrayChanged = (
  currentArray: string[],
  originalString: string
): boolean => {
  const currentString = currentArray.join(",");
  return currentString !== (originalString || "");
};

/**
 * 從巢狀的 API 回應中安全地取得值
 * @param obj 物件
 * @param path 路徑 (例如: "data.companyData.rows[0][0]")
 * @param defaultValue 預設值
 */

/**
 * 檢查物件是否為空 (沒有任何屬性)
 */
export const isEmptyObject = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).length === 0;
};
