import { createSelector } from "@reduxjs/toolkit";

export const selectHotProducts = createSelector(
  [
    (state) => state.products?.hotProducts,
    (state) => state.products?.hotProductsLoading,
    (state) => state.products?.hotProductsError,
  ],
  (hotProducts, hotProductsLoading, hotProductsError) => ({
    products: hotProducts || [],
    productsLoading: hotProductsLoading || false,
    productsError: hotProductsError || null,
  })
);

export const selectNewProducts = createSelector(
  [
    (state) => state.products?.newProducts,
    (state) => state.products?.newProductsLoading,
    (state) => state.products?.newProductsError,
  ],
  (newProducts, newProductsLoading, newProductsError) => ({
    products: newProducts || [],
    productsLoading: newProductsLoading || false,
    productsError: newProductsError || null,
  })
);

export const selectSaleProducts = createSelector(
  [
    (state) => state.products?.saleProducts,
    (state) => state.products?.saleProductsLoading,
    (state) => state.products?.saleProductsError,
  ],
  (saleProducts, saleProductsLoading, saleProductsError) => ({
    products: saleProducts || [],
    productsLoading: saleProductsLoading || false,
    productsError: saleProductsError || null,
  })
);
