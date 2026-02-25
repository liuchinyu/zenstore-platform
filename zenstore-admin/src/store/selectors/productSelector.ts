import { createSelector } from "@reduxjs/toolkit";

export const selectProducts = createSelector(
  [(state) => state.product.products],
  (products) => products
);

export const selectProductLoading = (state: any) => state.product.isLoading;
export const selectProductError = (state: any) => state.product.error;
export const selectProductPagination = (state: any) => state.product.pagination;
