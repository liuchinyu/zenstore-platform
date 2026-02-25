"use client";

import { useCallback } from "react";
import { useProductCategories } from "@/hooks/useProductCategories";
import ProductFilter from "@/components/ProductFilter/ProductFilter";
import CategoryList from "@/components/CategoryList";
import ProductSkeleton from "@/components/ProductSkeleton/ProductSkeleton";
import LoadingLink from "@/components/LoadingLink/LoadingLink";

export default function ProductCategory() {
  const {
    displayFirstCategories, //透過ProductFilter將資料拋進useProductCategories，return displayFirstCategories。篩選後的列表資料
    categoryCounts,
    isLoading,
    error,
    handleFilterChange,
    sortedSecondCategories,
    refetchCategories,
    manufactureId, //判斷是否篩選有選擇製造商，並回傳製造商ID
  } = useProductCategories();

  // 處理重新載入
  const handleRetry = useCallback(async () => {
    await refetchCategories();
  }, [refetchCategories]);
  return (
    <div className="container-fluid" style={{ marginBottom: "-0.8rem" }}>
      <div className="row">
        <ProductFilter
          onFilterChange={handleFilterChange} //傳遞function給ProductFilter呼叫，再將資料拋進useProductCategories，return displayFirstCategories
        />
        <div className="col-md-10">
          <nav
            style={{ "--bs-breadcrumb-divider": "'>'" } as React.CSSProperties}
            className="mt-2"
            aria-label="breadcrumb"
          >
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <LoadingLink href="/" className="text-decoration-none">
                  首頁
                </LoadingLink>
              </li>
              <li
                className="breadcrumb-item active text-dark "
                aria-current="page"
              >
                所有產品
              </li>
            </ol>
          </nav>

          {/* 錯誤處理 */}
          {error && (
            <div className="col-12 mb-3">
              <div
                className="alert alert-danger d-flex align-items-center"
                role="alert"
              >
                <i className="bi bi-exclamation-triangle me-2"></i>
                <div>
                  <strong>載入失敗：</strong>
                  {error}
                  <button
                    className="btn btn-outline-danger btn-sm ms-3"
                    onClick={handleRetry}
                    aria-label="重新載入分類資料"
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    重新載入
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 載入狀態 */}
          {isLoading ? (
            <ProductSkeleton />
          ) : displayFirstCategories && displayFirstCategories.length > 0 ? (
            displayFirstCategories.map((category) => (
              <div className="col-12" key={category.CATEGORY_ID}>
                <CategoryList
                  category={category} //個別傳遞經篩選的第一階層分類
                  subCategories={sortedSecondCategories}
                  categoryCounts={categoryCounts}
                  manufactureId={manufactureId}
                />
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-info" role="alert">
                <i className="bi bi-info-circle me-2"></i>
                該製造商目前尚無任何產品
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
