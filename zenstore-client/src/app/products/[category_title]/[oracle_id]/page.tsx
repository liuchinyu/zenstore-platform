"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import WishlistButton from "@/components/WishlistButton/WishlistButton";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchProductDetail } from "@/store/productSlice";
import { useCart } from "@/hooks/useCart";
import { useProductSEO } from "@/hooks/useProductSEO";
import { ExtendedRootState } from "@/store/store";
import { useDynamicReducer } from "@/hooks/useDynamicReducer";
import { usePrice } from "@/hooks/usePrice";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import ProductSkeleton from "@/components/ProductSkeleton/ProductSkeleton";
import { selectMemberId } from "@/store/selectors/authSelectors";

export default function ProductPage() {
  // === 1. 基礎 Hooks ===
  const params = useParams();
  const dispatch = useAppDispatch();
  const { hideLoading, navigateWithLoading } = useGlobalLoading();
  // === 2. 狀態管理 ===
  const isProductSliceLoaded = useDynamicReducer(
    "products",
    () => import("@/store/productSlice")
  );
  const productsState = useAppSelector((state: ExtendedRootState) =>
    isProductSliceLoaded ? state.products : null
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState<number>(0);
  const productImgRef = useRef<HTMLImageElement>(null);
  const member_id = useAppSelector(selectMemberId);

  // === 3. 數據處理 ===
  const productDetail = productsState?.productDetail || null;
  const loading = productsState?.loading || false;

  const product = useMemo(() => productDetail?.data?.product, [productDetail]);
  const categories = useMemo(
    () => productDetail?.data?.categories,
    [productDetail]
  );
  const images = useMemo(() => productDetail?.data?.images, [productDetail]);
  const prices = useMemo(() => productDetail?.data?.prices, [productDetail]);

  // 分離主圖和細節圖
  const { main_images, detail_images } = useMemo(() => {
    if (!images) {
      return { main_images: [], detail_images: [] };
    }
    return images.reduce(
      (acc: any, image: any) => {
        if (image.IMAGE_TYPE === "main") {
          acc.main_images.push(image);
        } else if (image.IMAGE_TYPE === "detail") {
          acc.detail_images.push(image);
        }
        return acc;
      },
      { main_images: [], detail_images: [] }
    );
  }, [images]);

  // 使用統一的價格計算與顯示 Hook
  const { unitPriceDisplay, totalPriceDisplay } = usePrice(
    prices || [],
    quantity,
    product
  );

  // 商品分類分層
  const { main_category, sub_category, detail_category } = useMemo(() => {
    if (!categories)
      return {
        main_category: undefined,
        sub_category: undefined,
        detail_category: undefined,
      };

    return categories.reduce(
      (acc: any, category: any) => {
        switch (category.CATEGORY_LEVEL) {
          case 1:
            acc.main_category = category;
            break;
          case 2:
            acc.sub_category = category;
            break;
          case 3:
            acc.detail_category = category;
            break;
        }
        return acc;
      },
      {
        main_category: undefined,
        sub_category: undefined,
        detail_category: undefined,
      }
    );
  }, [categories]);

  // === 4. 副作用 (Side Effects) ===
  // 路由變化時獲取產品數據
  useEffect(() => {
    const oracleId = params.oracle_id as string;

    // 只有在 reducer 載入完成後才執行 dispatch
    if (oracleId && isProductSliceLoaded) {
      // 獲取新的產品詳情
      dispatch(fetchProductDetail(oracleId));
    }
  }, [params.oracle_id, dispatch, isProductSliceLoaded]);

  // 初始化數量為最小包裝量
  useEffect(() => {
    if (product?.FIXED_LOT_MULTIPLIER) {
      setQuantity(product.FIXED_LOT_MULTIPLIER);
    }
  }, [product?.FIXED_LOT_MULTIPLIER]);

  // 初始化tooltip
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
  }, [product]); // 當 product 改變時重新初始化

  // 使用 SEO hook - 自動執行 SEO 優化
  useProductSEO({
    product,
    main_images,
    main_category,
    sub_category,
    detail_category,
  });
  // === 5. 事件處理 ===
  // 使用 useCart hook
  const { validateQuantity, handleSingleAddToCart } = useCart();

  // 數量變更處理 - 允許自由輸入，延遲驗證
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    setQuantity(newValue);
  };

  const validateAndUpdateQuantity = (value: string | number) => {
    const newValue = typeof value === "string" ? parseInt(value) || 0 : value;
    const minQuantity = product?.FIXED_LOT_MULTIPLIER || 1;
    // 驗證數量是否符合最小包裝量的倍數
    const validation = validateQuantity(newValue, minQuantity);
    setQuantity(validation.correctedQuantity);
  };

  // 處理 Enter 鍵
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      validateAndUpdateQuantity(e.currentTarget.value);
      e.currentTarget.blur();
    }
  };

  // 處理失去焦點
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validateAndUpdateQuantity(e.target.value);
  };

  // 加入購物車處理 - 使用統一的邏輯
  const handleAddToCart = async () => {
    if (!product) return;

    const cartItem = {
      ORACLE_ID: product.ORACLE_ID,
      ORIGINAL_QUANTITY: quantity,
    };

    const result = await handleSingleAddToCart(
      cartItem,
      productImgRef,
      product.IMAGE_URL
    );

    if (result.success) {
      // 重置數量為最小包裝量
      setQuantity(product.FIXED_LOT_MULTIPLIER);
    }
  };

  // === 6. 渲染邏輯 ===
  // 載入狀態檢查＋資料就緒守門條件
  const oracleIdParam = params.oracle_id as string;
  const isReady = !!product && product.ORACLE_ID === oracleIdParam;

  useEffect(() => {
    if (isReady) {
      hideLoading();
    }
  }, [isReady, hideLoading]);

  if (!isProductSliceLoaded || loading) {
    return <ProductSkeleton></ProductSkeleton>;
  }

  if (!isReady) {
    return (
      <div className="container mt-3">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">查無此商品</h4>
          <button
            className="btn btn-primary"
            onClick={() => navigateWithLoading("/products")}
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="container mt-3">
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">{product?.PRODUCT_ID}</h4>
              </div>
              <div className="row g-0">
                <div className="col-md-5 border-end border-1">
                  <div className="w-100 border-bottom border-1 d-flex align-items-center">
                    <img
                      ref={productImgRef}
                      src={main_images?.[currentImageIndex]?.IMAGE_URL}
                      className="img-fluid rounded-start w-100 px-3 py-5"
                      alt={product?.PRODUCT_ID}
                    />
                  </div>
                  <div className="productDetail_imageContainer d-flex flex-wrap">
                    {main_images &&
                      main_images.length > 0 &&
                      main_images.map((image: any, index: number) => (
                        <img
                          key={image.IMAGE_ID}
                          src={image.IMAGE_URL}
                          className={`img-fluid border-start border-bottom object-fit-contain ${
                            (index + 1) % 3 === 0 ? "" : `border-end`
                          } px-3 productDetail_thumbnail`}
                          style={{ width: "33%" }}
                          alt={product?.PRODUCT_ID}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                  </div>
                </div>
                <div className="col-md-7">
                  <div className="card-body h-100">
                    <table className="table productDetail_table productDetail_font12">
                      <tbody>
                        <tr>
                          <th>零件編號 :</th>
                          <td>{product?.PRODUCT_ID}</td>
                        </tr>
                        <tr>
                          <th>製造商 :</th>
                          <td>{product?.BRAND}</td>
                        </tr>
                        <tr>
                          <th>說明 :</th>
                          <td>{product?.DESCRIPTION}</td>
                        </tr>
                        <tr>
                          <th>規格書 :</th>
                          <td>
                            <a href="" target="_blank">
                              {product?.PRODUCT_ID}-規格書(PDF)
                              <i className="fa-solid fa-file-pdf"></i>
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <th>最小包裝量(MPQ) :</th>
                          <td>{product?.FIXED_LOT_MULTIPLIER}</td>
                        </tr>
                        <tr>
                          <th>單位淨重-克 :</th>
                          <td>{product?.UNIT_WEIGHT}</td>
                        </tr>
                        <tr>
                          <th>包裝 :</th>
                          <td>{product?.PACKAGE_METHOD}</td>
                        </tr>
                        <tr>
                          <th>供貨情況 :</th>
                          <td>{product?.INVENTORY ? "現貨" : "缺貨"}</td>
                        </tr>
                        <tr>
                          <th>當前單價 :</th>
                          <td>
                            <span className="text-success fw-bold">
                              {unitPriceDisplay}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <th>總價 :</th>
                          <td>
                            <span className="text-success fw-bold">
                              {totalPriceDisplay}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="d-flex justify-content-between">
                      <span
                        className=""
                        data-bs-toggle="tooltip"
                        data-bs-title={
                          product?.IS_PUBLISHED === 0 ||
                          product?.INVENTORY < product?.FIXED_LOT_MULTIPLIER
                            ? "商品已下架或庫存不足"
                            : "購買"
                        }
                      >
                        <button
                          className="btn btn-warning text-white fw-bold px-4 me-auto productDetail_font12 productDetail_px1"
                          onClick={handleAddToCart}
                          disabled={
                            product?.IS_PUBLISHED === 0 ||
                            product?.INVENTORY < product?.FIXED_LOT_MULTIPLIER
                          }
                        >
                          加入購物車
                        </button>
                      </span>
                      <WishlistButton
                        oracleId={product?.ORACLE_ID || ""}
                        memberId={member_id}
                        variant="button"
                        className="btn-warning text-white fw-bold px-2 productDetail_font12 productDetail_px1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card mt-4">
              <div className="card-header">
                <h4 className="card-title h5">規格</h4>
              </div>
              <div className="card-body">
                <table className="table">
                  <tbody>
                    <tr>
                      <th style={{ backgroundColor: "#f5f5f5" }}>商品屬性</th>
                      <th style={{ backgroundColor: "#f5f5f5" }}>屬性值</th>
                    </tr>
                    <tr>
                      <th>製造商:</th>
                      <td>{product?.BRAND}</td>
                    </tr>
                    <tr>
                      <th>商品大分類:</th>
                      <td>{main_category?.CATEGORY_TITLE}</td>
                    </tr>
                    <tr>
                      <th>商品中分類:</th>
                      <td>{sub_category?.CATEGORY_TITLE}</td>
                    </tr>
                    <tr>
                      <th>商品小分類:</th>
                      <td>{detail_category?.CATEGORY_TITLE}</td>
                    </tr>
                    <tr>
                      <th>高電壓:</th>
                      <td>{product?.HIGH_VOLTAGE}</td>
                    </tr>
                    <tr>
                      <th>低電壓:</th>
                      <td>{product?.LOW_VOLTAGE}</td>
                    </tr>
                    <tr>
                      <th>高溫度:</th>
                      <td>{product?.HIGH_TEMP}</td>
                    </tr>
                    <tr>
                      <th>低溫度:</th>
                      <td>{product?.LOW_TEMP}</td>
                    </tr>
                    <tr>
                      <th>商品應用:</th>
                      <td>{product?.PRODUCT_APPLICATION}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* 商品詳情圖 */}
            <div className="card mt-2">
              <div className="card-header">商品詳情圖</div>
              <div className="card-body text-center">
                {detail_images &&
                  detail_images.length > 0 &&
                  detail_images.map((image: any, index: number) => (
                    <div key={image.IMAGE_ID}>
                      <img
                        className="img-fluid mb-4"
                        style={{ width: "50%" }}
                        src={detail_images[index].IMAGE_URL}
                        alt={product?.PRODUCT_ID}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mt-md-0 mt-2">
              <div className="card-header fw-bold">
                庫存量:{product?.INVENTORY}
              </div>
              <div className="card-body">
                <table className="table productDetail_table productDetail_font12">
                  <tbody>
                    <tr>
                      <th>庫存 :</th>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {product?.INVENTORY} 可立即送貨
                      </td>
                    </tr>
                    <tr>
                      <th>交期 :</th>
                      <td>
                        {product?.VENDOR_LEAD_TIME}週
                        <button className="btn p-0 ">
                          {/* <i className="fa-solid fa-circle-question mx-1 text-primary"></i> */}
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <th>輸入數量 :</th>
                      <td className="d-flex">
                        <input
                          type="number"
                          className="form-control w-70 rounded-0"
                          min={product?.FIXED_LOT_MULTIPLIER}
                          step={product?.FIXED_LOT_MULTIPLIER}
                          value={quantity}
                          onChange={handleQuantityChange}
                          onKeyDown={handleKeyDown}
                          onBlur={handleBlur}
                        />
                        <span
                          className="d-inline-block"
                          tabIndex={0}
                          data-bs-toggle="tooltip"
                          data-bs-title={
                            product?.IS_PUBLISHED === 0 ||
                            product?.INVENTORY < product?.FIXED_LOT_MULTIPLIER
                              ? "商品已下架或庫存不足"
                              : "購買"
                          }
                        >
                          <button
                            className="btn btn-success rounded-0 productDetail_font12 productDetail_px1"
                            style={{ whiteSpace: "nowrap" }}
                            onClick={handleAddToCart}
                            type="button"
                            disabled={
                              product?.IS_PUBLISHED === 0 ||
                              product?.INVENTORY < product?.FIXED_LOT_MULTIPLIER
                            }
                          >
                            購買
                          </button>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card mt-2">
              <div className="card-header">Pricing(TWD)</div>
              <div className="card-body p-0">
                <table
                  className="table table-hover productDetail_table productDetail_font10"
                  style={{ fontSize: "14px" }}
                >
                  <thead className="text-end">
                    <tr className="table-secondary pe-2">
                      <th>數量</th>
                      <th>單位</th>
                      <th>單價</th>
                      {/* <th>總價</th> */}
                    </tr>
                  </thead>
                  <tbody className="text-end">
                    {prices?.map((price: any) => (
                      <tr key={price.PRICE_ID}>
                        <td>
                          {price.MIN}~{price.MAX}
                        </td>
                        <td>{price.UNIT}</td>
                        <td>${price.PRICE}</td>
                        {/* <td>${price.MIN * price.PRICE}</td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
