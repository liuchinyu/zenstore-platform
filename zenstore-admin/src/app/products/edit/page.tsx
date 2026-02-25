"use client";

import React from "react";
import { FormProvider } from "react-hook-form";
import { useEditProduct } from "./hooks/useEditProduct";

// Components
import { ProductBasicInfo } from "./components/ProductBasicInfo";
import { ProductCategories } from "../components/ProductCategories";
import { ProductImageUpload } from "./components/ProductImageUpload";
import { PriceRangeTable } from "../components/PriceRangeTable";
import { ProductSpecs } from "../components/ProductSpecs";
import { ProductSidebar } from "./components/ProductSidebar";
import { ProductSEO } from "../components/ProductSEO";
import ImagePreviewModal from "@/components/ImagePreviewModal";

const EditProduct = () => {
  const { methods, state, actions, refs } = useEditProduct();

  if (state.isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">載入中...</span>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        className="container-fluid p-4"
        onSubmit={actions.onSubmit}
        noValidate
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">編輯商品</h1>
          <button type="submit" className="btn btn-primary px-4 shadow-sm">
            儲存變更
          </button>
        </div>

        <div className="row g-4">
          {/* Main Content Area */}
          <div className="col-12 col-md-10">
            <div className="bg-white p-4 rounded shadow-sm">
              <div className="row">
                {/* Image & Basic Info Row */}
                <div className="col-lg-4">
                  <ProductImageUpload
                    type="main"
                    previews={state.mainImagePreview}
                    uploadStatus={state.uploadStatus}
                    filesCount={state.mainImageFiles.length}
                    onUploadClick={() => actions.triggerFileInput("main")}
                    onRemove={(i) => actions.removeImage(i, "main")}
                    onPreview={actions.handleImagePreview}
                    fileInputRef={refs.mainFileInputRef}
                    onFileInputChange={(e) =>
                      actions.handleImageUpload(e, "main")
                    }
                  />
                </div>
                <div className="col-lg-8">
                  <ProductBasicInfo onFieldChange={actions.handleFieldChange} />
                  <hr />
                  <ProductCategories
                    manufactureCategory={state.manufactureCategory}
                    productCategory={state.productCategory}
                    onFieldChange={actions.handleFieldChange}
                  />
                </div>
              </div>

              {/* Detail Images Area */}
              <ProductImageUpload
                type="detail"
                previews={state.detailImagePreview}
                uploadStatus={state.uploadStatus}
                filesCount={state.detailImageFiles.length}
                onUploadClick={() => actions.triggerFileInput("detail")}
                onRemove={(i) => actions.removeImage(i, "detail")}
                onPreview={actions.handleImagePreview}
                fileInputRef={refs.detailFileInputRef}
                onFileInputChange={(e) =>
                  actions.handleImageUpload(e, "detail")
                }
              />

              {/* Prices and Specs Area */}
              <div className="row g-4 mt-2">
                <div className="col-lg-7">
                  <PriceRangeTable
                    fields={state.priceRangeFields}
                    onAppend={actions.appendPriceRange}
                    onRemove={actions.removePriceRange}
                    onFieldChange={actions.handleFieldChange}
                  />
                </div>
                <div className="col-lg-5">
                  <ProductSpecs onFieldChange={actions.handleFieldChange} />
                </div>
              </div>

              {/* SEO Area */}
              <ProductSEO onFieldChange={actions.handleFieldChange} />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="col-12 col-md-2">
            <ProductSidebar
              tags={state.tags}
              selectedTags={state.selectedTags}
              onTagChange={actions.handleTagChange}
              onFieldChange={actions.handleFieldChange}
            />
          </div>
        </div>

        {/* Global Image Preview */}
        <ImagePreviewModal
          show={state.showPreviewModal}
          imageUrl={state.previewImage}
          onClose={actions.closePreviewModal}
        />
      </form>
    </FormProvider>
  );
};

export default EditProduct;
