import { createSelector } from "@reduxjs/toolkit";

export const selectItems = createSelector(
  [(state) => state.cart.items],
  (items) => ({ items, count: Object.keys(items || {}).length }) //計算數量
);

export const selectShowCartModal = (state: any) => state.cart.showCartModal;

export const selectAnimatingItems = createSelector(
  [(state) => state.cart.animatingItems],
  (animatingItems) => animatingItems
);
