import axiosInstance, { axios } from "@/lib/axios";
import { ApiResponse, ShippingAddress, UpdateShippingAddress } from "@/types";

class AccountService {
  static async createShippingAddress(
    member_id: string,
    address: ShippingAddress,
  ): Promise<ApiResponse> {
    try {
      console.log("新增地址:", address);
      const response = await axiosInstance.post("/account/shipping-address", {
        member_id,
        address,
      });
      return {
        success: true,
        message: "地址新增成功",
        data: response.data,
      };
    } catch (error) {
      console.log("新增地址失敗:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "新增地址失敗",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  static async updateShippingAddress(
    address: UpdateShippingAddress,
  ): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.patch("/account/shipping-address", {
        address,
      });
      return {
        success: true,
        message: "地址更新成功",
        data: response.data,
      };
    } catch (error) {
      console.log("更新地址失敗:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "更新地址失敗",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  static async deleteShippingAddress(address_id: string): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.delete("/account/shipping-address", {
        data: { address_id },
      });
      return {
        success: true,
        message: "地址刪除成功",
        data: response.data,
      };
    } catch (error) {
      console.log("刪除地址失敗:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "刪除地址失敗",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  static async getShippingAddress(
    member_id: string,
  ): Promise<ApiResponse & { shippingData?: any }> {
    try {
      const result = await axiosInstance.get("/account/shipping-address", {
        params: { member_id },
      });
      if (result.data.success) {
        return {
          success: true,
          message: "成功獲取收貨地址",
          shippingData: result.data.shippingData,
        };
      } else {
        return {
          success: false,
          message: "目前尚無儲存的收件地址",
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: "目前尚無儲存的收件地址",
        };
      }
      return {
        success: false,
        message: "系統異常，請聯絡相關人員",
      };
    }
  }
}

export default AccountService;
