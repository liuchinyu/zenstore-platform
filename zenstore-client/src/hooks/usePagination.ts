import { useState, useCallback } from "react";

/**
 * 分頁 Hook 的返回類型
 */
export interface UsePaginationReturn {
  // 狀態
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;

  // 方法
  setTotalPages: (pages: number) => void;
  setTotalItems: (items: number) => void;
  handlePageChange: (pageNumber: number) => void;
  resetPagination: () => void;
}

/**
 * 分頁邏輯自訂 Hook
 * 
 * @param initialPage - 初始頁碼,預設為 1
 * @param itemsPerPage - 每頁顯示的項目數量,預設為 25
 * @returns 分頁相關的狀態和方法
 * 
 * @example
 * ```typescript
 * const {
 *   currentPage,
 *   totalPages,
 *   totalItems,
 *   itemsPerPage,
 *   setTotalPages,
 *   setTotalItems,
 *   handlePageChange,
 *   resetPagination
 * } = usePagination(1, 25);
 * ```
 */
export const usePagination = (
  initialPage: number = 1,
  itemsPerPage: number = 25
): UsePaginationReturn => {
  // === 狀態管理 ===
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  // === 事件處理 ===

  /**
   * 處理頁面變更
   * @param pageNumber - 要跳轉的頁碼
   */
  const handlePageChange = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // 跳轉頁面後滾動到頂部
  }, []);

  /**
   * 重置分頁到初始狀態
   */
  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setTotalPages(0);
    setTotalItems(0);
  }, [initialPage]);

  return {
    // 狀態
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,

    // 方法
    setTotalPages,
    setTotalItems,
    handlePageChange,
    resetPagination,
  };
};
