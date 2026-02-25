"use client";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { searchProducts, setCurrentPage } from "@/store/searchSlice";
import LoadingLink from "@/components/LoadingLink/LoadingLink";
import Image from "next/image";
import {
  selectSearchLoading,
  selectSearchError,
  selectSearchPage,
  selectSearchQuery,
  selectSearchResults,
  selectSearchTotalPages,
} from "@/store/selectors/searchSelectors";
import { useDynamicReducer } from "@/hooks/useDynamicReducer";
import ProductSkeleton from "@/components/ProductSkeleton/ProductSkeleton";

export default function SearchPage() {
  const dispatch = useAppDispatch();

  // 動態導入 search reducer
  const isSearchLoaded = useDynamicReducer(
    "search",
    () => import("@/store/searchSlice")
  );

  const isLoading = useAppSelector(selectSearchLoading);
  const error = useAppSelector(selectSearchError);
  const searchQuery = useAppSelector(selectSearchQuery);
  const currentPage = useAppSelector(selectSearchPage);
  const totalPages = useAppSelector(selectSearchTotalPages);
  const searchResults = useAppSelector(selectSearchResults);

  const handlePageChange = async (newPage: number) => {
    if (searchQuery) {
      await dispatch(searchProducts({ query: searchQuery, page: newPage }));
      dispatch(setCurrentPage(newPage));
      window.scrollTo(0, 0);
    }
  };

  if (!isSearchLoaded) {
    return <ProductSkeleton></ProductSkeleton>;
  }

  return (
    <>
      <div className="container my-4">
        <h2 className="mb-4">搜尋結果：{searchQuery}</h2>

        {isLoading && (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">載入中...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!isLoading && !error && searchResults?.length === 0 && (
          <div className="alert alert-info" role="alert">
            找不到符合「{searchQuery}」的搜尋結果
          </div>
        )}

        <div className="row row-cols-1 row-cols-md-4 g-4">
          {searchResults?.map((product: any) => (
            <div key={product.ORACLE_ID} className="col">
              <div className="card h-100">
                {product.IMAGE_URL && (
                  <Image
                    src={product.IMAGE_URL}
                    className="card-img-top object-fit-contain"
                    alt={product.PRODUCT_ID}
                    width={200}
                    height={200}
                    // style={{ width: "100%", height: "auto" }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{product.PRODUCT_TITLE}</h5>
                  <p className="card-text text-muted">{product.PRODUCT_ID}</p>
                  <LoadingLink
                    href={`/products/${
                      product.CATEGORY_TITLES?.split("-")[1]
                    }/${product.ORACLE_ID}`}
                    className="btn btn-primary"
                  >
                    查看詳情
                  </LoadingLink>
                </div>
              </div>
            </div>
          ))}
        </div>
        {totalPages >= 1 && (
          <nav className="mt-4">
            <ul className="pagination justify-content-center d-flex list-unstyled">
              {/* 上一頁按鈕 */}
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  上一頁
                </button>
              </li>

              {/* 頁碼按鈕 */}
              {(() => {
                const pageNumbers = [];
                let startPage = Math.max(1, currentPage - 5);
                let endPage = Math.min(startPage + 9, totalPages);

                // 調整 startPage，確保始終顯示10個頁碼
                if (endPage - startPage < 9) {
                  startPage = Math.max(1, endPage - 9);
                }

                for (let i = startPage; i <= endPage; i++) {
                  pageNumbers.push(
                    <li
                      key={i}
                      className={`page-item`}
                      style={{ margin: "0px 2px" }}
                    >
                      <button
                        className={`page-link ${
                          currentPage === i ? "active" : ""
                        }`}
                        onClick={() => handlePageChange(i)}
                        style={{
                          borderRadius: "4px",
                          backgroundColor:
                            currentPage === i ? "#dc3545" : "white",
                          color: currentPage === i ? "white" : "#000",
                          border:
                            currentPage === i
                              ? "1px solid #dc3545"
                              : "1px solid #dee2e6",
                        }}
                      >
                        {i}
                      </button>
                    </li>
                  );
                }
                return pageNumbers;
              })()}

              {/* 下一頁按鈕 */}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  下一頁
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}
