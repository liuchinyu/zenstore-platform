import { createSelector } from "@reduxjs/toolkit";

// 總分類(含製造商及商品分類)
export const selectCategories = createSelector(
  [(state) => state.category?.categories],
  (categories) => categories
);

// 僅獲取商品分類
export const selectProductCategories = createSelector(
  [(state) => state.category?.productCategoires],
  (productCategoires) => productCategoires
);

// 獲取製造商分類
export const selectManufactureCategories = createSelector(
  [(state) => state.category?.manufactureCategories],
  (manufactureCategories) => manufactureCategories
);

// 獲取商品分類關聯
export const selectCategoryRelation = createSelector(
  [(state) => state.category.categoryRelation],
  (categoryRelation) => categoryRelation
);
