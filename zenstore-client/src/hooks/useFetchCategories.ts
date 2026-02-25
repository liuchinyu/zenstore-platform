// 將API取得的分類區分為產品、製造商
import { useCallback } from "react";
import ProductService from "@/services/productService";

export const useFetchCategories = () => {
  // 為使用useCallback，將fetchCategories包裝起來
  const fetchCategories = useCallback(async () => {
    try {
      const response = await ProductService.getCategories();
      const productCategories = response?.product;

      const manufactureCategories = response?.manufacture;

      return { productCategories, manufactureCategories };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { productCategories: [], manufactureCategories: [] };
    }
  }, []);

  return { fetchCategories };
};
