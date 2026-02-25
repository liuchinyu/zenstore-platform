import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import storeInfoService from "../services/storeInfoService";
import { StoreInfo, StoreInfoState } from "../types/storeInfo/storeInfoType";

const initialState: StoreInfoState = {
  items: [],
  loading: false,
  error: null,
};

// 異步操作
export const fetchStoreInfoItems = createAsyncThunk(
  "storeInfo/fetchItems",
  async () => {
    const response = await storeInfoService.getItems();
    return response;
  },
);

export const addStoreInfoItem = createAsyncThunk(
  "storeInfo/addItem",
  async (item: Omit<StoreInfo, "ID">) => {
    const response = await storeInfoService.addItem(item);
    return response;
  },
);

export const updateStoreInfoItem = createAsyncThunk(
  "storeInfo/updateItem",
  async (item: StoreInfo) => {
    const response = await storeInfoService.updateItem(item);
    return response;
  },
);

export const deleteStoreInfoItem = createAsyncThunk(
  "storeInfo/deleteItem",
  async (id: number) => {
    const response = await storeInfoService.deleteItem(id);
    return { id, response };
  },
);

export const activateStoreInfo = createAsyncThunk(
  "storeInfo/activate",
  async (id: number) => {
    const response = await storeInfoService.activate(id);
    return { id, response };
  },
);

export const deactivateStoreInfo = createAsyncThunk(
  "storeInfo/deactivate",
  async (id: number) => {
    const response = await storeInfoService.deactivate(id);
    return { id, response };
  },
);

const storeInfoSlice = createSlice({
  name: "storeInfo",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 獲取項目
      .addCase(fetchStoreInfoItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoreInfoItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchStoreInfoItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "獲取商場資訊失敗";
      })
      // 新增項目
      .addCase(addStoreInfoItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStoreInfoItem.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(addStoreInfoItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "新增商場資訊失敗";
      })
      // 更新項目
      .addCase(updateStoreInfoItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStoreInfoItem.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          const index = state.items.findIndex(
            (item) => item.ID === action.payload.data.ID,
          );
          if (index !== -1) {
            state.items[index] = action.payload.data;
          }
        }
      })
      .addCase(updateStoreInfoItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "更新商場資訊失敗";
      })
      // 刪除項目
      .addCase(deleteStoreInfoItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStoreInfoItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (item) => item.ID !== action.payload.id,
        );
      })
      .addCase(deleteStoreInfoItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "刪除商場資訊失敗";
      })
      // 啟用項目
      .addCase(activateStoreInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateStoreInfo.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (item) => item.ID === action.payload.id,
        );
        if (index !== -1) {
          state.items[index].IS_ACTIVE = 1;
        }
      })
      .addCase(activateStoreInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "啟用商場資訊失敗";
      })
      // 停用項目
      .addCase(deactivateStoreInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateStoreInfo.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (item) => item.ID === action.payload.id,
        );
        if (index !== -1) {
          state.items[index].IS_ACTIVE = 0;
        }
      })
      .addCase(deactivateStoreInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "停用商場資訊失敗";
      });
  },
});

export const { clearError, setLoading } = storeInfoSlice.actions;
export default storeInfoSlice.reducer;
