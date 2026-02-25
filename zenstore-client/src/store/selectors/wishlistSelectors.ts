// src/store/wishlistSelectors.ts
import { createSelector } from "@reduxjs/toolkit";
import { ExtendedRootState } from "../store";

// 收藏品清單
export const selectWishlistItems = createSelector(
  [(state) => state.wishlist?.items],
  (items) => items || []
);

// 收藏品 ID 列表
export const selectWishlistProductIds = createSelector(
  [(state) => state.wishlist?.productIds],
  (productIds) => productIds || []
);

export const selectWishlistIsInitialized = (state: ExtendedRootState) =>
  !!state.wishlist?.isInitialized;
export const selectWishlistLoading = (state: ExtendedRootState) =>
  !!state.wishlist?.loading;
export const selectWishlistError = (state: ExtendedRootState) =>
  state.wishlist?.error || null;

// 參數化 selector
export const makeSelectIsInWishlist = (oracleId: string) =>
  createSelector([selectWishlistProductIds], (ids) => ids.includes(oracleId));
