import { createSelector } from "@reduxjs/toolkit";

export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;

export const selectMemberId = (state: any) => state.auth.user?.MEMBER_ID;

export const selectUser = createSelector(
  [(state) => state.auth.user],
  (user) => user
);
