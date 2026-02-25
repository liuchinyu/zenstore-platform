"use client";

import { memo, useCallback, useState, useRef } from "react";
import Image from "next/image";
import LoadingLink from "@/components/LoadingLink/LoadingLink";
import { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (oracleId: string, delta: number) => void;
}

const CartItem = memo(({ item, onQuantityChange }: CartItemProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const isEditingRef = useRef<boolean>(false); //輸入狀態判斷

  // 清除編輯狀態
  const clearEditingState = useCallback(() => {
    isEditingRef.current = false;
    setInputValue("");
  }, []);

  // 處理 +/- 按鈕點擊
  const handleButtonClick = useCallback(
    (delta: number) => {
      // 若正在編輯,先清除編輯狀態
      if (isEditingRef.current) {
        clearEditingState();
      }
      onQuantityChange(item.ORACLE_ID, delta);
    },
    [item.ORACLE_ID, onQuantityChange, clearEditingState]
  );

  // 處理輸入變更
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d]/g, "");
      isEditingRef.current = true;
      setInputValue(raw);
    },
    []
  );

  // 處理輸入失焦
  const handleInputBlur = useCallback(() => {
    const currentQty = Number(item.QUANTITY) || 0;
    const raw = inputValue.trim();
    const nextQty = raw === "" ? currentQty : Number(raw) || 0;
    const delta = nextQty - currentQty;

    // 若無變動則僅清除編輯態
    if (delta === 0) {
      clearEditingState();
      return;
    }

    onQuantityChange(item.ORACLE_ID, delta);
    clearEditingState();
  }, [
    item.ORACLE_ID,
    item.QUANTITY,
    inputValue,
    onQuantityChange,
    clearEditingState,
  ]);

  // 處理 Enter 鍵
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        (e.currentTarget as HTMLInputElement).blur();
      }
    },
    []
  );

  // 顯示的數量值
  const displayValue = isEditingRef.current
    ? inputValue
    : String(Number(item.QUANTITY) || 0);

  return (
    <tr className="border-bottom">
      <td style={{ width: "60px" }}>
        <Image
          src={item.IMAGE_URL}
          alt={item.PRODUCT_ID}
          width={50}
          height={50}
          className="object-fit-contain"
        />
      </td>
      <td className="text-start tableFont">
        <div className="fw-bold mb-1">{item.BRAND}</div>
        <div className="mb-1">
          <LoadingLink href={`/products/${item.BRAND}/${item.ORACLE_ID}`}>
            {item.PRODUCT_ID}
          </LoadingLink>
        </div>
        <div
          className="input-group input-group-sm tableFont"
          style={{ width: "120px" }}
        >
          <button
            className="btn btn-outline-secondary d-flex align-items-center"
            type="button"
            onClick={() => handleButtonClick(-item.FIXED_LOT_MULTIPLIER)}
            aria-label="減少數量"
          >
            -
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="form-control text-center border-top border-secondary"
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            aria-label="輸入數量"
            tabIndex={0}
          />
          <button
            className="btn btn-outline-secondary d-flex align-items-center"
            type="button"
            onClick={() => handleButtonClick(item.FIXED_LOT_MULTIPLIER)}
            aria-label="增加數量"
          >
            +
          </button>
        </div>
      </td>
      <td className="text-end fw-bold">
        NT${(item.PRICE * item.QUANTITY).toLocaleString("zh-TW")}
      </td>
    </tr>
  );
});

CartItem.displayName = "CartItem";

export default CartItem;
