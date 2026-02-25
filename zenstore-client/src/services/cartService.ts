import axiosInstance, { axios } from "@/lib/axios";
import { CartItem, AddToCartRequest } from "@/types";

class CartService {
  // 獲取登入用戶的購物車資料
  static async getUserCart(member_id: string) {
    try {
      const response = await axiosInstance.get("/account/cart/", {
        params: { member_id },
      });
      const cartItems = response.data.data;
      return {
        success: true,
        message: response.data.message || "成功獲取購物車資料",
        overValueMessage: response.data.overValueMessage,
        data: cartItems,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          data: [],
          success: false,
          message: "目前購物車尚無資料",
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  static async checkUserCart(member_id: string, oracle_id: string) {
    try {
      const response = await axiosInstance.get("/account/cart-check", {
        params: { member_id, oracle_id },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: "目前購物車尚無資料",
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }
  // 新增商品到購物車（已登入用戶）
  static async addToUserCart(member_id: string, items: AddToCartRequest[]) {
    try {
      // 在 Service 層統一處理格式轉換

      const formattedItems = items.map((item) => ({
        oracle_id: item.ORACLE_ID,
        original_quantity: item.ORIGINAL_QUANTITY,
        new_quantity: item.NEW_QUANTITY,
      }));
      const response = await axiosInstance.post("/account/cart", {
        member_id: member_id,
        items: formattedItems,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message,
          status: error.response.status,
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  // 訪客加入購物車
  static async addToGuestCart(items: AddToCartRequest[]) {
    try {
      const formattedItems = items.map((item) => ({
        oracle_id: item.ORACLE_ID,
        original_quantity: item.ORIGINAL_QUANTITY,
        new_quantity: item.NEW_QUANTITY,
      }));

      const response = await axiosInstance.post("/account/guest-cart", {
        items: formattedItems,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message,
          status: error.response.status,
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  static async updateUserCart(
    member_id: string,
    items: {
      oracle_id: string;
      quantity: number;
    }[],
  ) {
    try {
      const response = await axiosInstance.patch("/account/cart", {
        member_id: member_id,
        items: items,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: "更新購物車失敗",
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  static async deleteUserCart(member_id: string) {
    try {
      const response = await axiosInstance.delete("/account/cart", {
        params: { member_id },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: "刪除購物車失敗",
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  static async deleteUserCartById(member_id: string, oracle_id: string) {
    try {
      const response = await axiosInstance.delete("/account/cart", {
        params: { member_id, oracle_id },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: "刪除購物車失敗",
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  // 合併本地購物車到用戶購物車
  static async mergeLocalCart(localCart: { [key: string]: CartItem }) {
    try {
      const response = await axiosInstance.post("/cart/merge", {
        items: localCart,
      });
      return response.data;
    } catch (error) {
      console.error("合併購物車失敗:", error);
      throw error;
    }
  }

  // 強制同步購物車到後端
  static async forceSyncCart(
    member_id: string,
    localCart: { [key: string]: any },
  ) {
    try {
      const items2 = Object.keys(localCart).map((key) => {
        const cartItem = localCart[key];
        return {
          ORACLE_ID: cartItem.ORACLE_ID,
          ORIGINAL_QUANTITY: cartItem.QUANTITY,
        };
      });
      if (!items2 || Object.keys(items2).length === 0) return;
      const addToUserCartResponse = await this.addToUserCart(member_id, items2);
      return addToUserCartResponse;
    } catch (error) {
      console.error("同步購物車失敗:", error);
      throw error;
    }
  }
}

export default CartService;
