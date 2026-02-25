"use client";

import React, { useEffect, useState } from "react";
import {
  addToWishlist,
  removeFromWishlist,
  fetchWishlist,
  selectIsProductInWishlist,
} from "@/store/wishlistSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useToast } from "@/hooks/useToast";
import clsx from "clsx";
import { ExtendedRootState } from "@/store/store";
import { useDynamicReducer } from "@/hooks/useDynamicReducer";

interface WishlistButtonProps {
  oracleId: string;
  className?: string;
  memberId: string;
  variant?: "icon" | "button" | "iconButton";
  size?: "sm" | "md" | "lg";
}

const WishlistButton = ({
  oracleId,
  className = "",
  variant = "icon",
  size = "md",
  memberId,
}: WishlistButtonProps) => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  // 動態導入 wishlist reducer
  const isWishlistLoaded = useDynamicReducer(
    "wishlist",
    () => import("@/store/wishlistSlice")
  );

  const wishlistState = useAppSelector((state: ExtendedRootState) =>
    isWishlistLoaded ? state.wishlist : null
  );

  const wishlistItems = wishlistState?.items || null;
  const wishlistLoading = wishlistState?.loading || false;

  const isAuthenticated = useAppSelector(
    (state) => state.auth?.isAuthenticated
  );
  const [isLoading, setIsLoading] = useState(true);

  // 從 Redux 取得收藏狀態
  const isInWishlist = useAppSelector((state) =>
    selectIsProductInWishlist(state, oracleId)
  );

  // 找到對應的 wishlist_id 以便移除時使用
  const wishlist_id = wishlistItems?.find(
    (item: any) => item.PRODUCT_ID === oracleId || item.ORACLE_ID === oracleId
  )?.WISHLIST_ID;

  // 只有在第一次加載和用戶認證變更時才獲取收藏列表
  useEffect(() => {
    if (
      isAuthenticated &&
      memberId &&
      wishlistItems?.length === 0 &&
      !wishlistLoading
    ) {
      dispatch(fetchWishlist(memberId));
    }

    if (!wishlistLoading) {
      setIsLoading(false);
    }
  }, [isAuthenticated, memberId, wishlistItems?.length]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast("請先登入", "warning");
      return;
    }

    try {
      setIsLoading(true);
      if (isInWishlist && wishlist_id) {
        // 從收藏清單中移除
        await dispatch(
          removeFromWishlist({ member_id: memberId, wishlist_id })
        );
      } else {
        // 加入收藏清單
        await dispatch(
          addToWishlist({ member_id: memberId, oracle_id: oracleId })
        );
      }
    } catch (error) {
      console.error("收藏操作失敗:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 根據不同變體和尺寸設置樣式
  const getButtonClasses = () => {
    const baseIconClass = clsx(
      "transition-all duration-200",
      isInWishlist ? "text-danger" : "text-secondary",
      {
        "fs-6": size === "sm",
        "fs-5": size === "md",
        "fs-4": size === "lg",
      }
    );

    if (variant === "icon") {
      return clsx(baseIconClass, className);
    } else if (variant === "button") {
      return clsx(
        "btn",
        isInWishlist ? "btn-danger" : "btn-secondary",
        {
          "btn-sm": size === "sm",
          "btn-lg": size === "lg",
        },
        className
      );
    } else if (variant === "iconButton") {
      return clsx(
        "btn rounded-circle d-flex align-items-center justify-content-center",
        isInWishlist ? "btn-danger" : "btn-secondary",
        {
          "btn-sm": size === "sm",
          "btn-lg": size === "lg",
        },
        className
      );
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="spinner-border spinner-border-sm" role="status"></div>
      );
    }

    if (variant === "icon") {
      return (
        <i
          className={clsx("bi", isInWishlist ? "bi-heart-fill" : "bi-heart")}
        ></i>
      );
    } else if (variant === "button") {
      return (
        <>
          <i
            className={clsx(
              "bi me-2",
              isInWishlist ? "bi-heart-fill" : "bi-heart"
            )}
          ></i>
          {isInWishlist ? "已收藏" : "加入收藏"}
        </>
      );
    } else if (variant === "iconButton") {
      return (
        <i
          className={clsx("bi", isInWishlist ? "bi-heart-fill" : "bi-heart")}
        ></i>
      );
    }
  };

  return (
    <button
      type="button"
      className={getButtonClasses()}
      onClick={handleWishlistToggle}
      aria-label={isInWishlist ? "從收藏清單中移除" : "加入收藏清單"}
    >
      {renderContent()}
    </button>
  );
};

export default WishlistButton;
