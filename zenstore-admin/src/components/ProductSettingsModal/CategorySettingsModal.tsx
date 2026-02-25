import React, { useState, useEffect } from "react";
import { CategoryType } from "@/types/products/categoryType";
import { CategoryModal } from "@/components/modal";

interface CategorySettingsModalProps {
  id?: string;
  title?: string;
  productCategories: CategoryType[];
  allBrands: CategoryType[];
  selectedManufacturerCategory: number | null;
  selectedCategory: number[];
  onManufacturerCategoryChange: (categoryId: number | null) => void;
  onProductCategoryChange: (
    categoryId: number,
    secondLevelId?: number,
    thirdLevelId?: number,
  ) => void;
  onApply: () => void;
  onClose: () => void;
}

const CategorySettingsModal: React.FC<CategorySettingsModalProps> = ({
  id = "categoryModal",
  title = "分類設定",
  productCategories,
  allBrands,
  selectedManufacturerCategory,
  selectedCategory,
  onManufacturerCategoryChange,
  onProductCategoryChange,
  onApply,
  onClose,
}) => {
  // 展開製造商分類選單
  const [showManufactureCategories, setShowManufactureCategories] =
    useState(false);

  // 展開商品分類選單
  const [showProductCategories, setShowProductCategories] = useState(false);

  // 分類設定裡，搜尋製造商分類
  const [manufacturerSearchTerm, setManufacturerSearchTerm] = useState("");

  // 商品分類搜尋狀態
  const [productCategorySearchTerm, setProductCategorySearchTerm] =
    useState("");

  // 新增商品分類的輸入法狀態
  const [isComposing, setIsComposing] = useState(false);

  // 暫存輸入內容
  const [tempProductCategorySearchTerm, setTempProductCategorySearchTerm] =
    useState("");

  // 新增展開的第一層分類 id 狀態
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(
    null,
  );

  // 新增選擇的第二層分類 id 狀態
  const [selectedSecondLevelCategory, setSelectedSecondLevelCategory] =
    useState<number | null>(null);

  // 新增展開的第二層分類 id 狀態
  const [expandedSecondLevelId, setExpandedSecondLevelId] = useState<
    number | null
  >(null);

  // 新增選擇的第三層分類 id 狀態
  const [selectedThirdLevelCategory, setSelectedThirdLevelCategory] = useState<
    number | null
  >(null);

  // 篩選商品分類（非製造商分類）
  // const productCategories = categories.filter(
  //   (category) => category.category_type === "產品",
  // );

  // 第一層商品分類
  const firstLevelProductCategories = productCategories.filter(
    (category) => category.CATEGORY_LEVEL === 1,
  );

  // 第二層商品分類
  const secondLevelProductCategories = productCategories.filter(
    (category) => category.CATEGORY_LEVEL === 2,
  );

  // 第三層商品分類
  const thirdLevelProductCategories = productCategories.filter(
    (category) => category.CATEGORY_LEVEL === 3,
  );

  // 根據搜尋詞篩選製造商分類
  const filteredManufacturerCategories = allBrands.filter((category) =>
    category.CATEGORY_TITLE.toLowerCase().includes(
      manufacturerSearchTerm.toLowerCase(),
    ),
  );

  // 根據搜尋詞篩選商品分類
  const filteredProductCategories = firstLevelProductCategories.filter(
    (category) =>
      category.CATEGORY_TITLE.toLowerCase().includes(
        productCategorySearchTerm.toLowerCase(),
      ),
  );

  // 處理商品分類搜尋輸入
  const handleProductCategoryInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setTempProductCategorySearchTerm(value);

    // 只有在不是輸入法組合過程中才更新搜尋詞
    if (!isComposing) {
      setProductCategorySearchTerm(value);
    }
  };

  // 處理輸入法組合開始
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  // 處理輸入法組合結束
  const handleCompositionEnd = (
    e: React.CompositionEvent<HTMLInputElement>,
  ) => {
    setIsComposing(false);
    setProductCategorySearchTerm(tempProductCategorySearchTerm);
  };

  // 選擇製造商分類
  const handleSelectManufacturerCategory = (categoryId: number) => {
    onManufacturerCategoryChange(categoryId);
  };

  // 調整 handleSelectProductCategory 支援三層分類
  const handleSelectProductCategory = (
    categoryId: number,
    secondLevelId?: number,
    thirdLevelId?: number,
  ) => {
    onProductCategoryChange(categoryId, secondLevelId, thirdLevelId);

    if (secondLevelId) {
      setSelectedSecondLevelCategory(secondLevelId);
    } else {
      setSelectedSecondLevelCategory(null);
    }

    if (thirdLevelId) {
      setSelectedThirdLevelCategory(thirdLevelId);
    } else {
      setSelectedThirdLevelCategory(null);
    }
  };

  // 處理關閉
  const handleClose = () => {
    onClose();
    setShowProductCategories(false);
    setShowManufactureCategories(false);
  };

  return (
    <CategoryModal id={id} title={title} onClose={handleClose}>
      <div>
        <h6 className="mb-3">製造商分類</h6>
        <div className="mb-4">
          {/* 製造商分類搜尋輸入框 */}
          <div className="card">
            <div
              className="card-header d-flex justify-content-between align-items-center"
              onClick={() =>
                setShowManufactureCategories(!showManufactureCategories)
              }
              style={{ cursor: "pointer" }}
            >
              <span>選擇製造商分類</span>
              <i
                className={`bi ${
                  showManufactureCategories
                    ? "bi-chevron-up"
                    : "bi-chevron-down"
                }`}
              ></i>
            </div>
            {showManufactureCategories && (
              <div className="card-body">
                {filteredManufacturerCategories.length > 0 ? (
                  <div className="list-group">
                    <div className="d-flex mb-1">
                      {/* 搜尋製造商分類 */}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="搜尋製造商分類..."
                        value={manufacturerSearchTerm}
                        onChange={(e) =>
                          setManufacturerSearchTerm(e.target.value)
                        }
                      />
                      <button
                        className="btn btn-outline-secondary ms-1"
                        type="button"
                        onClick={() => setManufacturerSearchTerm("")}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>

                    {filteredManufacturerCategories.map((category) => (
                      <button
                        key={category.CATEGORY_ID}
                        type="button"
                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                          selectedManufacturerCategory === category.CATEGORY_ID
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          handleSelectManufacturerCategory(category.CATEGORY_ID)
                        }
                      >
                        {category.CATEGORY_TITLE}
                        {selectedManufacturerCategory ===
                          category.CATEGORY_ID && (
                          <i className="bi bi-check-lg ms-2"></i>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    {manufacturerSearchTerm ? (
                      <>
                        <div className="d-flex mb-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="搜尋製造商分類..."
                            value={manufacturerSearchTerm}
                            onChange={(e) =>
                              setManufacturerSearchTerm(e.target.value)
                            }
                          />
                          <button
                            className="btn btn-outline-secondary ms-1"
                            type="button"
                            onClick={() => setManufacturerSearchTerm("")}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                        <p className="text-muted">查無此製造商分類</p>
                      </>
                    ) : (
                      <p className="text-muted">尚無製造商分類</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <h6 className="mb-3">商品分類</h6>
        <div className="mb-4">
          <div className="card">
            <div
              className="card-header d-flex justify-content-between align-items-center"
              onClick={() => setShowProductCategories(!showProductCategories)}
              style={{ cursor: "pointer" }}
            >
              <span>選擇商品分類</span>
              <i
                className={`bi ${
                  showProductCategories ? "bi-chevron-up" : "bi-chevron-down"
                }`}
              ></i>
            </div>
            {showProductCategories && (
              <div className="card-body">
                {filteredProductCategories.length > 0 ? (
                  <div className="list-group">
                    <div className="d-flex mb-1">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="搜尋商品分類..."
                        value={tempProductCategorySearchTerm}
                        onChange={handleProductCategoryInputChange}
                        onCompositionStart={handleCompositionStart}
                        onCompositionEnd={handleCompositionEnd}
                      />
                      <button
                        className="btn btn-outline-secondary ms-1"
                        type="button"
                        onClick={() => {
                          setTempProductCategorySearchTerm("");
                          setProductCategorySearchTerm("");
                        }}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                    {filteredProductCategories.map((category) => (
                      <div key={category.CATEGORY_ID} className="w-100">
                        <div className="d-flex align-items-center">
                          <button
                            type="button"
                            className={`list-group-item list-group-item-action flex-grow-1 d-flex justify-content-between align-items-center ${
                              selectedCategory.includes(category.CATEGORY_ID)
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              handleSelectProductCategory(category.CATEGORY_ID)
                            }
                            style={{
                              borderBottom: "1px solid #dee2e6",
                              textAlign: "left",
                            }}
                          >
                            {category.CATEGORY_TITLE}
                            {selectedCategory.includes(category.CATEGORY_ID) &&
                              selectedCategory.length === 1 &&
                              !selectedThirdLevelCategory && (
                                <i className="bi bi-check-lg ms-2"></i>
                              )}
                          </button>
                          {/* 展開/收合按鈕 */}
                          {secondLevelProductCategories.some(
                            (sub) => sub.PARENT_ID === category.CATEGORY_ID,
                          ) && (
                            <button
                              type="button"
                              className="btn btn-link p-0 ms-2"
                              aria-label={
                                expandedCategoryId === category.CATEGORY_ID
                                  ? "收合"
                                  : "展開"
                              }
                              onClick={() =>
                                setExpandedCategoryId(
                                  expandedCategoryId === category.CATEGORY_ID
                                    ? null
                                    : category.CATEGORY_ID,
                                )
                              }
                              tabIndex={0}
                            >
                              <i
                                className={`bi ${
                                  expandedCategoryId === category.CATEGORY_ID
                                    ? "bi-chevron-up"
                                    : "bi-chevron-down"
                                }`}
                              ></i>
                            </button>
                          )}
                        </div>
                        {/* 第二層分類展開區塊 */}
                        {expandedCategoryId === category.CATEGORY_ID && (
                          <div className="ms-4">
                            {secondLevelProductCategories
                              .filter(
                                (sub) => sub.PARENT_ID === category.CATEGORY_ID,
                              )
                              .map((sub) => (
                                <div key={sub.CATEGORY_ID} className="w-100">
                                  <div className="d-flex align-items-center">
                                    <button
                                      type="button"
                                      className={`list-group-item list-group-item-action flex-grow-1 d-flex justify-content-between align-items-center ${
                                        selectedCategory.includes(
                                          sub.CATEGORY_ID,
                                        )
                                          ? "active"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        handleSelectProductCategory(
                                          category.CATEGORY_ID,
                                          sub.CATEGORY_ID,
                                        )
                                      }
                                      style={{
                                        borderBottom: "1px solid #dee2e6",
                                        textAlign: "left",
                                      }}
                                    >
                                      <span className="ms-3">
                                        {sub.CATEGORY_TITLE}
                                      </span>
                                      {selectedCategory.includes(
                                        sub.CATEGORY_ID,
                                      ) &&
                                        !selectedThirdLevelCategory && (
                                          <i className="bi bi-check-lg ms-2"></i>
                                        )}
                                    </button>
                                    {/* 展開/收合按鈕（第三層） */}
                                    {thirdLevelProductCategories.some(
                                      (third) =>
                                        third.PARENT_ID === sub.CATEGORY_ID,
                                    ) && (
                                      <button
                                        type="button"
                                        className="btn btn-link p-0 ms-2"
                                        aria-label={
                                          expandedSecondLevelId ===
                                          sub.CATEGORY_ID
                                            ? "收合"
                                            : "展開"
                                        }
                                        onClick={() =>
                                          setExpandedSecondLevelId(
                                            expandedSecondLevelId ===
                                              sub.CATEGORY_ID
                                              ? null
                                              : sub.CATEGORY_ID,
                                          )
                                        }
                                        tabIndex={0}
                                      >
                                        <i
                                          className={`bi ${
                                            expandedSecondLevelId ===
                                            sub.CATEGORY_ID
                                              ? "bi-chevron-up"
                                              : "bi-chevron-down"
                                          }`}
                                        ></i>
                                      </button>
                                    )}
                                  </div>
                                  {/* 第三層分類展開區塊 */}
                                  {expandedSecondLevelId ===
                                    sub.CATEGORY_ID && (
                                    <div className="ms-4">
                                      {thirdLevelProductCategories
                                        .filter(
                                          (third) =>
                                            third.PARENT_ID === sub.CATEGORY_ID,
                                        )
                                        .map((third) => (
                                          <button
                                            key={third.CATEGORY_ID}
                                            type="button"
                                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                                              selectedThirdLevelCategory ===
                                                third.CATEGORY_ID &&
                                              selectedSecondLevelCategory ===
                                                sub.CATEGORY_ID &&
                                              selectedCategory.includes(
                                                category.CATEGORY_ID,
                                              )
                                                ? "active"
                                                : ""
                                            }`}
                                            onClick={() =>
                                              handleSelectProductCategory(
                                                category.CATEGORY_ID,
                                                sub.CATEGORY_ID,
                                                third.CATEGORY_ID,
                                              )
                                            }
                                            style={{
                                              borderBottom: "1px solid #dee2e6",
                                              textAlign: "left",
                                            }}
                                          >
                                            <span className="ms-4">
                                              {third.CATEGORY_TITLE}
                                            </span>
                                            {selectedThirdLevelCategory ===
                                              third.CATEGORY_ID &&
                                              selectedSecondLevelCategory ===
                                                sub.CATEGORY_ID &&
                                              selectedCategory.includes(
                                                category.CATEGORY_ID,
                                              ) && (
                                                <i className="bi bi-check-lg ms-2"></i>
                                              )}
                                          </button>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {productCategorySearchTerm ? (
                      <>
                        <div className="d-flex mb-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="搜尋商品分類..."
                            value={tempProductCategorySearchTerm}
                            onChange={handleProductCategoryInputChange}
                            onCompositionStart={handleCompositionStart}
                            onCompositionEnd={handleCompositionEnd}
                          />
                          <button
                            className="btn btn-outline-secondary ms-1"
                            type="button"
                            onClick={() => {
                              setTempProductCategorySearchTerm("");
                              setProductCategorySearchTerm("");
                            }}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                        <p className="text-muted">查無此商品分類</p>
                      </>
                    ) : (
                      <p className="text-muted">尚無商品分類</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="d-flex justify-content-end mt-4">
          <button
            type="button"
            className="btn btn-secondary me-2"
            data-bs-dismiss="modal"
            onClick={handleClose}
          >
            取消
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onApply}
            data-bs-dismiss="modal"
          >
            套用
          </button>
        </div>
      </div>
    </CategoryModal>
  );
};

export default CategorySettingsModal;
