import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: ToastItem[];
}

const initialState: ToastState = {
  toasts: [],
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<ToastItem>) => {
      state.toasts.push(action.payload);
    },
    removeToast: (state, action: PayloadAction<number>) => {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload
      );
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
