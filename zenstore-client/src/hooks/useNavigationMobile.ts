import { useCallback } from "react";
import { useAppDispatch } from "./redux";
import {
  setShowSubOptions,
  setShowTechMenu,
  setShowManufactureMenu,
} from "@/store/headerSlice";
import { useRouter } from "next/navigation";
import { useGlobalLoading } from "./useGlobalLoading";

interface UseNavigationOptions {
  showOption: boolean;
  setShowOption: (value: boolean) => void;
}

export const useNavigationMobile = ({
  showOption,
  setShowOption,
}: UseNavigationOptions) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { navigateWithLoading } = useGlobalLoading();

  // 統一的導航點擊處理
  const handleNavigationClick = useCallback(
    (type: "products" | "manufacture" | "tech", route: string) => {
      // 手機版直接跳轉
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
