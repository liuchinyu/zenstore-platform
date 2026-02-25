"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { toggleCartModal, clearAnimatingItems } from "@/store/cartSlice";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useCart } from "@/hooks/useCart";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import { useIsMobile } from "@/hooks/useIsMobile";
import LoadingLink from "@/components/LoadingLink/LoadingLink";
import { useDynamicReducer } from "@/hooks/useDynamicReducer";
import {
  selectItems,
  selectShowCartModal,
  selectAnimatingItems,
} from "@/store/selectors/cartSelectors";
import CartItem from "./CartItem";

// 定義動畫項目的型別
interface AnimatingItem {
  id: string;
  left: number;
  top: number;
  image_url: string;
}

const CartModal = () => {
  const dispatch = useAppDispatch();

  // 從selector取得資料
  const { items: cartItems } = useAppSelector(selectItems);
  const showCartModal = useAppSelector(selectShowCartModal);
  const animatingItems = useAppSelector(selectAnimatingItems);
  const isMobile = useIsMobile();

  // 本地管理動畫元素,因為動畫完成後需要移除元素
  const [localAnimatingItems, setLocalAnimatingItems] = useState<
    AnimatingItem[]
  >([]);

  // 手機版滑入動畫狀態
  const [isSlidingIn, setIsSlidingIn] = useState(false);

  // 商品動態載入
  const isProductsLoaded = useDynamicReducer(
    "products",
    () => import("@/store/productSlice"),
  );

  // 使用自定義 hook 來管理購物車數量變更
  const {
    handleQuantityChange,
    confirmRemoveItem,
    cancelRemoveItem,
    removeItemModalRef,
    currentRemovingItem,
    totalPrice,
  } = useCart();

  // 監聽 Redux 中的 animatingItems 變化
  useEffect(() => {
    if (animatingItems && animatingItems.length > 0) {
      setLocalAnimatingItems(animatingItems);

      // 設置動畫結束後清除本地動畫元素並高亮購物車徽章
      const timer = setTimeout(() => {
        setLocalAnimatingItems([]);
        // 清除 Redux 中的動畫項目,防止頁面切換時重新觸發動畫
        dispatch(clearAnimatingItems());
      }, 800); // 動畫持續時間

      return () => clearTimeout(timer);
    }
  }, [animatingItems, dispatch]);

  // 手機版滑入動畫控制
  useEffect(() => {
    if (showCartModal && isMobile) {
      // 延遲觸發滑入動畫,確保 DOM 已更新
      const timer = setTimeout(() => {
        setIsSlidingIn(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsSlidingIn(false);
    }
  }, [showCartModal, isMobile]);

  // 頁面卸載或組件卸載時,確保清除動畫項目(防禦性設計)
  useEffect(() => {
    return () => {
      dispatch(clearAnimatingItems());
    };
  }, [dispatch]);

  // 關閉購物車彈出視窗
  const handleCloseCartModal = useCallback(() => {
    if (isMobile) {
      // 手機版先觸發滑出動畫
      setIsSlidingIn(false);
      // 等待動畫完成後關閉 modal
      setTimeout(() => {
        dispatch(toggleCartModal());
      }, 300);
    } else {
      dispatch(toggleCartModal());
    }
  }, [isMobile, dispatch]);

  // 繼續購物 - 只關閉模態框
  const handleContinueShopping = useCallback(() => {
    dispatch(toggleCartModal());
  }, [dispatch]);

  // 將 cartItems 轉換為陣列以便渲染
  const cartItemsArray = useMemo(
    () => (cartItems ? Object.values(cartItems) : []),
    [cartItems],
  );

  // 沒有開啟modal，且沒有動畫元素，則不顯示
  if (!showCartModal && localAnimatingItems.length === 0) {
    return null;
  }

  return (
    <>
      {/* 飛向購物車的動畫元素 */}
      {localAnimatingItems.map((item) => (
        <div
          key={item.id}
          className="flyingItem"
          style={{
            left: item.left,
            top: item.top,
            width: "100px",
            height: "100px",
            backgroundImage: `url(${item.image_url})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      ))}

      {showCartModal && (
        <div className="cartModalOverlay" onClick={handleCloseCartModal}>
          <div
            className={`cartModal ${isMobile && isSlidingIn ? "slide-in" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modalHeader">
              <h5 className="mb-0 fw-bold">已成功加入購物車</h5>
              <button
                className="closeButton"
                onClick={handleCloseCartModal}
                aria-label="關閉"
              >
                ×
              </button>
            </div>

            <div className="mt-3">
              <table
                className="table table-borderless"
                style={{ marginTop: "-10px" }}
              >
                <tbody>
                  {cartItemsArray.map((item: any) => (
                    <CartItem
                      key={item.ORACLE_ID}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} className="text-end fw-bold">
                      總計:
                    </td>
                    <td className="text-end fw-bold text-danger">
                      NT${totalPrice.toLocaleString("zh-TW")}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="d-flex justify-content-between mt-3">
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleContinueShopping}
                >
                  繼續購物
                </button>

                <LoadingLink
                  href="/cart"
                  className="btn btn-danger text-decoration-none text-white d-flex align-items-center justify-content-center"
                  onClick={() => dispatch(toggleCartModal())}
                >
                  瀏覽購物車
                </LoadingLink>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 確認刪除的 Modal */}
      <ConfirmModal
        ref={removeItemModalRef}
        title="確認移除商品"
        message={
          currentRemovingItem && cartItems[currentRemovingItem]
            ? `確定要從購物車中移除「${cartItems[currentRemovingItem].PRODUCT_ID}」商品嗎?`
            : "確定要從購物車中移除商品嗎?"
        }
        onConfirm={confirmRemoveItem}
        onClose={cancelRemoveItem}
      />
    </>
  );
};

export default CartModal;
