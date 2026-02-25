// 常用地址
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import accountService from "@/services/accountService";

import { ShippingAddress } from "@/types";

interface AddressState {
  addresses: ShippingAddress[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AddressState = {
  addresses: [],
  loading: false,
  error: null,
  isInitialized: false,
};

// 取得常用地址
export const getAddresses = createAsyncThunk(
  "address/getAddresses",
  async (member_id: string, { rejectWithValue }) => {
    try {
      console.log("1122");
      const response = await accountService.getShippingAddress(member_id);
      console.log("getShippingresponse", response);
      if (response.success) {
        return response.shippingData;
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue("取得地址失敗");
    }
  },
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAddresses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAddresses.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.addresses = action.payload;
      state.isInitialized = true;
    });
    builder.addCase(getAddresses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default addressSlice.reducer;
