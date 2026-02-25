/**
 * 通用 API 回應格式
 * 用於所有 Service 層的 API 回應
 *
 * @template T - 回應資料的類型
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  status?: number;
  errors?: any;
}

/**
 * 分頁參數
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

/**
 * 日期範圍篩選
 */
export interface DateRange {
  startDate?: string;
  endDate?: string;
}

/**
 * 排序參數
 */
export interface SortParams {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

/**
 * 通用篩選參數
 */
export interface FilterParams extends Partial<DateRange>, Partial<SortParams> {
  status?: string;
  keyword?: string;
}
