import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { MarqueeItem, MarqueeState } from "../types/marquee/marqueeType";
import marqueeService from "../services/marqueeService";

const initialState: MarqueeState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchMarqueeItems = createAsyncThunk(
  "marquee/fetchItems",
  async (_, { rejectWithValue }) => {
    try {
      const res = await marqueeService.getItems();
      return res as MarqueeItem[];
    } catch (e) {
      return rejectWithValue("取得跑馬燈失敗");
    }
  }
);

export const addMarqueeItem = createAsyncThunk(
  "marquee/addItem",
  async (item: Omit<MarqueeItem, "ID">, { rejectWithValue }) => {
    try {
      const res = await marqueeService.addItem(item);
      return res as MarqueeItem;
    } catch (e) {
      return rejectWithValue("新增跑馬燈失敗");
    }
  }
);

export const updateMarqueeItem = createAsyncThunk(
  "marquee/updateItem",
  async (item: MarqueeItem, { rejectWithValue }) => {
    try {
      const res = await marqueeService.updateItem(item);
      return res as MarqueeItem;
    } catch (e) {
      return rejectWithValue("更新跑馬燈失敗");
    }
  }
);

export const deleteMarqueeItem = createAsyncThunk(
  "marquee/deleteItem",
  async (id: number, { rejectWithValue }) => {
    try {
      await marqueeService.deleteItem(id);
      return id;
    } catch (e) {
      return rejectWithValue("刪除跑馬燈失敗");
    }
  }
);

export const activateMarquee = createAsyncThunk(
  "marquee/activate",
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await marqueeService.activate(id);
      return res as MarqueeItem[]; // 後端返回最新列表（已保證單一啟用）
    } catch (e) {
      return rejectWithValue("啟用跑馬燈失敗");
    }
  }
);

export const deactivateMarquee = createAsyncThunk(
  "marquee/deactivate",
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await marqueeService.deactivate(id);
      return res as MarqueeItem;
    } catch (e) {
      return rejectWithValue("停用跑馬燈失敗");
    }
  }
);

const marqueeSlice = createSlice({
  name: "marquee",
  initialState,
  reducers: {
    reorderMarqueeItems: (state, action: PayloadAction<MarqueeItem[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarqueeItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarqueeItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMarqueeItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addMarqueeItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMarqueeItem.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addMarqueeItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateMarqueeItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMarqueeItem.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex((x) => x.ID === action.payload.ID);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateMarqueeItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteMarqueeItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMarqueeItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((x) => x.ID !== action.payload);
      })
      .addCase(deleteMarqueeItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(activateMarquee.fulfilled, (state, action) => {
        // 假設返回整個列表
        // state.items = action.payload;
      });
  },
});

export const { reorderMarqueeItems } = marqueeSlice.actions;
export default marqueeSlice.reducer;
