import React, { useEffect } from "react";
import Image from "next/image";
import LoadingLink from "@/components/LoadingLink/LoadingLink";
import WishlistButton from "@/components/WishlistButton/WishlistButton";
import { SelectedProduct } from "@/hooks/useCart";

/**
 * 底部操作欄組件的 Props
 */
interface BottomActionBarProps {
  // 資料
  selectedProducts: { [key: string]: SelectedProduct };
  categoryTitle: string;
  memberId: string;

  // 事件處理
  onQuantityChange: (
    oracleId: string,
    quantity: number,
    isDirectInput?: boolean
  ) => void;
  onAddToCart: () => void;
  onProductsChange: React.Dispatch<
    React.SetStateAction<{ [key: string]: SelectedProduct }>
  >;
}

/**
 * 底部操作欄組件
 *
 * 顯示已選中的產品,提供數量調整和加入購物車功能
 */
const BottomActionBar: React.FC<BottomActionBarProps> = React.memo(
  ({
    selectedProducts,
    categoryTitle,
    memberId,
    onQuantityChange,
    onAddToCart,
    onProductsChange,
  }) => {
    useEffect(() => {
      import("bootstrap").then((bootstrap) => {
        const tooltipTriggerList = document.querySelectorAll(
          '[data-bs-toggle="tooltip"]'
        );
        const tooltipList = [...tooltipTriggerList].map(
          (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
        );

        // 清理函數
        return () => {
          tooltipList.forEach((tooltip) => tooltip.dispose());
        };
      });
    }, [selectedProducts]); // 當 product 改變時重新初始化
    return (
      <div className="productList_bottomBar d-flex align-items-center justify-content-between px-3 py-2">
        <div className="d-flex align-items-center flex-wrap">
          <table className="table border-dark">
            <tbody>
              {/* 使用 Object.entries 取代 Object.keys,避免重複計算 */}
              {Object.entries(selectedProducts).map(([oracleId, product]) => (
                <tr key={oracleId} className="align-baseline">
                  <td>
                    <Image
                      src={product.image_url}
                      alt={oracleId}
                      width={50}
                      height={50}
                    />
                  </td>
                  <td>
                    <LoadingLink
                      href={`/products/${encodeURIComponent(
                        categoryTitle
                      )}/${oracleId}`}
                      className="text-decoration-underline mx-2 text-dark"
                    >
                      {oracleId}
                    </LoadingLink>
                  </td>
                  <td>
                    <div
                      className="input-group input-group-sm"
                      style={{ width: "120px" }}
                    >
                      {/* 減少按鈕 */}
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => {
                          onQuantityChange(oracleId, -product.quantity);
                        }}
                      >
                        -
                      </button>

                      {/* 數量輸入框 */}
                      <input
                        type="text"
                        className="form-control text-center"
                        value={product.quantity_change}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          onProductsChange((prev) => ({
                            ...prev,
                            [oracleId]: {
                              ...prev[oracleId],
                              quantity_change: value,
                            },
                          }));
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          onQuantityChange(oracleId, value, true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const value = parseInt(e.currentTarget.value) || 1;
                            onQuantityChange(oracleId, value, true);
                            e.currentTarget.blur();
                          }
                        }}
                      />

                      {/* 增加按鈕 */}
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => {
                          onQuantityChange(oracleId, product.quantity);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>
                    <div>
                      <WishlistButton
                        oracleId={product.oracle_id}
                        memberId={memberId}
                        variant="button"
                        className="me-2"
                      />
                      <span
                        className="d-inline-block"
                        tabIndex={0}
                        data-bs-toggle="tooltip"
                        data-bs-title={
                          product?.inventory < product?.quantity
                            ? "商品已下架或庫存不足"
                            : "加入購物車"
                        }
                      >
                        <button
                          className="btn btn-danger"
                          onClick={onAddToCart}
                          disabled={product?.inventory < product?.quantity}
                        >
                          加入購物車
                        </button>
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

// 設定 displayName 以便於 React DevTools 中識別
BottomActionBar.displayName = "BottomActionBar";

export default BottomActionBar;
