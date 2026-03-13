import axios from "axios";
import { OrderStatusUpdate } from "@/types/orders/order";

type CancelMode = "pending" | "approved";

class OrderService {
  private readonly API_URL: string;

  constructor() {
    this.API_URL =
      process.env.NEXT_PUBLIC_API_URL + "/order" ||
      "http://localhost:8080/api/admin/order";
  }

  async getOrderList(page: number, pageSize: number, filters: any) {
    try {
      const response = await axios.get(this.API_URL, {
        params: { page, pageSize, filters },
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }
  // 取得個別訂單資料
  async getOrderById(order_id: string) {
    try {
      const response = await axios.get(this.API_URL + "/" + order_id);
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  // 取得取消訂單(待處理/核准)
  async getCancelOrder(
    mode: CancelMode,
    page: number,
    pageSize: number,
    filters: any,
  ) {
    try {
      const endpoint = mode === "pending" ? "/cancel" : "/cancel-permit";
      const response = await axios.get(this.API_URL + endpoint, {
        params: { page, pageSize, filters },
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  // 更新訂單狀態
  async updateOrderStatus(updateStatus: OrderStatusUpdate) {
    try {
      const response = await axios.patch(this.API_URL + "/status", {
        updateStatus,
      });
      return response.data;
    } catch (error) {
      console.error("更新付款狀態失敗", error);
      throw error;
    }
  }

  // 取消訂單
  async updateOrderCancelStatus(cancelUpdateStatus: any) {
    try {
      const response = await axios.patch(this.API_URL + "/cancel-status", {
        cancelUpdateStatus,
      });
      return response.data;
    } catch (error) {
      console.error("更新付款狀態失敗", error);
      throw error;
    }
  }

  // 是否核准取消訂單
  async updateCancelOrderStatusPermit(cancelUpdateStatus: any) {
    try {
      const response = await axios.patch(this.API_URL + "/cancel-update", {
        cancelUpdateStatus,
      });
      return response.data;
    } catch (error) {
      console.error("更新付款狀態失敗", error);
      throw error;
    }
  }

  // 取得訂單狀態變動記錄
  async getOrderStatusChangeLogs(order_id: string) {
    try {
      const response = await axios.get(
        this.API_URL + "/" + order_id + "/status-logs",
      );
      return response.data;
    } catch (error) {
      console.error("取得訂單狀態變動記錄失敗", error);
      throw error;
    }
  }

  // 匯出excel
  async exportExcel(selectedOrders: string[]) {
    try {
      const response = await axios.get(this.API_URL + "/export-excel", {
        params: {
          selectedOrders,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
}

export default new OrderService();
