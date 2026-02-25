"use client";

import { useEffect, useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import {
  addToWishlist,
  removeFromWishlist,
  fetchWishlist,
} from "@/store/wishlistSlice";
import { useToast } from "@/hooks/useToast";
import CartNav from "@/components/CartNav/CartNav";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import { useCart } from "@/hooks/useCart";
import { useDynamicReducer } from "@/hooks/useDynamicReducer";
import Image from "next/image";
import LoadingLink from "@/components/LoadingLink/LoadingLink";
import {
  selectWishlistProductIds,
  selectWishlistIsInitialized,
  selectWishlistItems,
} from "@/store/selectors/wishlistSelectors";
import { selectItems } from "@/store/selectors/cartSelectors";
import {
  selectMemberId,
  selectIsAuthenticated,
} from "@/store/selectors/authSelectors";
import { fetchCart } from "@/store/cartSlice";

export default function Cart() {
  const isWishlistLoaded = useDynamicReducer(
    "wishlist",
    () => import("@/store/wishlistSlice")
  );
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const member_id = useAppSelector(selectMemberId);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { items: cartItems, count } = useAppSelector(selectItems);

  const [inputValues, setInputValues] = useState<Record<string, string>>({}); //監控直接調整購物車的數量
  const editingIdsRef = useRef<Set<string>>(new Set()); //判斷是否有做變動

  // 使用安全的選擇器來避免 undefined 錯誤
  const wishlistIds = useAppSelector(selectWishlistProductIds);
  const wishlistInitialized = useAppSelector(selectWishlistIsInitialized);
  const wishlistItem = useAppSelector(selectWishlistItems);

  const {
    handleQuantityChange,
    confirmRemoveItem,
    cancelRemoveItem,
    removeItemModalRef,
    currentRemovingItem,
    handleRemoveFromCart,
    totalPrice,
  } = useCart();

  // 處理收藏按鈕點擊
  const handleWishlistToggle = async (oracleId: string) => {
    if (!isAuthenticated) {
      showToast("請先登入", "warning");
      return;
    }

    if (!member_id) {
      showToast("會員資訊錯誤", "error");
      return;
    }

    try {
      const isInWishlist = wishlistIds.includes(oracleId);
      if (isInWishlist) {
        // 從收藏清單中移除
        const wishlistItemExist = wishlistItem.find(
          (item: any) => item.ORACLE_ID === oracleId
        );

        if (wishlistItemExist?.WISHLIST_ID) {
          await dispatch(
            removeFromWishlist({
              wishlist_id: wishlistItemExist.WISHLIST_ID,
              member_id,
            })
          );
          showToast("已從收藏清單中移除", "success");
        }
      } else {
        // 加入收藏清單
        await dispatch(
          addToWishlist({ member_id: member_id, oracle_id: oracleId })
        );
        showToast("已加入收藏清單", "success");
      }
    } catch (error) {
      console.error("收藏操作失敗:", error);
      showToast("操作失敗，請稍後再試", "error");
    }
  };

  // 設定登入後確認庫存是否足夠
  useEffect(() => {
    const initCart = async () => {
      if (member_id) {
        try {
          const fetchCartPromise = await dispatch(
            fetchCart(member_id)
          ).unwrap();
          if (fetchCartPromise.overValueMessage) {
            showToast(fetchCartPromise.overValueMessage, "info");
          }
        } catch (error) {
          console.error("Failed to fetch cart:", error);
        }
      }
    };
    initCart();
    const interval = setInterval(async () => initCart(), 1000 * 60 * 5); // 每 5 分鐘確認庫存是否足夠
    return () => clearInterval(interval);
  }, [member_id, dispatch]);

  // 僅負責初始化抓取收藏清單（增加初始化檢查防止重複抓取）
  useEffect(() => {
    if (
      isAuthenticated &&
      member_id &&
      isWishlistLoaded &&
      !wishlistInitialized
    ) {
      dispatch(fetchWishlist(member_id));
    }
  }, [
    isAuthenticated,
    member_id,
    isWishlistLoaded,
    wishlistInitialized,
    dispatch,
  ]);

  return (
    <>
      <CartNav color="step-1" />
      <div className="container-fluid mt-4 ps-4">
        <div className="row">
          {/* 桌面版：商品列表在左側 */}
          <div className="col-lg-8 col-md-12 order-lg-1 order-2">
            {cartItems && (
              <>
                {/* 桌面版表格 */}
                <div className="d-none d-lg-block">
                  <table className="table">
                    <thead className="text-center table-secondary">
                      <tr>
                        <th className="text-start">商品名稱</th>
                        <th style={{ width: "50px" }}>數量</th>
                        <th>單價</th>
                        <th>小計</th>
                        <th style={{ width: "120px" }}>加入收藏清單</th>
                        <th style={{ width: "50px" }}>移除</th>
                      </tr>
                    </thead>
                    <tbody className="align-middle">
                      {Object.values(cartItems).map((item: any) => (
                        <tr key={item.ORACLE_ID} className="text-center">
                          {/* 桌面版商品行內容 */}
                          <td className="text-start">
                            <div className="d-flex align-items-center">
                              <div>
                                <LoadingLink
                                  href={`/products/${item.BRAND}/${item.ORACLE_ID}`}
                                >
                                  <Image
                                    src={item.IMAGE_URL}
                                    alt={item.PRODUCT_ID}
                                    width={75}
                                    height={75}
                                    className="object-fit-contain"
                                  />
                                </LoadingLink>
                              </div>
                              <div className="ms-4">
                                <span>{item.BRAND}</span>
                                <h6>
                                  <LoadingLink
                                    href={`/products/${item.BRAND}/${item.ORACLE_ID}`}
                                    className="text-decoration-underline"
                                  >
                                    {item.PRODUCT_ID}
                                  </LoadingLink>
                                </h6>
                                <small>{`最小包裝量 : ${item.FIXED_LOT_MULTIPLIER} pcs`}</small>
                              </div>
                            </div>
                          </td>
                          {/* 其他桌面版欄位... */}
                          <td>
                            <div
                              className="input-group input-group-sm"
                              style={{ width: "120px" }}
                            >
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => {
                                  const oracleId = item.ORACLE_ID;
                                  // 若正在編輯，先清除編輯狀態與暫存值，改以 Redux 值為主
                                  if (editingIdsRef.current.has(oracleId)) {
                                    editingIdsRef.current.delete(oracleId);
                                    setInputValues((prev) => {
                                      const next = { ...prev };
                                      delete next[oracleId];
                                      return next;
                                    });
                                  }
                                  handleQuantityChange(
                                    oracleId,
                                    -item.FIXED_LOT_MULTIPLIER
                                  );
                                }}
                                aria-label="減少數量"
                              >
                                -
                              </button>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="form-control text-center border-top border-secondary"
                                value={
                                  editingIdsRef.current.has(item.ORACLE_ID)
                                    ? inputValues[item.ORACLE_ID] ?? ""
                                    : String(Number(item.QUANTITY) || 0)
                                }
                                onChange={(e) => {
                                  const oracleId = item.ORACLE_ID;
                                  // 僅允許數字，允許空字串以便使用者輸入中
                                  const raw = e.target.value.replace(
                                    /[^\d]/g,
                                    ""
                                  );
                                  editingIdsRef.current.add(oracleId);
                                  setInputValues((prev) => ({
                                    ...prev,
                                    [oracleId]: raw,
                                  }));
                                }}
                                onBlur={(e) => {
                                  const oracleId = item.ORACLE_ID;
                                  const currentQty = Number(item.QUANTITY) || 0;
                                  const raw = (
                                    inputValues[oracleId] ?? ""
                                  ).trim();
                                  const nextQty =
                                    raw === "" ? currentQty : Number(raw) || 0;
                                  const delta = nextQty - currentQty;

                                  // 若無變動則僅清除編輯態
                                  if (delta === 0) {
                                    editingIdsRef.current.delete(oracleId);
                                    setInputValues((prev) => {
                                      const next = { ...prev };
                                      delete next[oracleId];
                                      return next;
                                    });
                                    return;
                                  }

                                  handleQuantityChange(oracleId, delta);

                                  // 提交後清理本地暫存，交由 Redux 回寫
                                  editingIdsRef.current.delete(oracleId);
                                  setInputValues((prev) => {
                                    const next = { ...prev };
                                    delete next[oracleId];
                                    return next;
                                  });
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    (
                                      e.currentTarget as HTMLInputElement
                                    ).blur();
                                  }
                                }}
                              />
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => {
                                  const oracleId = item.ORACLE_ID;
                                  // 若正在編輯，先清除編輯狀態與暫存值，改以 Redux 值為主
                                  if (editingIdsRef.current.has(oracleId)) {
                                    editingIdsRef.current.delete(oracleId);
                                    setInputValues((prev) => {
                                      const next = { ...prev };
                                      delete next[oracleId];
                                      return next;
                                    });
                                  }
                                  handleQuantityChange(
                                    oracleId,
                                    item.FIXED_LOT_MULTIPLIER
                                  );
                                }}
                                aria-label="增加數量"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="text-end">
                            NT$
                            {item.PRICE.toLocaleString("zh-TW")}
                          </td>
                          <td className="text-end">
                            NT$
                            {(item.QUANTITY * item.PRICE).toLocaleString(
                              "zh-TW"
                            )}
                          </td>
                          <td>
                            <div className="d-flex justify-content-center">
                              <button
                                className={`btn border-0 m-0 p-0 cartIcon`}
                                onClick={() =>
                                  handleWishlistToggle(item.ORACLE_ID)
                                }
                                title={
                                  wishlistIds.includes(item.ORACLE_ID)
                                    ? "從收藏清單中移除"
                                    : "加入收藏清單"
                                }
                              >
                                <i
                                  className={`fa-${
                                    wishlistIds.includes(item.ORACLE_ID)
                                      ? "solid"
                                      : "regular"
                                  } fa-heart p-2 collection`}
                                  style={{ color: "#ff943d" }}
                                ></i>
                              </button>
                            </div>
                          </td>
                          <td>
                            <button
                              className={`btn border-0 m-0 p-0 cartIcon`}
                              onClick={() => {
                                handleRemoveFromCart(item.ORACLE_ID);
                              }}
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 手機版卡片式布局 */}
                <div className="d-lg-none">
                  {Object.values(cartItems).map((item: any) => (
                    <div
                      key={item.ORACLE_ID}
                      className="cart-mobile-item mb-3 p-3 border rounded"
                    >
                      <div className="row">
                        <div className="col-4">
                          <LoadingLink
                            href={`/products/${item.BRAND}/${item.ORACLE_ID}`}
                          >
                            <Image
                              src={item.IMAGE_URL}
                              alt={item.PRODUCT_ID}
                              width={100}
                              height={100}
                              className="object-fit-contain w-100"
                            />
                          </LoadingLink>
                        </div>
                        <div className="col-8">
                          <div className="mb-2">
                            <span className="text-muted">{item.BRAND}</span>
                            <h6 className="mb-1">
                              <LoadingLink
                                href={`/products/${item.BRAND}/${item.ORACLE_ID}`}
                                className="text-decoration-underline"
                              >
                                {item.PRODUCT_ID}
                              </LoadingLink>
                            </h6>
                            <small className="text-muted">{`最小包裝量 : ${item.FIXED_LOT_MULTIPLIER} pcs`}</small>
                          </div>
                          <div className="d-flex justify-content-end mt-2">
                            <button
                              className={`btn border-0 me-2 cartIcon`}
                              onClick={() =>
                                handleWishlistToggle(item.ORACLE_ID)
                              }
                              title={
                                wishlistIds.includes(item.ORACLE_ID)
                                  ? "從收藏清單中移除"
                                  : "加入收藏清單"
                              }
                            >
                              <i
                                className={`fa-${
                                  wishlistIds.includes(item.ORACLE_ID)
                                    ? "solid"
                                    : "regular"
                                } fa-heart p-2 collection`}
                                style={{ color: "#ff943d" }}
                              ></i>
                            </button>
                            <button
                              className={`btn border-0 cartIcon`}
                              onClick={() =>
                                handleRemoveFromCart(item.ORACLE_ID)
                              }
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="input-group input-group-sm">
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={() => {
                                const oracleId = item.ORACLE_ID;
                                // 若正在編輯，先清除編輯狀態與暫存值，改以 Redux 值為主
                                if (editingIdsRef.current.has(oracleId)) {
                                  editingIdsRef.current.delete(oracleId);
                                  setInputValues((prev) => {
                                    const next = { ...prev };
                                    delete next[oracleId];
                                    return next;
                                  });
                                }
                                handleQuantityChange(
                                  oracleId,
                                  -item.FIXED_LOT_MULTIPLIER
                                );
                              }}
                              aria-label="減少數量"
                            >
                              -
                            </button>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              className="form-control text-center"
                              value={
                                editingIdsRef.current.has(item.ORACLE_ID)
                                  ? inputValues[item.ORACLE_ID] ?? ""
                                  : String(Number(item.QUANTITY) || 0)
                              }
                              onChange={(e) => {
                                const oracleId = item.ORACLE_ID;
                                // 僅允許數字，允許空字串以便使用者輸入中
                                const raw = e.target.value.replace(
                                  /[^\d]/g,
                                  ""
                                );
                                editingIdsRef.current.add(oracleId);
                                setInputValues((prev) => ({
                                  ...prev,
                                  [oracleId]: raw,
                                }));
                              }}
                              onBlur={(e) => {
                                const oracleId = item.ORACLE_ID;
                                const currentQty = Number(item.QUANTITY) || 0;
                                const raw = (
                                  inputValues[oracleId] ?? ""
                                ).trim();
                                const nextQty =
                                  raw === "" ? currentQty : Number(raw) || 0;
                                const delta = nextQty - currentQty;

                                // 若無變動則僅清除編輯態
                                if (delta === 0) {
                                  editingIdsRef.current.delete(oracleId);
                                  setInputValues((prev) => {
                                    const next = { ...prev };
                                    delete next[oracleId];
                                    return next;
                                  });
                                  return;
                                }

                                handleQuantityChange(oracleId, delta);

                                // 提交後清理本地暫存，交由 Redux 回寫
                                editingIdsRef.current.delete(oracleId);
                                setInputValues((prev) => {
                                  const next = { ...prev };
                                  delete next[oracleId];
                                  return next;
                                });
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  (e.currentTarget as HTMLInputElement).blur();
                                }
                              }}
                            />
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={() => {
                                const oracleId = item.ORACLE_ID;
                                // 若正在編輯，先清除編輯狀態與暫存值，改以 Redux 值為主
                                if (editingIdsRef.current.has(oracleId)) {
                                  editingIdsRef.current.delete(oracleId);
                                  setInputValues((prev) => {
                                    const next = { ...prev };
                                    delete next[oracleId];
                                    return next;
                                  });
                                }
                                handleQuantityChange(
                                  oracleId,
                                  item.FIXED_LOT_MULTIPLIER
                                );
                              }}
                              aria-label="增加數量"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="col-6 text-end">
                          <div className="mb-1">
                            <small className="text-muted">
                              單價: NT$
                              {item.PRICE.toLocaleString("zh-TW")}
                            </small>
                          </div>
                          <div className="fw-bold">
                            小計: NT$
                            {(item.QUANTITY * item.PRICE).toLocaleString(
                              "zh-TW"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 訂單摘要 - 桌面版在右側，手機版在頂部 */}
          <div className="col-lg-4 col-md-12 order-lg-2 order-1 mb-4">
            <div className="cart_orderSummary">
              <span className="d-block">
                已選購
                <small className="text-danger">{count}</small>
                件商品
              </span>
              <p className="mt-3">{`商品總計 : NT$${totalPrice.toLocaleString(
                "zh-TW"
              )}`}</p>
              <p>{`運費 : NT$100`}</p>
              <hr />
              <h3>{`總計 : NT$${(totalPrice + 100).toLocaleString(
                "zh-TW"
              )}`}</h3>
              <div className="d-flex mt-5 justify-content-around">
                <LoadingLink
                  href={`/products/0`}
                  className={`btn rounded-3 text-white fw-bold cart_orderButton`}
                >
                  繼續購物
                </LoadingLink>
                <LoadingLink
                  href={"/checkout"}
                  className={`btn rounded-3 text-white fw-bold ms-auto cart_orderButton`}
                >
                  結帳
                </LoadingLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 確認刪除的 Modal */}
      <ConfirmModal
        ref={removeItemModalRef}
        title="確認移除商品"
        message={
          currentRemovingItem && cartItems[currentRemovingItem]
            ? `確定要從購物車中移除「${cartItems[currentRemovingItem].ORACLE_ID}」商品嗎？`
            : "確定要從購物車中移除商品嗎？"
        }
        onConfirm={confirmRemoveItem}
        onClose={cancelRemoveItem}
      />
    </>
  );
}
