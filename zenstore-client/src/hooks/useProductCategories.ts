import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setCategories, setManufactureCategories } from "@/store/headerSlice";
import ProductService from "@/services/productService";
import { Category, RawCategory } from "@/types";
import { useCategoryCounts } from "./useCategoryCounts";
import {
  selectCategories,
  selectManufactureCategories,
} from "@/store/selectors/headerSelectors";

interface UseProductCategoriesReturn {
  displayFirstCategories: Category[]; //在產品列表(products)呈現的資料
  secondCategories: Category[];
  categoryCounts: Record<number, number>;
  isLoading: boolean;
  error: string | null;
  handleFilterChange: (filterData: {
    displayFirstCategories: Category[];
    secondCategories: Category[];
    filterCategoryIds: number[];
  }) => void;
  sortedSecondCategories: Category[];
  refetchCategories: () => Promise<void>;
  manufactureId: number;
}

export const useProductCategories = (): UseProductCategoriesReturn => {
  // ():後面為指定return的類型
  const dispatch = useAppDispatch();
  const storeCategories = useAppSelector(selectCategories);
  const storeManufacture = useAppSelector(selectManufactureCategories);
  const [displayFirstCategories, setDisplayFirstCategories] = useState<
    Category[]
  >([]);
  const [secondCategories, setSecondCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manufactureId, setManufactureId] = useState(0); //判斷是否篩選有選擇製造商，並回傳製造商ID

  // 使用專門的計數 hook
  const { categoryCounts, fetchCategoryCounts } = useCategoryCounts();

  // 格式化分類資料的函數
  const formatCategories = useCallback(
    (rawCategories: RawCategory[], type: string): Category[] => {
      return rawCategories
        .filter((item: RawCategory) => item[6] === type)
        .map((item: RawCategory) => ({
          CATEGORY_ID: item[0],
          CATEGORY_TITLE: item[1],
          PARENT_ID: item[2],
          CATEGORY_LEVEL: item[3],
          CATEGORY_TYPE: item[6],
        }));
    },
    []
  );

  // 初始化資料（只有在 Redux 為空時才抓一次，避免重複抓取與 dispatch 大型陣列）
  const initializeData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 若沒有產品分類資料，發送API取得
      if (storeCategories.length === 0 && storeManufacture.length === 0) {
        const response = await ProductService.getCategories();
        const productCats = response.product;
        const manufactureCats = response.manufacture;
        dispatch(setCategories(productCats));
        dispatch(setManufactureCategories(manufactureCats));
      }
      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "獲取產品分類失敗";
      setError(errorMessage);
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    dispatch,
    formatCategories,
    storeCategories.length,
    storeManufacture.length,
  ]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // 處理篩選變更
  const handleFilterChange = useCallback(
    (filterData: {
      displayFirstCategories: Category[];
      secondCategories: Category[];
      filterCategoryIds: number[];
    }) => {
      const firstCategoryId = filterData.filterCategoryIds[0];
      if (
        storeManufacture.find(
          (item: any) => item.MANUFACTURE_CATEGORYID === firstCategoryId
        )
      ) {
        setManufactureId(firstCategoryId);
      }

      fetchCategoryCounts(filterData.filterCategoryIds);
      setDisplayFirstCategories(filterData.displayFirstCategories);
      setSecondCategories(filterData.secondCategories);
    },
    [storeManufacture]
  );

  // 排序後的二級分類（使用 useMemo 優化效能）
  const sortedSecondCategories = useMemo(() => {
    // 由filterchange而來
    return [...secondCategories].sort((a, b) =>
      a.CATEGORY_TITLE.localeCompare(b.CATEGORY_TITLE, "zh-TW")
    );
  }, [secondCategories]);

  // 手動獲取分類資料
  const refetchCategories = useCallback(async () => {
    await initializeData();
  }, [initializeData]);

  return {
    displayFirstCategories,
    secondCategories,
    categoryCounts,
    isLoading,
    error,
    handleFilterChange,
    sortedSecondCategories,
    refetchCategories,
    manufactureId,
  };
};
