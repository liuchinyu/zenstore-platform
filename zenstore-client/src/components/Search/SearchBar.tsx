"use client";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  setSearchQuery,
  searchProducts,
  setCurrentPage,
} from "../../store/searchSlice";
import { useRouter } from "next/navigation";
import { useDynamicReducer } from "@/hooks/useDynamicReducer";
import { selectSearchQuery } from "@/store/selectors/searchSelectors";
import ProductSkeleton from "@/components/ProductSkeleton/ProductSkeleton";

export const SearchBar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const isSearchLoaded = useDynamicReducer(
    "search",
    () => import("@/store/searchSlice")
  );

  const searchQuery = useAppSelector(selectSearchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    dispatch(setSearchQuery(query));
  };

  const handleSearch = () => {
    if (searchQuery && isSearchLoaded) {
      dispatch(searchProducts({ query: searchQuery, page: 1 }));
      dispatch(setCurrentPage(1));
      router.push("/products/search");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      handleSearch();
    }
  };
  if (!isSearchLoaded) {
    return <ProductSkeleton></ProductSkeleton>;
  }

  return (
    <>
      <input
        className="form-control align-self-end border-dark d-md-block"
        type="search"
        placeholder="零件編號/關鍵字"
        style={{ height: "50px" }}
        value={searchQuery || ""} // 防止因為載入狀態的切換導致uncontrolled變成controlled的錯誤
        onChange={handleSearchChange}
        onKeyDown={handleKeyPress}
        aria-label="搜尋產品"
      />
      <button
        className="btn btn-warning align-self-end d-flex align-items-center me-2 d-md-block pt-0"
        style={{ height: "50px" }}
        onClick={handleSearch}
      >
        <i className="bi bi-search fa-2x text-center text-white"></i>
      </button>
    </>
  );
};
