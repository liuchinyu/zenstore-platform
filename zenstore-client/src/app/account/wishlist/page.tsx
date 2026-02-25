"use client";

import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { fetchWishlist } from "@/store/wishlistSlice";
import WishlistCard from "@/components/WishlistCard/WishlistCard";
import EmptyWishlist from "@/components/EmptyWishlist/EmptyWishlist";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { useDynamicReducer } from "@/hooks/useDynamicReducer";
import {
  selectWishlistItems,
  selectWishlistIsInitialized,
  selectWishlistLoading,
} from "@/store/selectors/wishlistSelectors";
import {
  selectMemberId,
  selectIsAuthenticated,
} from "@/store/selectors/authSelectors";

export default function Wishlist() {
  const isWishlistLoaded = useDynamicReducer(
    "wishlist",
    () => import("@/store/wishlistSlice")
  );

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showToast } = useToast();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const member_id = useAppSelector(selectMemberId);

  // 動態注入 wishlist slice

  const wishlistItems = useAppSelector(selectWishlistItems);
  const isInitialized = useAppSelector(selectWishlistIsInitialized);
  const isLoading = useAppSelector(selectWishlistLoading);

  useEffect(() => {
    // 客戶端已認證，初次渲染時獲取收藏清單
    if (member_id && isWishlistLoaded && !isInitialized) {
      console.log("獲取收藏清單");
      dispatch(fetchWishlist(member_id));
    }

    // 如果客戶端渲染但未認證，顯示提示並導向登入頁面
    if (!isAuthenticated) {
      showToast("請先登入才可查看收藏清單", "error");
      router.push("/auth/login?redirect=/account/wishlist");
    }
  }, [dispatch, isAuthenticated, router, member_id, isWishlistLoaded]);

  // 在客戶端渲染前或未登入時，不顯示內容
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col">
          <h2 className="fw-bold mb-0">我的收藏清單</h2>
          <p className="text-muted">管理您喜愛的商品</p>
        </div>
      </div>

      {isLoading && !isInitialized ? (
        <div className="row">
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">載入中...</span>
            </div>
            <p className="mt-2">正在載入您的收藏清單...</p>
          </div>
        </div>
      ) : wishlistItems.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <>
          <div className="row mb-3">
            <div className="col">
              <p>共收藏 {wishlistItems.length} 件商品</p>
            </div>
          </div>
          <div className="row g-4">
            <WishlistCard wishlistItems={wishlistItems} member_id={member_id} />
          </div>
        </>
      )}
    </div>
  );
}
