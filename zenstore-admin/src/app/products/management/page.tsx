"use client";

import React from "react";
import { useProductManagement } from "./hooks/useProductManagement";

// Components
import ProductActionHeader from "@/components/ProductManagement/ProductActionHeader";
import ProductBatchActions from "@/components/ProductManagement/ProductBatchActions";
import ProductTable from "@/components/ProductManagement/ProductTable";
import ProductPagination from "@/components/ProductManagement/ProductPagination";
import {
  CategorySettingsModal,
  FilterModal,
} from "@/components/ProductSettingsModal";
import TagSettingsModal from "@/components/ProductSettingsModal/TagSettingsModal";
import ImagePreviewModal from "@/components/ImagePreviewModal";

const ProductList = () => {
  const {
    products,
    isLoading,
    error,
    selectedProducts,
    searchTerm,
    filters,
    manufactureCategories,
    productCategories,
    tags,
    pagination,
    modalStates,
    actions,
  } = useProductManagement();

  return (
    <div className="container-fluid p-4 position-relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-50"
          style={{ zIndex: 9999 }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">加載中...</span>
          </div>
        </div>
      )}

      <h1 className="mb-4">所有商品</h1>

      {error && <div className="alert alert-danger">錯誤: {error}</div>}

      {/* 搜尋與操作區 */}
      <ProductActionHeader
        searchTerm={searchTerm}
        setSearchTerm={actions.setSearchTerm}
        handleSearch={actions.handleSearch}
        handleKeyDown={(e) => e.key === "Enter" && actions.handleSearch()}
        selectedProducts={selectedProducts}
        onImportSuccess={actions.onImportSuccess}
      />

      {/* 批量操作區 */}
      <ProductBatchActions
        selectedProductsLength={selectedProducts.length}
        selectedProducts={selectedProducts}
        onShowCategoryModal={actions.openCategoryModal}
        onShowTagModal={actions.openTagModal}
        onPublish={actions.handlePublish}
        onUnpublish={actions.handleUnpublish}
      />

      {/* 商品表格 */}
      <ProductTable
        products={products}
        selectedProducts={selectedProducts}
        onSelectProduct={actions.handleSelectProduct}
        onSelectAll={actions.handleSelectAll}
        onImagePreview={actions.handleImagePreview}
      />

      {/* 分頁 */}
      <ProductPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        currentItemsCount={products.length}
        handlePageChange={pagination.handlePageChange}
      />

      {/* 篩選 Modal */}
      <FilterModal
        id="filterModal"
        title="篩選"
        tags={tags}
        allBrands={manufactureCategories}
        productCategories={productCategories}
        filters={filters}
        onFilterChange={actions.handleFilterChange}
        onBatchFilterChange={actions.handleBatchFilterChange}
        onApply={actions.applyFilters}
        onReset={actions.resetFilters}
      />

      {/* 分類 Modal */}
      <CategorySettingsModal
        id="categoryModal"
        title="分類設定"
        productCategories={productCategories}
        allBrands={manufactureCategories}
        selectedManufacturerCategory={modalStates.selectedManufacturerCategory} //選擇的製造商分類ID
        selectedCategory={modalStates.selectedCategory} //選擇的商品分類ID
        onManufacturerCategoryChange={actions.handleManufacturerCategoryChange}
        onProductCategoryChange={actions.handleProductCategoryChange}
        onApply={actions.handleApplyCategories}
        onClose={actions.closeCategoryModal}
      />

      {/* 標籤 Modal */}
      <TagSettingsModal
        id="tagModal"
        title="標籤設定"
        tags={tags}
        selectedTag={modalStates.selectedTag}
        onSelectTag={actions.handleSelectTag}
        onApply={actions.handleApplyTag}
        onClose={actions.closeTagModal}
      />

      {/* 圖片預覽 Modal */}
      <ImagePreviewModal
        show={modalStates.showPreviewModal}
        imageUrl={modalStates.previewImage}
        onClose={actions.closePreviewModal}
      />
    </div>
  );
};

export default ProductList;
