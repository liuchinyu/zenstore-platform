import { useRouter } from "next/navigation";

interface ProductBatchActionsProps {
  selectedProductsLength: number;
  selectedProducts: string[];
  onShowCategoryModal: () => void;
  onShowTagModal: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}

const ProductBatchActions = ({
  selectedProductsLength,
  selectedProducts,
  onShowCategoryModal,
  onShowTagModal,
  onPublish,
  onUnpublish,
}: ProductBatchActionsProps) => {
  const router = useRouter();

  if (selectedProductsLength === 0) {
    return (
      <div className="row mb-3">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <span className="text-danger">勾選商品後再執行操作</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="row mb-3">
      <div className="col-12 d-flex">
        <button
          className="btn btn-secondary me-2"
          onClick={onShowCategoryModal}
          data-bs-toggle="modal"
          data-bs-target="#categoryModal"
        >
          <i className="bi bi-list me-1"></i> 分類設定
        </button>
        <button
          className="btn btn-secondary me-2"
          onClick={onShowTagModal}
          data-bs-toggle="modal"
          data-bs-target="#tagModal"
        >
          <i className="bi bi-tags-fill me-1"></i> 標籤設定
        </button>
        <button
          className="btn btn-primary me-2"
          onClick={() => {
            const ids = selectedProducts.join(",");
            router.push(`/products/edit?oracle_id=${ids}`);
          }}
          disabled={selectedProductsLength !== 1}
        >
          <i className="bi bi-pencil-square me-1"></i>編輯
        </button>
        <button
          className="btn btn-outline-success ms-auto me-2"
          onClick={onPublish}
        >
          <i className="bi bi-arrow-up-circle me-1"></i> 上架
        </button>
        <button className="btn btn-outline-warning me-2" onClick={onUnpublish}>
          <i className="bi bi-arrow-down-circle me-1"></i> 下架
        </button>
      </div>
    </div>
  );
};

export default ProductBatchActions;
