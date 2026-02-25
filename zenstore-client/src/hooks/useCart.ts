import { useState, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  removeFromCart,
  setAnimatingItems,
  toggleCartModal,
  addToCartAsync,
  addToGuestCartAsync,
  addBatchToCartAsync,
} from "@/store/cartSlice";
import CartService from "@/services/cartService";
import { ConfirmModalRef } from "@/components/ConfirmModal/ConfirmModal";
import { useToast } from "@/hooks/useToast";
import { AddToCartRequest } from "@/types";
import { PriceTier } from "@/services/priceCalculationService";
import { selectMemberId } from "@/store/selectors/authSelectors";

// 定義批量選中產品的類型
export interface SelectedProduct {
  oracle_id: string;
  product_id: string;
  quantity: number;
  quantity_change: number;
  image_url: string;
  description: string;
  category_title: string;
  price: number;
  inventory: number;
  brand: string;
  prices?: PriceTier[]; // 新增：價格表
}

export function useCart() {
  // === 1. 基礎 Hooks ===
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  // === 2. 狀態管理 ===
  const cartItems = useAppSelector((state) => state.cart?.items || {});
  const isAuthenticated = useAppSelector(
    (state) => state.auth?.isAuthenticated
  );
  const member_id = useAppSelector(selectMemberId);
  const removeItemModalRef = useRef<ConfirmModalRef>(null);
  const [currentRemovingItem, setCurrentRemovingItem] = useState<string | null>(
    null
  );

  // === 3. 事件處理 ===

  // 透過DB取得動態價格並更新redux
  const updateQuantity = useCallback(
    // quantityChange 為「本次異動量（delta）」
    async (
      oracleId: string,
      original_quantity: number,
      quantityChange: number
    ) => {
      const cartItem = {
        ORACLE_ID: oracleId,
        ORIGINAL_QUANTITY: original_quantity,
        NEW_QUANTITY: quantityChange,
      };
      // 已登入同步到後端
      if (isAuthenticated) {
        const res = await dispatch(
          addToCartAsync({
            cartItem,
            member_id,
          })
        ).unwrap();
        return res;
      } else {
        const res = await dispatch(addToGuestCartAsync(cartItem)).unwrap();
        return res;
      }
    },
    [dispatch, isAuthenticated, member_id]
  );
  // 判斷是否輸入數量為最小包裝量的倍數
  const getCorrectedQuantity = useCallback(
    (oracleID: string, raw: number) => {
      const min = cartItems[oracleID].FIXED_LOT_MULTIPLIER;
      if (raw === 0) return 0;
      if (raw % min === 0) return raw;
      showToast("請輸入最小包裝量的倍數", "warning");
      const base = Math.floor(raw / min) * min;
      return Math.max(min, base);
    },
    [cartItems]
  );

  const handleQuantityChange = useCallback(
    async (
      oracleID: string,
      quantity: number // delta
    ): Promise<number | undefined> => {
      if (quantity === 0) {
        // 跳出是否刪除品項的視窗
        setCurrentRemovingItem(oracleID);
        removeItemModalRef.current?.open();
        return 0;
      }
      const currentQty = Number(cartItems[oracleID].QUANTITY) || 0;
      // 數量 <=0 跳出是否移除商品視窗
      if (currentQty + quantity <= 0) {
        setCurrentRemovingItem(oracleID);
        removeItemModalRef.current?.open();
        return 0;
      }

      // 預期（使用者希望）的下一個數量
      const intendedNextQty = currentQty + quantity;

      try {
        const res = await updateQuantity(
          oracleID,
          cartItems[oracleID].QUANTITY,
          quantity
        );
        if (res.success && res.overValueMessage) {
          // 加入購物車錯誤
          showToast(res.overValueMessage, "error");
        } else if (res.success) {
          // 後端會將購買數量轉換成符合最小包裝量的倍數，若轉換結果跟使用者輸入的數量不同，呈現提示訊息
          const updatedItem = Array.isArray(res.data)
            ? res.data.find((i: any) => i.ORACLE_ID === oracleID)
            : undefined;
          const backendAppliedQty =
            typeof updatedItem?.QUANTITY === "number"
              ? updatedItem.QUANTITY
              : currentQty;
          if (backendAppliedQty !== intendedNextQty) {
            showToast("請輸入最小包裝量的倍數", "warning");
          }
        } else {
          showToast("更新數量失敗，請稍後再試", "error");
        }
      } catch (err) {
        console.error("更新數量失敗:", err);
        showToast("更新數量失敗，請稍後再試", "error");
      }
    },
    [cartItems, updateQuantity, setCurrentRemovingItem, showToast]
  );

  // 確認移除商品
  const confirmRemoveItem = useCallback(() => {
    if (currentRemovingItem) {
      dispatch(removeFromCart(currentRemovingItem));
      const updatedCartItems = { ...cartItems };
      delete updatedCartItems[currentRemovingItem];
      setCurrentRemovingItem(null);

      // 如果用戶已登入，同步到後端
      if (isAuthenticated) {
        CartService.deleteUserCartById(
          member_id,
          cartItems[currentRemovingItem].ORACLE_ID
        );
      }
    }
  }, [currentRemovingItem, cartItems, dispatch, isAuthenticated, member_id]);

  // 取消移除商品
  const cancelRemoveItem = useCallback(() => {
    if (currentRemovingItem) {
      const updateCartItems = { ...cartItems };
      if (cartItems[currentRemovingItem].QUANTITY == 0) {
        updateCartItems[currentRemovingItem] = {
          ...updateCartItems[currentRemovingItem],
          QUANTITY: updateCartItems[currentRemovingItem].QUANTITY,
        };
      } else {
        updateCartItems[currentRemovingItem] = {
          ...updateCartItems[currentRemovingItem],
          QUANTITY: updateCartItems[currentRemovingItem].QUANTITY,
        };
      }
      setCurrentRemovingItem(null);
    }
  }, [currentRemovingItem, cartItems, dispatch]);

  // 手動觸發移除流程
  const handleRemoveFromCart = useCallback((productId: string) => {
    setCurrentRemovingItem(productId);
    removeItemModalRef.current?.open();
  }, []);

  // 本地商品數量驗證（不涉及 Redux state）
  const validateQuantity = useCallback(
    (quantity: number, minQuantity: number) => {
      // 如果不能整除，則提示用戶輸入最小包裝量的倍數
      if (quantity % minQuantity !== 0) {
        const minQuotient = Math.floor(quantity / minQuantity);
        // 使用 setTimeout 分離狀態更新和 Toast 顯示，避免阻塞
        setTimeout(() => {
          showToast("請輸入最小包裝量的倍數", "warning");
        }, 0);
        return {
          isValid: false,
          correctedQuantity:
            minQuantity * (minQuotient !== 0 ? minQuotient : 1),
        };
      }
      return { isValid: true, correctedQuantity: quantity };
    },
    [showToast]
  );

  // 批量加入購物車功能
  const handleBatchAddToCart = useCallback(
    async (
      selectedProducts: { [key: string]: SelectedProduct },
      productImgRefs: React.RefObject<{
        [key: string]: HTMLImageElement | null;
      }>
    ) => {
      try {
        const newAnimatingItems: {
          id: string;
          left: number;
          top: number;
          image_url: string;
        }[] = [];

        let itemsMap = [];
        const quantityMap: { [key: string]: number } = {};
        // 先將購物車中現有的商品數量加入物件
        Object.keys(cartItems).forEach((oracle_id) => {
          quantityMap[oracle_id] = cartItems[oracle_id].QUANTITY;
        });

        // 物件解構，處理批次加入購物車的商品
        for (const productId in selectedProducts) {
          const item = selectedProducts[productId];
          // 若庫存小於最小包裝量則跳過該商品
          if (item.inventory < item.quantity) continue;
          // 創建動畫元素
          const imgRef = productImgRefs.current[item.oracle_id];
          if (imgRef) {
            const rect = imgRef.getBoundingClientRect();
            newAnimatingItems.push({
              id: item.oracle_id,
              left: rect.left + rect.width / 2,
              top: rect.top + rect.height / 2,
              image_url: item.image_url,
            });
          }
          //若商品本來已存在於購物車，就將兩者數量相加
          quantityMap[productId] =
            (quantityMap[productId] || 0) + item.quantity_change;
        }
        itemsMap = Object.keys(quantityMap).map((oracle_id) => ({
          ORACLE_ID: oracle_id,
          ORIGINAL_QUANTITY: quantityMap[oracle_id],
        }));

        // 設置動畫和購物車總價
        dispatch(setAnimatingItems(newAnimatingItems));
        // 延遲顯示購物車 modal
        setTimeout(() => {
          dispatch(toggleCartModal());
        }, 800);

        // 如果用戶已登入，同步到後端
        if (isAuthenticated) {
          const result = await dispatch(
            addBatchToCartAsync({
              member_id,
              items: itemsMap,
            })
          ).unwrap();
          if (result?.overValueMessage) {
            showToast(result?.overValueMessage, "info");
          }

          if (!result?.success) showToast("系統異常請稍後再試", "error");
        }
        // 訪客取得購物車資訊
        else {
          const result = await dispatch(
            addBatchToCartAsync({
              items: itemsMap,
            })
          ).unwrap();

          if (result?.overValueMessage) {
            showToast(result?.overValueMessage, "info");
          }

          if (!result?.success) showToast("系統異常請稍後再試", "error");
        }
      } catch (error) {
        console.error("批量加入購物車失敗:", error);
        showToast("加入購物車失敗，請稍後再試", "error");
        return { success: false, error };
      }
    },
    [cartItems, dispatch, isAuthenticated, member_id, showToast]
  );

  // 單個商品加入購物車功能
  const handleSingleAddToCart = useCallback(
    async (
      cartItem: AddToCartRequest,
      productImgRef: React.RefObject<HTMLImageElement | null>,
      image_url: string
    ) => {
      try {
        let finalCartItem = { ...cartItem };
        let isError = false;

        // 創建動畫元素
        if (productImgRef.current) {
          const rect = productImgRef.current.getBoundingClientRect();
          const animatingItems = [
            {
              id: finalCartItem.ORACLE_ID,
              left: rect.left + rect.width / 2,
              top: rect.top + rect.height / 2,
              image_url: image_url,
            },
          ];
          dispatch(setAnimatingItems(animatingItems));
          // 延遲顯示購物車 modal
          setTimeout(() => {
            dispatch(toggleCartModal());
          }, 800);
        }
        // 如果用戶已登入，同步到後端
        if (isAuthenticated) {
          const resultAction = await dispatch(
            addToCartAsync({ member_id, cartItem })
          ).unwrap();
          if (resultAction?.overValueMessage) {
            showToast(resultAction?.overValueMessage, "info");
          } else if (resultAction?.success) {
            showToast("已加入購物車", "success");
          } else {
            showToast("系統異常請稍後再試", "error");
            isError = true;
          }
        } else {
          // 訪客取得購物車資料
          const resultAction = await dispatch(
            addToGuestCartAsync(cartItem)
          ).unwrap();
          if (resultAction?.overValueMessage) {
            showToast(resultAction?.overValueMessage, "info");
          } else if (resultAction?.success) {
            showToast("已加入購物車", "success");
          } else {
            showToast("系統異常請稍後再試", "error");
            isError = true;
          }
        }
        return !isError ? { success: true } : { success: false };
      } catch (error) {
        console.error("單個商品加入購物車失敗:", error);
        showToast("加入購物車失敗，請稍後再試", "error");
        return { success: false, error };
      }
    },
    [cartItems, dispatch, isAuthenticated, member_id, showToast]
  );

  // 計算總價
  const totalPrice = Object.values(cartItems).reduce((total, item) => {
    return total + item.QUANTITY * item.PRICE;
  }, 0);

  return {
    // 數量調整相關
    handleQuantityChange,
    getCorrectedQuantity,

    // 移除商品相關
    handleRemoveFromCart,
    confirmRemoveItem,
    cancelRemoveItem,
    removeItemModalRef,
    currentRemovingItem,
    setCurrentRemovingItem,

    // 購物車資訊
    totalPrice,
    cartItems,

    // 狀態
    isAuthenticated,
    member_id,

    // 新增功能
    handleBatchAddToCart,
    handleSingleAddToCart,
    validateQuantity,
  };
}
