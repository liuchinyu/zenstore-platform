"use client";
// 產品列表頁面
import React, {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useParams, useSearchParams } from "next/navigation";
import ProductFilter from "@/components/ProductFilter/ProductFilter";
import ProductListTable from "@/components/ProductListTable/ProductListTable";
import BottomActionBar from "@/components/BottomActionBar/BottomActionBar";
import ProductService from "@/services/productService";
import { Product } from "@/types";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { clearAnimatingItems } from "@/store/cartSlice";
import { useCart, SelectedProduct } from "@/hooks/useCart";
import { usePagination } from "@/hooks/usePagination";
import LoadingLink from "@/components/LoadingLink/LoadingLink";
import { useToast } from "@/hooks/useToast";
import {
  selectCategories,
  selectManufactureCategories,
} from "@/store/selectors/headerSelectors";

import { selectMemberId } from "@/store/selectors/authSelectors";

// === 1. 基礎 Hooks ===

export default function ProductList() {
  // Redux hooks
  const { showToast } = useToast();
  const member_id = useAppSelector(selectMemberId);
  const categories = useAppSelector(selectCategories);
  const manufactureCategories = useAppSelector(selectManufactureCategories);
  const dispatch = useAppDispatch();

  // Navigation hooks
  const params = useParams();
  const searchParams = useSearchParams();

  // Custom hooks
  const { handleBatchAddToCart, validateQuantity } = useCart();
  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    setTotalPages,
    setTotalItems,
    handlePageChange,
  } = usePagination(1, 25);
  // === 2. 狀態管理 ===
  // URL 參數狀態
  const categoryTitle = decodeURIComponent(params.category_title as string);
  const categoryIdFromQuery = Number(searchParams.get("id"));
  const manufactureIdFromQuery = Number(searchParams.get("manufactureId"));

  // 分類相關狀態
  const [categoryId, setCategoryId] = useState<number[]>(() => {
    const initIds: number[] = [];
    if (manufactureIdFromQuery > 0) {
      initIds.push(manufactureIdFromQuery);
    }
    if (categoryIdFromQuery >= 0 && !initIds.includes(categoryIdFromQuery)) {
      initIds.push(categoryIdFromQuery);
    }
    return initIds;
  }); //取得分類最小階層，預設為初次點擊的分類

  const [propCategoryId, setPropCategoryId] = useState<number[]>([]); //傳遞選擇的所有分類(麵包屑ID)給productFilter
  const [breadcrumb, setBreadcrumb] = useState<
    { CATEGORY_ID: number; CATEGORY_TITLE: string }[]
  >([]);

  const [productList, setProductList] = useState<Product[]>([]); //對應最小分類的當前頁商品
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 選中產品狀態
  const [selectedProducts, setSelectedProducts] = useState<{
    [key: string]: SelectedProduct;
  }>({});

  // Refs
  const productImgRefs = useRef<{
    [key: string]: HTMLImageElement | null;
  }>({});

  // === 3. 數據處理 ===
  // 取得所有分類
  const allCategories = useMemo(() => {
    return [...categories, ...manufactureCategories];
  }, [categories, manufactureCategories]);

  // 建立分類 Map 以加速查找 (O(1) 時間複雜度)
  const categoryMap = useMemo(() => {
    const map = new Map<number, any>();
    allCategories.forEach((cat) => {
      map.set(cat.CATEGORY_ID, cat);
    });
    return map;
  }, [allCategories]);
  // 使用迭代方式建立麵包屑
  const buildBreadcrumb = useCallback(
    (categoryId: number[]) => {
      let breadcrumb: { CATEGORY_ID: number; CATEGORY_TITLE: string }[] = [];
      if (categoryId.length > 3) {
        breadcrumb = [];
      } else {
        categoryId.forEach((id) => {
          const category = categoryMap.get(id);
          if (category) {
            breadcrumb.push({
              CATEGORY_ID: category.CATEGORY_ID,
              CATEGORY_TITLE: category.CATEGORY_TITLE,
            });
          }
        });
      }
      return breadcrumb;
    },
    [categoryMap]
  );

  // 從 selectedProducts 計算是否顯示底部操作欄
  const showBottomBar = useMemo(() => {
    return Object.keys(selectedProducts).length > 0;
  }, [selectedProducts]);

  // === 4. 副作用 (Side Effects) ===

  // 確保每次路由參數改變時清除可能殘留的動畫
  useEffect(() => {
    dispatch(clearAnimatingItems());
  }, [params, dispatch]);

  // 當 categoryId 變更時重新載入產品列表、更新麵包屑
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. 處理麵包屑
        if (categoryId.length === 0) {
          setPropCategoryId([]);
          setBreadcrumb([]);
        } else if (categoryMap.size > 0) {
          // 使用新的迭代方式建立麵包屑
          const breadcrumb = buildBreadcrumb(categoryId);

          if (breadcrumb.length > 0) {
            // 直接從麵包屑提取 ID 陣列
            const propCategoryIds = breadcrumb.map((item) => item.CATEGORY_ID);
            setBreadcrumb(breadcrumb);
            setPropCategoryId(propCategoryIds);
          } else {
            // 找不到分類時清空麵包屑
            setPropCategoryId([]);
            setBreadcrumb([]);
          }
        }

        // 2. 載入產品列表
        const productResponse = await ProductService.getProductListByCategoryId(
          categoryId,
          currentPage,
          itemsPerPage
        );

        if (productResponse && productResponse.items.length > 0) {
          setProductList(productResponse.items);
          setTotalPages(productResponse.totalPages);
          setTotalItems(productResponse.totalItems);
        } else {
          setProductList([]);
          setTotalPages(0);
          setTotalItems(0);
        }
      } catch (e) {
        console.error("資料載入失敗", e);
        showToast("資料讀取錯誤,請稍後再試", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [categoryId, currentPage, categoryMap, buildBreadcrumb]);

  // === 5. 事件處理 ===

  // 取得ProductFilter篩選的最小類別ID
  const handleCategoryIdChange = useCallback(
    (category_id: number[]) => {
      setCategoryId(category_id);
      handlePageChange(1); // 使用 Hook 提供的方法
    },
    [handlePageChange]
  );

  // 處理勾選框變更
  const handleCheckboxChange = useCallback(
    (
      oracle_id: string,
      productId: string,
      FIXED_LOT_MULTIPLIER: number,
      image_url: string,
      description: string,
      category_title: string,
      price: number,
      inventory: number,
      brand: string
    ) => {
      setSelectedProducts((prev) => {
        const newSelectedProducts = { ...prev };

        if (newSelectedProducts[oracle_id]) {
          delete newSelectedProducts[oracle_id];
        } else {
          newSelectedProducts[oracle_id] = {
            product_id: productId,
            quantity: FIXED_LOT_MULTIPLIER,
            quantity_change: FIXED_LOT_MULTIPLIER,
            category_title: categoryTitle,
            image_url: image_url,
            oracle_id: oracle_id,
            description: description,
            price: price,
            inventory: inventory,
            brand: brand,
          };
        }

        return newSelectedProducts;
      });
    },
    [categoryTitle]
  );

  // 數量變更處理
  const handleQuantityChange = useCallback(
    (oracleId: string, quantity_parameter: number, isDirectInput?: boolean) => {
      if (isDirectInput) {
        const minQuantity = selectedProducts[oracleId].quantity;
        const validation = validateQuantity(quantity_parameter, minQuantity);

        if (!validation.isValid) {
          setTimeout(() => {
            setSelectedProducts((prev) => ({
              ...prev,
              [oracleId]: {
                ...prev[oracleId],
                quantity_change: validation.correctedQuantity,
              },
            }));
          }, 800);
          return;
        }

        setSelectedProducts((prev) => ({
          ...prev,
          [oracleId]: {
            ...prev[oracleId],
            quantity_change: quantity_parameter,
          },
        }));
      } else {
        if (
          selectedProducts[oracleId].quantity_change + quantity_parameter ===
          0
        ) {
          setSelectedProducts((prev) => {
            const newSelectedProducts = { ...prev };
            delete newSelectedProducts[oracleId];
            return newSelectedProducts;
          });
          return;
        }

        setSelectedProducts((prev) => ({
          ...prev,
          [oracleId]: {
            ...prev[oracleId],
            quantity_change:
              prev[oracleId].quantity_change + quantity_parameter,
          },
        }));
      }
    },
    [selectedProducts, validateQuantity]
  );

  // 批量加入購物車
  const handleAddToCart = useCallback(async () => {
    try {
      const result = await handleBatchAddToCart(
        selectedProducts,
        productImgRefs
      );

      if (result?.success) {
        setSelectedProducts({});
      }
    } catch (error) {
      console.error("加入購物車失敗:", error);
      showToast("加入購物車失敗,請稍後再試", "error");
    }
  }, [selectedProducts, handleBatchAddToCart, productImgRefs, showToast]);

  // === 6. 渲染邏輯 ===
  return (
    <>
      <div
        className="container-fluid"
        style={{ marginBottom: "-0.8rem", overflow: "hidden" }}
      >
        <div className="row">
          <ProductFilter
            onCategoryIdChange={handleCategoryIdChange}
            propCategoryId={propCategoryId}
          />
          <div className="col-md-10">
            <div className="row">
              {/* 麵包屑導航 */}
              <div className="col-12">
                <nav
                  style={
                    { "--bs-breadcrumb-divider": "'>'" } as React.CSSProperties
                  }
                  className="mt-2"
                  aria-label="breadcrumb"
                >
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <LoadingLink
                        href="/"
                        className="text-decoration-none text-dark productList_breadcrumbLink"
                      >
                        首頁
                      </LoadingLink>
                    </li>
                    <li
                      className="breadcrumb-item text-dark "
                      aria-current="page"
                    >
                      <LoadingLink
                        href="/products/所有產品?id=0"
                        className="text-decoration-none text-dark productList_breadcrumbLink"
                        onClick={() => setCategoryId([0])}
                      >
                        所有產品
                      </LoadingLink>
                    </li>
                    {breadcrumb &&
                      breadcrumb.length > 0 &&
                      breadcrumb.map((item) => (
                        <li
                          className="breadcrumb-item active text-dark "
                          aria-current="page"
                          key={item.CATEGORY_ID}
                        >
                          <LoadingLink
                            href={`/products/${encodeURIComponent(
                              item.CATEGORY_TITLE
                            )}?id=${item.CATEGORY_ID}`}
                            className="text-decoration-none text-dark productList_breadcrumbLink"
                          >
                            {item.CATEGORY_TITLE}
                          </LoadingLink>
                        </li>
                      ))}
                  </ol>
                </nav>
              </div>
              <div className="col">
                {/* 產品列表表格 */}
                <ProductListTable
                  productList={productList}
                  isLoading={isLoading}
                  categoryTitle={categoryTitle}
                  selectedProducts={selectedProducts}
                  onCheckboxChange={handleCheckboxChange}
                  productImgRefs={productImgRefs}
                />

                {/* 分頁導航 */}
                {totalPages >= 1 && (
                  <nav
                    aria-label="產品分頁"
                    className="d-flex justify-content-center mt-4"
                  >
                    <ul
                      className="pagination pagination-sm flex-wrap d-flex list-unstyled"
                      style={{ gap: "4px" }}
                    >
                      {totalPages == 1 ? (
                        <li className="page-item">
                          顯示1 - {totalItems} / {totalItems}
                        </li>
                      ) : (
                        <li className="page-item">
                          顯示{(currentPage - 1) * itemsPerPage + 1} -
                          {currentPage == totalPages
                            ? totalItems
                            : currentPage * itemsPerPage}
                          / {totalItems}
                        </li>
                      )}

                      {/* 上一頁按鈕 */}
                      <li
                        className={`page-item ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          aria-label="上一頁"
                          style={{ borderRadius: "4px" }}
                        >
                          &laquo;
                        </button>
                      </li>
                      {/* 頁碼按鈕 */}
                      {(() => {
                        const pageNumbers = [];
                        let startPage = Math.max(1, currentPage - 5);
                        let endPage = Math.min(startPage + 9, totalPages);

                        if (endPage - startPage < 9) {
                          startPage = Math.max(1, endPage - 9);
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pageNumbers.push(
                            <li key={i} className={`page-item`}>
                              <button
                                className={`page-link ${
                                  currentPage === i ? "active" : ""
                                }`}
                                onClick={() => handlePageChange(i)}
                                style={{
                                  borderRadius: "4px",
                                  backgroundColor:
                                    currentPage === i ? "#dc3545" : "white",
                                  color: currentPage === i ? "white" : "#000",
                                  border:
                                    currentPage === i
                                      ? "1px solid #dc3545"
                                      : "1px solid #dee2e6",
                                }}
                              >
                                {i}
                              </button>
                            </li>
                          );
                        }
                        return pageNumbers;
                      })()}
                      {/* 下一頁按鈕 */}
                      <li
                        className={`page-item ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          aria-label="下一頁"
                          style={{ borderRadius: "4px" }}
                        >
                          &raquo;
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作欄 */}
      {showBottomBar && (
        <BottomActionBar
          selectedProducts={selectedProducts}
          categoryTitle={categoryTitle}
          memberId={member_id}
          onQuantityChange={handleQuantityChange}
          onAddToCart={handleAddToCart}
          onProductsChange={setSelectedProducts}
        />
      )}
    </>
  );
}
