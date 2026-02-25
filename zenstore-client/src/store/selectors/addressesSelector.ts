// 常用地址selector
import { createSelector } from "@reduxjs/toolkit";

// 常用地址
export const selectAddresses = createSelector(
  [(state) => state?.address?.addresses],
  (addresses) => addresses
);

// 是否載入完成
export const selectAddressesInitialized = (state: any) =>
  state?.address?.isInitialized;
