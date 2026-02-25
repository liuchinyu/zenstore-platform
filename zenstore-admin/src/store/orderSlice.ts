import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  isAnyOf,
} from "@reduxjs/toolkit";
import OrderService from "@/services/orderService";
import {
  OrderDetail,
  GroupedOrderDetail,
  ProductDetail,
  OrderStatusUpdate,
  OrderStatusChangeLog,
} from "@/types/orders/order";

type CancelMode = "pending" | "approved";

interface OrderState {
  orderList: any[];
  orderDetail: OrderDetail[];
  cancelOrder: any[];
  cancelPermitOrder: any[];
  groupedOrderDetail: GroupedOrderDetail | null;
  isLoading: boolean;
  error: string | null;
  statusChangeLogs: OrderStatusChangeLog[];
  statusChangeLogsLoading: boolean;
  statusChangeLogsError: string | null;
  activeRequests: number;
}

const initialState: OrderState = {
  orderList: [],
  orderDetail: [],
  cancelOrder: [],
  cancelPermitOrder: [],
  groupedOrderDetail: null,
  isLoading: false,
  error: null,
  statusChangeLogs: [],
  statusChangeLogsLoading: false,
  statusChangeLogsError: null,
  activeRequests: 0,
};

export const fetchOrderList = createAsyncThunk(
  "order/fetchOrderList",
  async ({ page, pageSize, filters }: any, { rejectWithValue }) => {
    try {
      const response = await OrderService.getOrderList(page, pageSize, filters);
      return response;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue("獲取訂單失敗");
    }
  },
);

// 訂單明細資料轉換
const orderDetailTransform = (order_id: string, order: any) => {
  if (order) {
    const firstOrder = order;

    // 將所有商品明細收集到一個陣列中
    const productDetails: ProductDetail[] = firstOrder.data.map(
      (order: any) => ({
        item_id: order.ITEM_ID,
        oracle_id: order.ORACLE_ID,
        product_id: order.PRODUCT_ID,
        quantity: order.QUANTITY,
        unit_price: order.UNIT_PRICE,
        subtotal: order.SUBTOTAL,
        brand: order.BRAND,
        image_url: order.IMAGE_URL,
      }),
    );

    // 將資料轉換為分組格式
    const groupedOrder: GroupedOrderDetail = {
      basicInfo: {
        order_id: order_id,
        order_status: firstOrder.data[0].ORDER_STATUS,
        order_date: firstOrder.data[0].ORDER_DATE,
        last_updated: firstOrder.data[0].LAST_UPDATED,
        invoice_type: firstOrder.data[0].INVOICE_TYPE,
      },
      productDetails: productDetails,
      financialInfo: {
        subtotal: firstOrder.data[0].SUBTOTAL,
        shipping_fee: firstOrder.data[0].SHIPPING_FEE,
        total_amount: firstOrder.data[0].TOTAL_AMOUNT,
      },
      receiverInfo: {
        name: firstOrder.data[0].RECEIVER_NAME,
        receiver_phone: firstOrder.data[0].RECEIVER_PHONE,
        receiver_landing_phone: firstOrder.data[0].RECEIVER_LANDING_PHONE,
        email: firstOrder.data[0].RECEIVER_EMAIL,
        postal_code: firstOrder.data[0].POSTAL_CODE,
        region: firstOrder.data[0].REGION,
        district: firstOrder.data[0].DISTRICT,
        address: firstOrder.data[0].ADDRESS,
      },
      shippingInfo: {
        method: firstOrder.data[0].DELIVERY_METHOD,
        time: firstOrder.data[0].DELIVERY_TIME,
        status: firstOrder.data[0].SHIPPING_STATUS,
      },
      paymentInfo: {
        status: firstOrder.data[0].PAYMENT_STATUS,
        due_date: firstOrder.data[0].PAYMENT_DUE_DATE,
        payment_method: firstOrder.data[0].PAYMENT_METHOD,
        Atm_Last_Five_Digits: firstOrder.data[0].ATM_LAST_FIVE_DIGITS,
      },
      additionalInfo: {
        notes: firstOrder.data[0].NOTES,
      },
      cancelInfo: {
        cancel_reason: firstOrder.data[0].CANCEL_REASON,
        cancel_verified: firstOrder.data[0].CANCEL_VERIFIED,
        refund_method: firstOrder.data[0].REFUND_METHOD,
        refund_bank: firstOrder.data[0].REFUND_BANK,
        refund_account_name: firstOrder.data[0].REFUND_ACCOUNT_NAME,
        refund_account: firstOrder.data[0].REFUND_ACCOUNT,
      },
    };

    return {
      orderDetail: firstOrder,
      groupedOrderDetail: groupedOrder,
    };
  }
  return {
    orderDetail: [],
    groupedOrderDetail: null,
  };
};

// 導出 thunk actions
export const fetchOrderById = createAsyncThunk(
  "order/fetchOrderById",
  async (order_id: string, { rejectWithValue }) => {
    try {
      const response = await OrderService.getOrderById(order_id);
      if (response) {
        const groupedOrder = orderDetailTransform(order_id, response);
        return {
          orderDetail: groupedOrder.orderDetail,
          groupedOrderDetail: groupedOrder.groupedOrderDetail,
        };
      }
      return {
        orderDetail: [],
        groupedOrderDetail: null,
      };
    } catch (error) {
      return rejectWithValue("獲取訂單失敗");
    }
  },
);

// 取得取消訂單(待處理)
export const fetchCancelOrder = createAsyncThunk(
  "order/fetchCancelOrder",
  async (
    { mode, page, pageSize, filters }: { mode: CancelMode } & any,
    { rejectWithValue },
  ) => {
    try {
      const response = await OrderService.getCancelOrder(
        mode,
        page,
        pageSize,
        filters,
      );
      if (response) {
        return { mode, data: response };
      }
    } catch (error) {
      console.log("error", error);
      return rejectWithValue("獲取取消訂單失敗");
    }
  },
);

// 更新狀態的 Thunk
export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async (updateStatus: any, { rejectWithValue }) => {
    try {
      const response = await OrderService.updateOrderStatus(updateStatus);
      return response;
    } catch (error) {
      return rejectWithValue("更新付款狀態失敗");
    }
  },
);

// 取消訂單 Thunk
export const orderCancelUpdate = createAsyncThunk(
  "order/orderCancelUpdate",
  async (cancelUpdateStatus: any, { rejectWithValue }) => {
    try {
      const response =
        await OrderService.updateOrderCancelStatus(cancelUpdateStatus);
      return response;
    } catch (error) {
      return rejectWithValue("更新付款狀態失敗");
    }
  },
);

//是否核准取消訂單
export const orderCancelUpdatePermit = createAsyncThunk(
  "order/orderCancelUpdatePermit",
  async (cancelUpdateStatus: any, { rejectWithValue }) => {
    try {
      const response =
        await OrderService.updateCancelOrderStatusPermit(cancelUpdateStatus);
      return response;
    } catch (error) {
      return rejectWithValue("更新付款狀態失敗");
    }
  },
);

// 新增 async thunk 來取得狀態變動記錄
export const fetchOrderStatusChangeLogs = createAsyncThunk(
  "order/fetchStatusChangeLogs",
  async (order_id: string) => {
    const response = await OrderService.getOrderStatusChangeLogs(order_id);
    if (response) {
      const formattedOrder = response.map((row: any) => ({
        log_id: row[0],
        order_id: row[1],
        status_type: row[2],
        operation_id: row[3],
        previous_value: row[4],
        new_value: row[5],
        changed_by: row[6],
        change_source: row[7],
        created_at: row[8],
        metadata: row[9],
      }));
      return formattedOrder;
    }
    return [];
  },
);

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setOrderDetail: (state, action: PayloadAction<OrderDetail[]>) => {
      state.orderDetail = action.payload;
    },
    setGroupedOrderDetail: (
      state,
      action: PayloadAction<GroupedOrderDetail | null>,
    ) => {
      state.groupedOrderDetail = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderList.fulfilled, (state, action) => {
        state.orderList = action.payload?.data?.data;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.orderDetail = action.payload.orderDetail || [];
        state.groupedOrderDetail = action.payload.groupedOrderDetail;
      })
      .addCase(fetchCancelOrder.fulfilled, (state, action) => {
        const payload = action.payload as
          | { mode: CancelMode; data: any }
          | undefined;
        if (!payload) return;
        const { mode, data } = payload;
        // 假設後端結構與訂單列表一致 (response.data.data)
        if (mode === "pending") {
          state.cancelOrder = data.data.data;
        } else {
          state.cancelPermitOrder = data.data.data;
        }
      })
      // 處理取得狀態變動記錄
      .addCase(fetchOrderStatusChangeLogs.pending, (state) => {
        state.statusChangeLogsLoading = true;
        state.statusChangeLogsError = null;
      })
      .addCase(fetchOrderStatusChangeLogs.fulfilled, (state, action) => {
        state.statusChangeLogsLoading = false;
        state.statusChangeLogs = action.payload;
      })
      .addCase(fetchOrderStatusChangeLogs.rejected, (state, action) => {
        state.statusChangeLogsLoading = false;
        state.statusChangeLogsError =
          action.error.message || "取得狀態變動記錄失敗";
      })
      // 統一處理多個 pending：遞增請求數並開啟全域 loading
      .addMatcher(
        isAnyOf(
          fetchOrderList.pending,
          fetchOrderById.pending,
          fetchCancelOrder.pending,
          updateOrderStatus.pending,
          orderCancelUpdate.pending,
          orderCancelUpdatePermit.pending,
        ),
        (state) => {
          state.activeRequests += 1;
          if (!state.isLoading) state.isLoading = true;
          state.error = null;
        },
      )
      // 統一處理多個 fulfilled：遞減請求數並視情況關閉全域 loading
      .addMatcher(
        isAnyOf(
          fetchOrderList.fulfilled,
          fetchOrderById.fulfilled,
          fetchCancelOrder.fulfilled,
          updateOrderStatus.fulfilled,
          orderCancelUpdate.fulfilled,
          orderCancelUpdatePermit.fulfilled,
        ),
        (state) => {
          const next = Math.max(0, state.activeRequests - 1);
          state.activeRequests = next;
          const nextLoading = next > 0;
          if (state.isLoading !== nextLoading) state.isLoading = nextLoading;
        },
      )
      // 統一處理多個 rejected：遞減請求數、關閉 loading 並寫入錯誤
      .addMatcher(
        isAnyOf(
          fetchOrderList.rejected,
          fetchOrderById.rejected,
          fetchCancelOrder.rejected,
          updateOrderStatus.rejected,
          orderCancelUpdate.rejected,
          orderCancelUpdatePermit.rejected,
        ),
        (state, action) => {
          const next = Math.max(0, state.activeRequests - 1);
          state.activeRequests = next;
          const nextLoading = next > 0;
          if (state.isLoading !== nextLoading) state.isLoading = nextLoading;
          state.error =
            (action.payload as string) ||
            action.error?.message ||
            "發生未知錯誤";
        },
      );
  },
});

// 導出 slice actions
export const { setOrderDetail, setGroupedOrderDetail, setLoading, setError } =
  orderSlice.actions;

export default orderSlice.reducer;
