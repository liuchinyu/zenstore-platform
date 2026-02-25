import React from "react";
import Image from "next/image";
import LoadingLink from "@/components/LoadingLink/LoadingLink";
import { ProductListSkeleton } from "@/components/ProductSkeleton/ProductSkeleton";
import { Product } from "@/types";

/**
 * 產品列表表格組件的 Props
 */
interface ProductListTableProps {
  // 資料
  productList: Product[];
  isLoading: boolean;
  categoryTitle: string;

  // 選中狀態
  selectedProducts: { [key: string]: any };

  // 事件處理
  onCheckboxChange: (
    oracle_id: string,
    productId: string,
    fixedLotMultiplier: number,
    imageUrl: string,
    description: string,
    categoryTitle: string,
    price: number,
    inventory: number,
    brand: string
  ) => void;

  // Refs
  productImgRefs: React.MutableRefObject<{
    [key: string]: HTMLImageElement | null;
  }>;
}

/**
 * 產品列表表格組件
 *
 * 顯示產品列表,包含勾選框、圖片、零件編號、說明、製造商、單價、庫存量、最小包裝量等資訊
 */
const ProductListTable: React.FC<ProductListTableProps> = React.memo(
  ({
    productList,
    isLoading,
    categoryTitle,
    selectedProducts,
    onCheckboxChange,
    productImgRefs,
  }) => {
    return (
      <div className="table-responsive-md" style={{ overflow: "auto" }}>
        <table className="table table-bordered text-center align-middle">
          <thead className="table-secondary">
            <tr>
              <th style={{ width: "120px" }}>圖像</th>
              <th>零件編號</th>
              <th>說明</th>
              <th style={{ width: "100px" }}>製造商</th>
              <th style={{ width: "90px" }}>單價</th>
              <th style={{ width: "100px" }}>庫存量</th>
              <th style={{ width: "150px" }}>最小包裝量(MPQ)</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <ProductListSkeleton count={10} />
            ) : (
              productList.map((item) => (
                <tr key={item.ORACLE_ID}>
                  <td>
                    <div className="d-flex justify-content-center">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input border-secondary shadow-none"
                          onChange={() =>
                            onCheckboxChange(
                              item.ORACLE_ID,
                              item.PRODUCT_ID,
                              item.FIXED_LOT_MULTIPLIER,
                              item.IMAGE_URL,
                              item.DESCRIPTION,
                              categoryTitle,
                              item.PRICE,
                              item.INVENTORY,
                              item.BRAND
                            )
                          }
                          checked={!!selectedProducts[item.ORACLE_ID]}
                        />
                      </div>
                      <LoadingLink
                        href={`/products/${item.BRAND || ""}/${item.ORACLE_ID}`}
                      >
                        <Image
                          src={item.IMAGE_URL}
                          alt={item.PRODUCT_ID}
                          ref={(el) => {
                            productImgRefs.current[item.ORACLE_ID] = el;
                          }}
                          width={100}
                          height={100}
                          className="object-fit-contain"
                        />
                      </LoadingLink>
                    </div>
                  </td>
                  <td
                    style={{ fontSize: "13px", whiteSpace: "nowrap" }}
                    className="text-center"
                  >
                    <LoadingLink
                      href={`/products/${item.BRAND || ""}/${item.ORACLE_ID}`}
                    >
                      {item.PRODUCT_ID}
                    </LoadingLink>
                  </td>
                  <td style={{ fontSize: "12px" }} className="text-start">
                    {item.DESCRIPTION}
                  </td>
                  <td>{item.BRAND}</td>
                  <td style={{ fontSize: "14px" }}>
                    NT${item.PRICE.toLocaleString("zh-TW")}
                  </td>
                  <td>{item.INVENTORY}</td>
                  <td>{item.FIXED_LOT_MULTIPLIER}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }
);

// 設定 displayName 以便於 React DevTools 中識別
ProductListTable.displayName = "ProductListTable";

export default ProductListTable;
