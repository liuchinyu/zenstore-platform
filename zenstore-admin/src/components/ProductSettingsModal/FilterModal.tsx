import React, { useState, useEffect, useMemo, useCallback } from "react";
import { CategoryType } from "@/types/products/categoryType";
import { TagType } from "@/types/products/tagType";

// 定義篩選條件類型
export type FilterConditions = {
  publishStatus: string;
  brand: number | null;
  categoryLevel1: number | null;
  categoryLevel2: number | null;
  categoryLevel3: number | null;
  tag: number | null;
  keyword: string;
};

// 定義 props 類型
interface FilterModalProps {
  id: string;
  title: string;
  // categories: CategoryType[];
  productCategories: CategoryType[];
  tags: TagType[];
  allBrands: CategoryType[];
  filters: FilterConditions;
  onFilterChange: (filterType: string, value: any) => void;
  onBatchFilterChange?: (updates: Partial<FilterConditions>) => void;
  onApply: (passedFilters?: FilterConditions) => void;
  onReset: () => void;
}

// 使用 React.memo 優化組件，避免不必要的重新渲染
const FilterModal = React.memo(
  ({
    id,
    title,
    productCategories,
    tags,
    allBrands,
    filters,
    onFilterChange,
    onBatchFilterChange,
    onApply,
    onReset,
  }: FilterModalProps) => {
    // 篩選本地狀態，避免立即觸發父組件重新渲染
    const [localFilters, setLocalFilters] = useState<FilterConditions>(filters);

    // 當外部 filters 改變時（例如重置），同步到本地
    useEffect(() => {
      setLocalFilters(filters);
    }, [filters]);

    // 篩選下拉選單狀態
    const [showPublishDropdown, setShowPublishDropdown] =
      useState<boolean>(false);
    const [showBrandDropdown, setShowBrandDropdown] = useState<boolean>(false);
    const [showCategoryLevel1Dropdown, setShowCategoryLevel1Dropdown] =
      useState<boolean>(false);
    const [showCategoryLevel2Dropdown, setShowCategoryLevel2Dropdown] =
      useState<boolean>(false);
    const [showCategoryLevel3Dropdown, setShowCategoryLevel3Dropdown] =
      useState<boolean>(false);
    const [showTagDropdown, setShowTagDropdown] = useState<boolean>(false);

    // 獲取第一層分類
    const level1Categories = useMemo(
      () =>
        productCategories.filter((category) => category.CATEGORY_LEVEL === 1),
      [productCategories],
    );

    // 獲取第二層分類（根據選擇的第一層）
    const level2Categories = useMemo(
      () =>
        localFilters.categoryLevel1
          ? productCategories.filter(
              (category) =>
                category.CATEGORY_LEVEL === 2 &&
                category.PARENT_ID === localFilters.categoryLevel1,
            )
          : [],
      [productCategories, localFilters.categoryLevel1],
    );

    // 獲取第三層分類（根據選擇的第二層）
    const level3Categories = useMemo(
      () =>
        localFilters.categoryLevel2
          ? productCategories.filter(
              (category) =>
                category.CATEGORY_LEVEL === 3 &&
                category.PARENT_ID === localFilters.categoryLevel2,
            )
          : [],
      [productCategories, localFilters.categoryLevel2],
    );

    // 優化下拉選單處理函數
    const togglePublishDropdown = useCallback(() => {
      setShowPublishDropdown(!showPublishDropdown);
    }, [showPublishDropdown]);

    const toggleBrandDropdown = useCallback(() => {
      setShowBrandDropdown(!showBrandDropdown);
    }, [showBrandDropdown]);

    const toggleCategoryLevel1Dropdown = useCallback(() => {
      setShowCategoryLevel1Dropdown(!showCategoryLevel1Dropdown);
    }, [showCategoryLevel1Dropdown]);

    const toggleCategoryLevel2Dropdown = useCallback(() => {
      if (localFilters.categoryLevel1) {
        setShowCategoryLevel2Dropdown(!showCategoryLevel2Dropdown);
      }
    }, [localFilters.categoryLevel1, showCategoryLevel2Dropdown]);

    const toggleCategoryLevel3Dropdown = useCallback(() => {
      if (localFilters.categoryLevel2) {
        setShowCategoryLevel3Dropdown(!showCategoryLevel3Dropdown);
      }
    }, [localFilters.categoryLevel2, showCategoryLevel3Dropdown]);

    const toggleTagDropdown = useCallback(() => {
      setShowTagDropdown(!showTagDropdown);
    }, [showTagDropdown]);

    // 優化選擇處理函數
    const handleSelectCategory1 = useCallback((category: CategoryType) => {
      setLocalFilters((prev) => ({
        ...prev,
        categoryLevel1: category.CATEGORY_ID,
        categoryLevel2: null,
        categoryLevel3: null,
      }));
      setShowCategoryLevel1Dropdown(false);
    }, []);

    const handleSelectCategory2 = useCallback((category: CategoryType) => {
      setLocalFilters((prev) => ({
        ...prev,
        categoryLevel2: category.CATEGORY_ID,
        categoryLevel3: null,
      }));
      setShowCategoryLevel2Dropdown(false);
    }, []);

    const handleSelectCategory3 = useCallback((category: CategoryType) => {
      setLocalFilters((prev) => ({
        ...prev,
        categoryLevel3: category.CATEGORY_ID,
      }));
      setShowCategoryLevel3Dropdown(false);
    }, []);

    const handleSelectBrand = useCallback((brand: CategoryType) => {
      setLocalFilters((prev) => ({
        ...prev,
        brand: brand.CATEGORY_ID,
      }));
      setShowBrandDropdown(false);
    }, []);

    const handleSelectTag = useCallback((tag: TagType) => {
      setLocalFilters((prev) => ({
        ...prev,
        tag: tag.TAG_ID,
      }));
      setShowTagDropdown(false);
    }, []);

    // 獲取篩選後的品牌
    const handleBrand = useMemo(() => {
      return allBrands.find(
        (brand) => brand.CATEGORY_ID === localFilters.brand,
      );
    }, [localFilters.brand, allBrands]);

    const handlePublishStatus = useMemo(() => {
      switch (localFilters.publishStatus) {
        case "1":
          return "已上架";
        case "0":
          return "未上架";
        default:
          return "上架狀態";
      }
    }, [localFilters.publishStatus]);

    return (
      <div
        className="modal fade"
        id={id}
        tabIndex={-1}
        aria-labelledby={`${id}Label`}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id={`${id}Label`}>
                {title}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">上架狀態</label>
                <div className="position-relative">
                  <div
                    className="form-control d-flex justify-content-between align-items-center"
                    onClick={togglePublishDropdown}
                    style={{ cursor: "pointer" }}
                  >
                    {handlePublishStatus}
                    <i className="bi bi-chevron-down"></i>
                  </div>
                  {showPublishDropdown && (
                    <div
                      className="position-absolute w-100 border rounded bg-white shadow-sm"
                      style={{ zIndex: 1000 }}
                    >
                      <div
                        className="p-2 hover-bg-light"
                        onClick={() => {
                          setLocalFilters((prev) => ({
                            ...prev,
                            publishStatus: "1",
                          }));
                          setShowPublishDropdown(false);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        已上架
                      </div>
                      <div
                        className="p-2 hover-bg-light"
                        onClick={() => {
                          setLocalFilters((prev) => ({
                            ...prev,
                            publishStatus: "0",
                          }));
                          setShowPublishDropdown(false);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        未上架
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">商品品牌</label>
                <div className="position-relative">
                  <div
                    className="form-control d-flex justify-content-between align-items-center"
                    onClick={toggleBrandDropdown}
                    style={{ cursor: "pointer" }}
                  >
                    {handleBrand?.CATEGORY_TITLE || "品牌"}
                    <i className="bi bi-chevron-down"></i>
                  </div>
                  {showBrandDropdown && (
                    <div
                      className="position-absolute w-100 border rounded bg-white shadow-sm"
                      style={{
                        zIndex: 1000,
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      {allBrands.map((brand, index) => (
                        <div
                          key={index}
                          className="p-2 hover-bg-light"
                          onClick={() => {
                            handleSelectBrand(brand);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          {brand.CATEGORY_TITLE}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">商品分類</label>
                <div className="row g-2">
                  <div className="col-4">
                    <div className="position-relative">
                      <div
                        className="form-control d-flex justify-content-between align-items-center"
                        onClick={toggleCategoryLevel1Dropdown}
                        style={{ cursor: "pointer" }}
                      >
                        {localFilters.categoryLevel1
                          ? productCategories.find(
                              (c) =>
                                c.CATEGORY_ID === localFilters.categoryLevel1,
                            )?.CATEGORY_TITLE
                          : "大類別"}
                        <i className="bi bi-chevron-down"></i>
                      </div>
                      {showCategoryLevel1Dropdown && (
                        <div
                          className="position-absolute w-100 border rounded bg-white shadow-sm"
                          style={{
                            zIndex: 1000,
                            maxHeight: "200px",
                            overflowY: "auto",
                          }}
                        >
                          {level1Categories.map((category) => (
                            <div
                              key={category.CATEGORY_ID}
                              className="p-2 hover-bg-light"
                              onClick={() => {
                                handleSelectCategory1(category);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              {category.CATEGORY_TITLE}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="position-relative">
                      <div
                        className={`form-control d-flex justify-content-between align-items-center ${
                          !localFilters.categoryLevel1 ? "disabled" : ""
                        }`}
                        onClick={toggleCategoryLevel2Dropdown}
                        style={{
                          cursor: localFilters.categoryLevel1
                            ? "pointer"
                            : "not-allowed",
                        }}
                      >
                        {localFilters.categoryLevel2
                          ? productCategories.find(
                              (c) =>
                                c.CATEGORY_ID === localFilters.categoryLevel2,
                            )?.CATEGORY_TITLE
                          : "中類別"}
                        <i className="bi bi-chevron-down"></i>
                      </div>
                      {showCategoryLevel2Dropdown && (
                        <div
                          className="position-absolute w-100 border rounded bg-white shadow-sm"
                          style={{
                            zIndex: 1000,
                            maxHeight: "200px",
                            overflowY: "auto",
                          }}
                        >
                          {level2Categories.map((category) => (
                            <div
                              key={category.CATEGORY_ID}
                              className="p-2 hover-bg-light"
                              onClick={() => {
                                handleSelectCategory2(category);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              {category.CATEGORY_TITLE}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="position-relative">
                      <div
                        className={`form-control d-flex justify-content-between align-items-center ${
                          !localFilters.categoryLevel2 ? "disabled" : ""
                        }`}
                        onClick={toggleCategoryLevel3Dropdown}
                        style={{
                          cursor: localFilters.categoryLevel2
                            ? "pointer"
                            : "not-allowed",
                        }}
                      >
                        {localFilters.categoryLevel3
                          ? productCategories.find(
                              (c) =>
                                c.CATEGORY_ID === localFilters.categoryLevel3,
                            )?.CATEGORY_TITLE
                          : "小類別"}
                        <i className="bi bi-chevron-down"></i>
                      </div>
                      {showCategoryLevel3Dropdown && (
                        <div
                          className="position-absolute w-100 border rounded bg-white shadow-sm"
                          style={{
                            zIndex: 1000,
                            maxHeight: "200px",
                            overflowY: "auto",
                          }}
                        >
                          {level3Categories.map((category) => (
                            <div
                              key={category.CATEGORY_ID}
                              className="p-2 hover-bg-light"
                              onClick={() => {
                                handleSelectCategory3(category);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              {category.CATEGORY_TITLE}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">商品標籤</label>
                <div className="position-relative">
                  <div
                    className="form-control d-flex justify-content-between align-items-center"
                    onClick={toggleTagDropdown}
                    style={{ cursor: "pointer" }}
                  >
                    {localFilters.tag
                      ? tags.find((t) => t.TAG_ID === localFilters.tag)
                          ?.TAG_NAME
                      : "標籤"}
                    <i className="bi bi-chevron-down"></i>
                  </div>
                  {showTagDropdown && (
                    <div
                      className="position-absolute w-100 border rounded bg-white shadow-sm"
                      style={{
                        zIndex: 1000,
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      {tags.map((tag) => (
                        <div
                          key={tag.TAG_ID}
                          className="p-2 hover-bg-light"
                          onClick={() => {
                            handleSelectTag(tag);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          {tag.TAG_NAME}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">關鍵字</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="輸入關鍵字搜尋"
                  value={localFilters.keyword}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      keyword: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  onReset();
                  // 重置後本地狀態也會透過 useEffect 同步
                }}
              >
                重置
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  // 點擊套用時，才一次性通知父組件更新並執行篩選
                  if (onBatchFilterChange) {
                    onBatchFilterChange(localFilters);
                  }
                  // 給予一點延遲確保 state 更新後再執行對外 API 調用
                  setTimeout(() => {
                    onApply(localFilters);
                  }, 50);
                }}
                data-bs-dismiss="modal"
              >
                套用
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default FilterModal;
