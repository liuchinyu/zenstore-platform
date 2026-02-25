"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

// 匯入hooks
import { useDynamicReducer } from "@/hooks/useDynamicReducer";
import { useFetchCategories } from "@/hooks/useFetchCategories";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useChatwoot } from "@/hooks/chatwoot";

// 匯入slice
import { fetchTechResources } from "@/store/contentSlice";
import { setCategories, setManufactureCategories } from "@/store/headerSlice";
import { setIsMobile } from "@/store/homeProductSlice";

// 匯入Header選擇器
import {
  selectCategories,
  selectManufactureCategories,
} from "@/store/selectors/headerSelectors";

import {
  selectUser,
  selectIsAuthenticated,
} from "@/store/selectors/authSelectors";

const useHeaderInit = () => {
  const dispatch = useAppDispatch();
  // 從selector取得資料
  const categories = useAppSelector(selectCategories);
  const manufactureCategories = useAppSelector(selectManufactureCategories);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const { fetchCategories } = useFetchCategories();

  const isContentLoaded = useDynamicReducer(
    "content",
    () => import("@/store/contentSlice"),
  );

  // 獲取技術文章
  useEffect(() => {
    if (!isContentLoaded) return;
    dispatch(fetchTechResources() as any);
  }, [dispatch, isContentLoaded]);

  // 獲取商品分類、製造商分類
  useEffect(() => {
    // 只有在 Redux 尚未有分類資料時才抓取，避免重複 dispatch 大型陣列
    if (categories.length === 0 && manufactureCategories.length === 0) {
      const getCategories = async () => {
        const { productCategories, manufactureCategories } =
          await fetchCategories();
        dispatch(setCategories(productCategories));
        dispatch(setManufactureCategories(manufactureCategories));
      };
      getCategories();
    }
  }, [categories.length, manufactureCategories.length]);

  useIsMobile({ breakpoint: 768, onChange: (v) => dispatch(setIsMobile(v)) });

  // Chatwoot 初始化 - 使用組合式 Hook
  useChatwoot({
    enabled: isAuthenticated,
    userId: user?.MEMBER_ID,
    userEmail: user?.EMAIL,
    userName: user?.USER_NAME,
  });
};

export default useHeaderInit;
