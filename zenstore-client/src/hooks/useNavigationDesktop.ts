import { useCallback } from "react";
import { useAppDispatch } from "./redux";
import {
  setShowSubOptions,
  setShowTechMenu,
  setShowManufactureMenu,
} from "@/store/headerSlice";
import { useGlobalLoading } from "./useGlobalLoading";

interface UseNavigationOptions {
  setShowOption: (value: boolean) => void;
}

export const useNavigationDesktop = ({
  setShowOption,
}: UseNavigationOptions) => {
  const dispatch = useAppDispatch();
  const { navigateWithLoading } = useGlobalLoading();

  // 統一的導航點擊處理
  const handleNavigationClick = useCallback(
    (type: "products" | "manufacture" | "tech", route: string) => {
      switch (type) {
        case "products":
          dispatch(setShowSubOptions(true));
          break;
        case "manufacture":
          dispatch(setShowManufactureMenu(true));
          break;
        case "tech":
          dispatch(setShowTechMenu(true));
          break;
      }
      setShowOption(false);
      // 技術資源不需要跳轉頁面，所以只在非 tech 類型時跳轉
      if (type !== "tech") {
        navigateWithLoading(route);
      }
    },
    [dispatch, setShowOption, navigateWithLoading]
  );

  // 統一的返回處理
  const handleBack = useCallback(
    (level: number, type: "products" | "manufacture") => {
      if (level !== 1) {
        if (type === "products") {
          dispatch(setShowSubOptions(true));
        } else {
          dispatch(setShowManufactureMenu(true));
        }
        setShowOption(false);
      } else {
        if (type === "products") {
          dispatch(setShowSubOptions(false));
        } else {
          dispatch(setShowManufactureMenu(false));
        }
        setShowOption(true);
      }
    },
    [dispatch, setShowOption]
  );

  return {
    handleNavigationClick,
    handleBack,
  };
};
