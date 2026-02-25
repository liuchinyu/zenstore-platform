import React, { useState } from "react";
import { CategoryType } from "@/types/products/categoryType";
import { CategoryModal } from "@/components/modal";

interface ProductCategoryModalProps {
  id?: string;
  title?: string;
  categories: CategoryType[];
  show: boolean;
  onApply: () => void;
  onClose: () => void;
}

const ProductCategoryModal: React.FC<ProductCategoryModalProps> = ({
  id = "categoryModal",
  title = "分類設定",
  categories,
  show,
  onApply,
  onClose,
}) => {
  // 內部狀態
  const [showManufactureCategories, setShowManufactureCategories] =
    useState(false);
  const [selectedManufacturerCategory, setSelectedManufacturerCategory] =
    useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showProductCategories, setShowProductCategories] = useState(false);
  const [manufacturerSearchTerm, setManufacturerSearchTerm] = useState("");
  const [productCategorySearchTerm, setProductCategorySearchTerm] =
    useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [tempProductCategorySearchTerm, setTempProductCategorySearchTerm] =
    useState("");

  // 篩選
  const manufactureCategory = categories.filter(
    (c) => c.category_type === "製造商"
  );
  const productCategories = categories.filter(
    (c) => c.category_type === "產品"
  );
  const firstLevelProductCategories = productCategories.filter(
    (c) => c.category_level === 1
  );

  const filteredManufacturerCategories = manufactureCategory.filter(
    (category) =>
      category.category_title
        .toLowerCase()
        .includes(manufacturerSearchTerm.toLowerCase())
  );
  const filteredProductCategories = firstLevelProductCategories.filter(
    (category) =>
      category.category_title
        .toLowerCase()
        .includes(productCategorySearchTerm.toLowerCase())
  );

  // 處理商品分類搜尋輸入
  const handleProductCategoryInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setTempProductCategorySearchTerm(value);
    if (!isComposing) setProductCategorySearchTerm(value);
  };
  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = () => {
    setIsComposing(false);
    setProductCategorySearchTerm(tempProductCategorySearchTerm);
  };

  const handleClose = () => {
    setSelectedManufacturerCategory(null);
    setSelectedCategory(null);
    setShowProductCategories(false);
    setShowManufactureCategories(false);
    onClose();
  };

  // Modal 顯示控制

  return (
    <CategoryModal id="categoryModal" title="分類設定">
      <h6 className="mb-3">製造商分類</h6>
      <div className="mb-4">
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
                showManufactureCategories ? "bi-chevron-up" : "bi-chevron-down"
              }`}
            ></i>
          </div>
          {showManufactureCategories && (
            <div className="card-body">
              {filteredManufacturerCategories.length > 0 ? (
                <div className="list-group">
                  <div className="d-flex mb-1">
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
                      key={category.category_id}
                      type="button"
                      className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                        selectedManufacturerCategory === category.category_id
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedManufacturerCategory(category.category_id)
                      }
                    >
                      {category.category_title}
                      {selectedManufacturerCategory ===
                        category.category_id && (
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
                    <button
                      key={category.category_id}
                      type="button"
                      className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                        selectedCategory === category.category_id
                          ? "active"
                          : ""
                      }`}
                      onClick={() => setSelectedCategory(category.category_id)}
                    >
                      {category.category_title}
                      {selectedCategory === category.category_id && (
                        <i className="bi bi-check-lg ms-2"></i>
                      )}
                    </button>
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

      <div className="modal-footer d-flex justify-content-end">
        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={handleClose}
          //   onClick={() => {
          //     setSelectedManufacturerCategory(null);
          //     setSelectedCategory(null);
          //     setShowProductCategories(false);
          //     setShowManufactureCategories(false);
          //     onClose();
          //   }}
        >
          取消
        </button>
        <button type="button" className="btn btn-primary" onClick={onApply}>
          套用
        </button>
      </div>
    </CategoryModal>
  );
};

export default ProductCategoryModal;
