import { createSelector } from "@reduxjs/toolkit";

export const selectTags = createSelector(
  [(state: any) => state.tag.tags],
  (tags) => tags,
);

export const selectTagRelation = createSelector(
  [(state: any) => state.tag.tagRelation],
  (tagRelation) => tagRelation,
);

export const selectTagLoading = (state: any) => state.tag.isLoading;

export const selectTagError = (state: any) => state.tag.error;
