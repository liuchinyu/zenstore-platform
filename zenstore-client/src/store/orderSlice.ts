import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import OrderService from "@/services/orderService";

// 定義訂單狀態類型
export interface OrderState {
  orders: any | null;
  currentOrder: any | null;
  loading: boolean;
  error: string | null;
  orderCreationStatus: {
    loading: boolean;
    error: string | null;
    success: boolean;
    orderId: string | null;
  };
}

// 初始狀態
const initialState: OrderState = {
  orders: null,
  currentOrder: null,
  loading: false,
  error: null,
  orderCreationStatus: {
    loading: false,
    error: null,
    success: false,
    orderId: null,
  },
};

// 創建訂單
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData: any, { rejectWithValue }) => {
    try {
      const response = await OrderService.createOrder(orderData);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue("無法建立訂單");
    }
  }
);

// 獲取訂單列表
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (
    {
      memberId,
      filters,
    }: {
      memberId: string;
      filters?: { startDate?: string; endDate?: string; status?: string };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await OrderService.getOrders(memberId, filters);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue("無法獲取訂單資料");
    }
  }
);

// 獲取訂單詳情
export const fetchOrderDetail = createAsyncThunk(
  "orders/fetchOrderDetail",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await OrderService.getOrderDetail(orderId);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      console.log("response", response);
      return response.data;
    } catch (error) {
      return rejectWithValue("無法獲取訂單詳情");
    }
  }
);

// 取消訂單
export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await OrderService.cancelOrder(orderId);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return { orderId, data: response.data };
    } catch (error) {
      return rejectWithValue("無法取消訂單");
    }
  }
);

// 創建訂單slice
const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    resetOrderCreationStatus: (state) => {
      state.orderCreationStatus = {
        loading: false,
        error: null,
        success: false,
        orderId: null,
      };
    },
    clearOrders: (state) => {
      state.orders = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // 創建訂單
      .addCase(createOrder.pending, (state) => {
        state.orderCreationStatus.loading = true;
        state.orderCreationStatus.error = null;
        state.orderCreationStatus.success = false;
        state.orderCreationStatus.orderId = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderCreationStatus.loading = false;
        state.orderCreationStatus.success = true;
        state.orderCreationStatus.orderId = action.payload.id;

        // 將新訂單添加到訂單列表的頂部
        // action.payload表createOrder成功返回的資料
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderCreationStatus.loading = false;
        state.orderCreationStatus.error = action.payload as string;
        state.orderCreationStatus.success = false;
      })

      // 獲取訂單列表
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 獲取訂單詳情
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 取消訂單
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        // 更新訂單狀態
        const { orderId } = action.payload;
        const orderIndex = state.orders.order_master.findIndex(
          (order: any) => order.id === orderId
        );
        if (orderIndex !== -1) {
          state.orders.order_master[orderIndex].status = "cancelled";
        }
        // 如果當前正在查看的訂單被取消，同時更新currentOrder
        if (state.currentOrder && state.currentOrder.id === orderId) {
          state.currentOrder.status = "cancelled";
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// 導出actions
export const {
  // setFilters,
  // clearFilters,
  clearCurrentOrder,
  resetOrderCreationStatus,
  clearOrders,
} = orderSlice.actions;

// 導出reducer
export default orderSlice.reducer;
