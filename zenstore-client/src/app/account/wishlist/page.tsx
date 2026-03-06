"use client";

import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { fetchWishlist } from "@/store/wishlistSlice";
import WishlistCard from "@/components/WishlistCard/WishlistCard";
import EmptyWishlist from "@/components/EmptyWishlist/EmptyWishlist";
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
  const dispatch = useAppDispatch();

  // ====== 診斷 Log：追蹤 Wishlist 掛載/卸載 ======
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  console.log(`[Wishlist] 渲染 #${renderCountRef.current}`);

  useEffect(() => {
    console.log("[Wishlist] 組件掛載 (Mount)");
    return () => console.log("[Wishlist] 組件卸載 (Unmount)");
  }, []);

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const member_id = useAppSelector(selectMemberId);

  const wishlistItems = useAppSelector(selectWishlistItems);
  const isInitialized = useAppSelector(selectWishlistIsInitialized);
  const isLoading = useAppSelector(selectWishlistLoading);

  useEffect(() => {
    // 客戶端已認證，初次渲染時獲取收藏清單
    if (member_id && isAuthenticated && !isInitialized) {
      dispatch(fetchWishlist(member_id));
    }
  }, [dispatch, isAuthenticated, member_id, isInitialized]);

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
