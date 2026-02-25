/**
 * 價格計算服務
 * 負責根據商品數量和價格表計算正確的單價
 */

export interface PriceTier {
  PRICE_ID: number;
  ORACLE_ID: string;
  MIN: number;
  MAX: number;
  PRICE: number;
  UNIT: string;
  CURRENCY: string;
  AREA?: string | null;
}

export interface PriceCalculationResult {
  unitPrice: number;
  unit: string;
  currency: string;
  priceId: number;
  tier: PriceTier;
}

class PriceCalculationService {
  /**
   * 根據數量計算對應的價格
   * @param prices 價格表陣列
   * @param quantity 購買數量
   * @returns 價格計算結果
   */
  static calculatePrice(
    prices: PriceTier[],
    quantity: number
  ): PriceCalculationResult | null {
    if (!prices || prices.length === 0) {
      return null;
    }

    // 找到符合數量的價格區間
    const matchingTier = prices.find(
      (price) => quantity >= price.MIN && quantity <= price.MAX
    );

    if (!matchingTier) {
      // 如果沒有找到匹配的區間，使用最低價格（通常是數量最多的區間）
      const lowestPriceTier = prices.reduce((lowest, current) =>
        current.PRICE < lowest.PRICE ? current : lowest
      );

      return {
        unitPrice: lowestPriceTier.PRICE,
        unit: lowestPriceTier.UNIT,
        currency: lowestPriceTier.CURRENCY,
        priceId: lowestPriceTier.PRICE_ID,
        tier: lowestPriceTier,
      };
    }

    return {
      unitPrice: matchingTier.PRICE,
      unit: matchingTier.UNIT,
      currency: matchingTier.CURRENCY,
      priceId: matchingTier.PRICE_ID,
      tier: matchingTier,
    };
  }
}

export default PriceCalculationService;
