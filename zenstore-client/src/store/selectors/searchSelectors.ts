import { createSelector } from "@reduxjs/toolkit";

export const selectSearchQuery = (state: any) => state.search?.searchQuery;
export const selectSearchPage = (state: any) => state.search?.currentPage;
export const selectSearchTotalPages = (state: any) => state.search?.totalPages;
export const selectSearchLoading = (state: any) => state.search?.isLoading;
export const selectSearchError = (state: any) => state.search?.error;

export const selectSearchResults = createSelector(
  (state) => state.search?.searchResults,
  (searchResults) => searchResults
);
