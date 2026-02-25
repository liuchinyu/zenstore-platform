//結帳專用Selector
import { createSelector } from "@reduxjs/toolkit";

export const selectShippingInfo = createSelector(
  [(state) => state?.checkout?.shippingInfo],
  (shippingInfo) => shippingInfo
);

export const selectPaymentInfo = createSelector(
  [(state) => state?.checkout?.paymentInfo],
  (paymentInfo) => paymentInfo
);
