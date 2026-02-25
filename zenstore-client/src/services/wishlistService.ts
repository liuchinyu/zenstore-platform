import axiosInstance, { axios } from "@/lib/axios";
import { ApiResponse } from "@/types";

class WishlistService {
  static async getWishlist(member_id: string): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.get("/account/wishlist", {
        params: { member_id },
      });
      if (response.data?.success) {
        return {
          success: true,
          message: response?.data?.message,
          data: response?.data?.data,
        };
      } else {
        return {
          success: false,
          message: "取得收藏清單失敗",
          data: [],
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "獲取收藏清單失敗",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  static async addToWishlist(
    member_id: string,
    oracle_id: string
  ): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post("/account/wishlist", {
        member_id,
        oracle_id,
      });
      if (response.data?.success) {
        return {
          success: true,
          message: "成功添加到收藏清單",
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          message: "添加到收藏清單失敗",
          data: [],
        };
      }
    } catch (error) {
      console.log("添加到收藏清單失敗:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "添加到收藏清單失敗",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  static async removeFromWishlist(
    member_id: string,
    wishlist_id: number
  ): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.delete("/account/wishlist", {
        params: { member_id, wishlist_id },
      });

      console.log("delete_wishlist_result", response);

      if (response.data?.success) {
        return {
          success: true,
          message: "成功從收藏清單中移除",
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          message: "從收藏清單中移除失敗",
          data: [],
        };
      }
    } catch (error) {
      console.log("從收藏清單中移除失敗:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "從收藏清單中移除失敗",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  static async checkWishlistStatus(oracle_id: string): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.get(
        `/account/wishlist/check/${oracle_id}`
      );
      return {
        success: true,
        message: "成功檢查收藏狀態",
        data: response.data,
      };
    } catch (error) {
      console.log("檢查收藏狀態失敗:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "檢查收藏狀態失敗",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }
}

export default WishlistService;
