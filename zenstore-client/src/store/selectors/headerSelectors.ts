import { createSelector } from "@reduxjs/toolkit";

export const selectShowSubOptions = (state: any) => state.header.showSubOptions;
export const selectShowTechMenu = (state: any) => state.header.showTechMenu;
export const selectShowManufactureMenu = (state: any) =>
  state.header.showManufactureMenu;
export const selectShowAccountMenu = (state: any) =>
  state.header.showAccountMenu;
export const selectShowOffcanvas = (state: any) => state.header.showOffcanvas;

export const selectIsNavigating = (state: any) => state.header.isNavigating;
export const selectNavigationText = (state: any) => state.header.navigationText;

// A2. 大型資料 selector → createSelector（真正 memo）
// 不使用每次回傳 new object，所以 memo 有效
export const selectCategories = createSelector(
  [(state: any) => state.header.categories],
  (categories) => categories
);

export const selectManufactureCategories = createSelector(
  [(state: any) => state.header.manufactureCategories],
  (manufactureCategories) => manufactureCategories
);

// 總分類
export const selectProductCategoriesRelation = createSelector(
  [(state: any) => state.header.productCategoriesRelation],
  (productCategoriesRelation) => productCategoriesRelation
);
