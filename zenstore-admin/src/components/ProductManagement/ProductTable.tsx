import Link from "next/link";
import clsx from "clsx";

interface ProductTableProps {
  products: any[]; //全部商品
  selectedProducts: string[]; //已選擇的商品
  onSelectProduct: (oracleId: string) => void;
  onSelectAll: () => void;
  onImagePreview: (src: string) => void;
}

const ProductTable = ({
  products,
  selectedProducts,
  onSelectProduct,
  onSelectAll,
  onImagePreview,
}: ProductTableProps) => {
  return (
    <div className="row">
      <div className="col-12">
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th className="text-center">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={
                      selectedProducts.length === products.length &&
                      products.length > 0
                    }
                    onChange={onSelectAll}
                  />
                </th>
                <th style={{ width: "110px" }}>圖片</th>
                <th>商品名稱</th>
                <th style={{ width: "100px" }}>品牌</th>
                <th>分類</th>
                <th style={{ width: "150px" }}>標籤</th>
                <th style={{ width: "100px" }}>庫存數量</th>
                <th style={{ width: "90px" }}>上架狀態</th>
                <th style={{ width: "100px" }}>價格</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.ORACLE_ID}
                  className={
                    selectedProducts.includes(product.ORACLE_ID)
                      ? "table-primary"
                      : ""
                  }
                >
                  <td className="text-center">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedProducts.includes(product.ORACLE_ID)}
                      onChange={() => onSelectProduct(product.ORACLE_ID)}
                    />
                  </td>
                  <td className="text-center">
                    {product.IMAGE_URL ? (
                      <img
                        src={product.IMAGE_URL}
                        width={60}
                        height="60"
                        className="img-thumbnail"
                        style={{ cursor: "pointer", objectFit: "cover" }}
                        onClick={() => onImagePreview(product.IMAGE_URL)}
                        alt={product.PRODUCT_ID}
                      />
                    ) : (
                      <div
                        className="bg-light d-flex align-items-center justify-content-center"
                        style={{ width: "60px", height: "60px" }}
                      >
                        <span
                          className="text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          無圖片
                        </span>
                      </div>
                    )}
                  </td>
                  <td>
                    <Link
                      href={`/products/edit?oracle_id=${product.ORACLE_ID}`}
                      className="text-decoration-none text-primary fw-bold"
                    >
                      {product.PRODUCT_ID}
                    </Link>
                  </td>
                  <td>{product.BRAND}</td>
                  <td>{product.CATEGORY_TITLES}</td>
                  <td>{product.TAG_NAMES}</td>
                  <td>{product.INVENTORY}</td>
                  <td>
                    <span
                      className={clsx(
                        "badge",
                        product.IS_PUBLISHED > 0 ? "bg-success" : "bg-danger"
                      )}
                    >
                      {product.IS_PUBLISHED > 0 ? "已上架" : "下架"}
                    </span>
                  </td>
                  <td>NT${product.PRICE?.toLocaleString()}</td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    沒有找到商品
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
