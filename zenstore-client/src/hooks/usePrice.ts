import { useMemo } from "react";
import PriceCalculationService, {
  PriceTier,
  PriceCalculationResult,
} from "@/services/priceCalculationService";

interface Product {
  PRICE?: number;
}

/**
 * 統一的價格計算與顯示 Hook
 * 整合價格計算邏輯和顯示格式化功能
 *
 * @param prices - 價格階梯陣列
 * @param quantity - 購買數量
 * @param product - 商品資訊（用於回退價格）
 * @returns 價格計算結果和格式化顯示
 */
export const usePrice = (
  prices: PriceTier[],
  quantity: number,
  product?: Product
) => {
  // === 價格計算邏輯 ===

  // 取得符合數量的價格區間
  const priceResult = useMemo((): PriceCalculationResult | null => {
    if (!prices || prices.length === 0 || quantity <= 0) {
      return null;
    }

    return PriceCalculationService.calculatePrice(prices, quantity);
  }, [prices, quantity]);

  // 計算總價
  const totalPrice = useMemo(() => {
    if (!priceResult) return 0;
    return priceResult.unitPrice * quantity;
  }, [priceResult, quantity]);

  // === 價格顯示格式化 ===

  // 格式化單價顯示
  const unitPriceDisplay = useMemo(() => {
    if (priceResult && priceResult.unitPrice > 0) {
      return `$${priceResult.unitPrice.toLocaleString("zh-TW")} ${
        priceResult.currency
      }/${priceResult.unit}`;
    }

    // 回退到商品基礎價格
    const basePrice = product?.PRICE || 0;
    return `$${basePrice.toLocaleString("zh-TW")} NTD`;
  }, [priceResult, product?.PRICE]);

  // 格式化總價顯示
  const totalPriceDisplay = useMemo(() => {
    if (totalPrice > 0 && priceResult) {
      return `$${totalPrice.toLocaleString("zh-TW")} ${priceResult.currency}`;
    }

    // 回退到商品基礎價格 × 數量
    const basePrice = product?.PRICE || 0;
    const calculatedTotal = quantity * basePrice;
    return `$${calculatedTotal.toLocaleString("zh-TW")} NTD`;
  }, [totalPrice, priceResult, quantity, product?.PRICE]);

  // 格式化單一價格(通用)
  const formatPrice = useMemo(
    () =>
      (price: number, currencyCode: string = "NTD") => {
        return `$${price.toLocaleString("zh-TW")} ${currencyCode}`;
      },
    []
  );

  return {
    unitPriceDisplay,
    totalPriceDisplay,
    formatPrice,
  };
};

export default usePrice;
