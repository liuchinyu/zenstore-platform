import axiosInstance, { axios } from "@/lib/axios";
import { ApiResponse, OrderFilterParams, CreateOrderRequest } from "@/types";

class OrderService {
  static async createOrder(
    orderData: CreateOrderRequest
  ): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post("/orders", orderData);

      return {
        success: true,
        message: "訂單建立成功",
        data: response.data,
      };
    } catch (error) {
      console.log("建立訂單失敗:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "建立訂單失敗",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  static async getOrders(
    memberId: string,
    filters?: OrderFilterParams
  ): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.get("/orders", {
        params: {
          member_id: memberId,
          filters: filters ? { ...filters } : undefined,
        },
      });
      return {
        success: true,
        message: "訂單資料獲取成功",
        data: response.data.order_master,
      };
    } catch (error) {
      console.log("獲取訂單資料失敗:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "獲取訂單資料失敗",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  static async getOrderDetail(orderId: string): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      console.log("response", response);
      return {
        success: true,
        message: "訂單詳情獲取成功",
        data: response.data.order_detail,
      };
    } catch (error) {
      console.log("獲取訂單詳情失敗:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "獲取訂單詳情失敗",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  static async cancelOrder(orderId: string): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post(`/orders/${orderId}/cancel`);
      return {
        success: true,
        message: "訂單取消成功",
        data: response.data,
      };
    } catch (error) {
      console.log("取消訂單失敗:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || "取消訂單失敗",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }
}

export default OrderService;
