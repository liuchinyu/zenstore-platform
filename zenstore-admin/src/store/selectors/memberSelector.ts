import { createSelector } from "@reduxjs/toolkit";

// 會員
export const selectMembers = createSelector(
  [(state) => state.member?.members],
  (members) => members,
);

// 會員群組
export const selectMemberGroups = createSelector(
  [(state) => state.member?.groups],
  (groups) => groups,
);

// 會員群組關聯
export const selectMemberGroupRelation = createSelector(
  [(state) => state.member?.groupRelation],
  (groupRelation) => groupRelation,
);
// 會員狀態
export const selectMembersStatus = (state: any) => state.member.membersStatus;

// 會員總數
export const selectMembersTotalCount = (state: any) => state.member.totalCount;

// 會員群組狀態
export const selectMemberGroupsStatus = (state: any) =>
  state.member.groupsStatus;

// 會員群組關聯狀態
export const selectMemberGroupRelationStatus = (state: any) =>
  state.member.groupRelationStatus;
