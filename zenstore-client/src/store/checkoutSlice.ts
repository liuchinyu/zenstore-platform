// 結帳流程專用
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CheckoutShippingInfo, PaymentInfo } from "@/types";

// 定義結帳流程狀態
interface CheckoutState {
  shippingInfo: CheckoutShippingInfo | null;
  paymentInfo: PaymentInfo | null;
}

// 初始狀態
const initialState: CheckoutState = {
  shippingInfo: null, //結帳的收件地址
  paymentInfo: null, //結帳的支付方式
};

// 創建 slice
const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    // 設置收件資訊
    setShippingInfo: (state, action: PayloadAction<CheckoutShippingInfo>) => {
      state.shippingInfo = action.payload;
    },
    // 設置支付資訊
    setPaymentInfo: (state, action: PayloadAction<PaymentInfo>) => {
      state.paymentInfo = action.payload;
    },
    // 清空結帳資料
    clearCheckoutData: (state) => {
      state.shippingInfo = null;
      state.paymentInfo = null;
    },
  },
});

// 導出 actions
export const { setShippingInfo, setPaymentInfo, clearCheckoutData } =
  checkoutSlice.actions;

// 導出 reducer
export default checkoutSlice.reducer;
