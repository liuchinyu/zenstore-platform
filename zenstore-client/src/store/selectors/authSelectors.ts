import { createSelector } from "@reduxjs/toolkit";

export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;

// Redux Persist 在完成 rehydration 後，會將 state.auth._persist.rehydrated 設為 true
// 我們必須等到此旗標為 true，才能相信 isAuthenticated 的值是正確的（來自 localStorage）
// 否則，在 rehydration 完成前，isAuthenticated 的初始值是 false，會導致誤判
export const selectAuthRehydrated = (state: any) =>
  state.auth?._persist?.rehydrated === true;

export const selectMemberId = (state: any) => state.auth.user?.MEMBER_ID;

export const selectUser = createSelector(
  [(state) => state.auth.user],
  (user) => user,
);
