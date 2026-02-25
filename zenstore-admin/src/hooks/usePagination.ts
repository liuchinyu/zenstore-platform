import { useState, useCallback } from "react";

export interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;

  setTotalPages: (pages: number) => void;
  setTotalItems: (items: number) => void;
  handlePageChange: (page: number) => void;
  resetPagination: () => void;
}

export const usePagination = (
  initialPage: number = 1,
  itemsPerPage: number = 100
): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  // 處理頁面變更
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setTotalItems(0);
    setTotalPages(0);
  }, [initialPage]);

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,

    handlePageChange,
    resetPagination,
    setTotalPages,
    setTotalItems,
  };
};
