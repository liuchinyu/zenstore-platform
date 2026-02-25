// 計算商品分類數量
import { useState, useCallback, useRef } from "react";
import ProductService from "@/services/productService";

interface UseCategoryCountsReturn {
  categoryCounts: Record<number, number>;
  fetchCategoryCounts: (categoryIds: number[]) => Promise<void>;
  clearCache: () => void;
}

export const useCategoryCounts = (): UseCategoryCountsReturn => {
  const [categoryCounts, setCategoryCounts] = useState<Record<number, number>>(
    {}
  );
  const cacheRef = useRef<Set<number>>(new Set());

  const fetchCategoryCounts = useCallback(async (categoryIds: number[]) => {
    // 過濾出未快取的分類 ID
    // const uncachedIds = categoryIds.filter((id) => !cacheRef.current.has(id));

    if (categoryIds.length === 0) {
      return;
    }
    try {
      // 使用批次 API 一次取得所有分類數量
      const newCounts = await ProductService.getCategoryCountsBatch(
        categoryIds
      );
      // 更新狀態
      setCategoryCounts((prev) => ({ ...prev, ...newCounts }));
      // 將所有 ID 加入快取
      // uncachedIds.forEach((id) => cacheRef.current.add(id));
    } catch (error) {
      console.error("Error fetching category counts:", error);
    }
  }, []);

  const clearCache = useCallback(() => {
    // cacheRef.current.clear();
    setCategoryCounts({});
  }, []);

  return {
    categoryCounts,
    fetchCategoryCounts,
    clearCache,
  };
};
