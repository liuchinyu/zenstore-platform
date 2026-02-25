import { createSelector } from "@reduxjs/toolkit";

export const selectOrders = createSelector(
  [(state) => state.orders?.orders],
  (orders) => orders || []
);

export const selectCurrentOrder = createSelector(
  [(state) => state.orders?.currentOrder],
  (currentOrder) => currentOrder
);

export const selectOrdersLoading = (state: any) => state.orders?.loading;

export const selectOrdersError = (state: any) => state.orders?.error;
