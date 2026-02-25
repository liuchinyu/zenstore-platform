import { createSelector } from "@reduxjs/toolkit";

// 總分類(含製造商及商品分類)
export const selectOrders = createSelector(
  [(state) => state.order?.orderList],
  (orderList) => orderList,
);

// 訂單明細
export const selectGroupedOrderDetail = createSelector(
  [(state) => state.order?.groupedOrderDetail],
  (groupedOrderDetail) => groupedOrderDetail,
);

// 取消訂單(待審核)
export const selectCancelOrder = createSelector(
  [(state) => state.order?.cancelOrder],
  (cancelOrder) => cancelOrder,
);

// 取消訂單(已審核)
export const selectCancelPermitOrder = createSelector(
  [(state) => state.order?.cancelPermitOrder],
  (cancelPermitOrder) => cancelPermitOrder,
);

// Loading
export const selectOrderLoading = (state: any) => state.order?.isLoading;

// error
export const selectOrderError = (state: any) => state.order?.error;
