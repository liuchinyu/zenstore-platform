import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CarouselItem, CarouselState } from "../types/carousel/carouselType";
import carouselService from "../services/carouselService";

// 初始狀態
const initialState: CarouselState = {
  items: [],
  loading: false,
  error: null,
};

// 獲取所有輪播項目
export const fetchCarouselItems = createAsyncThunk(
  "carousel/fetchItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await carouselService.getCarouselItems();
      return response;
    } catch (error) {
      return rejectWithValue("獲取輪播項目失敗");
    }
  }
);

// 創建輪播項目
export const addCarouselItem = createAsyncThunk(
  "carousel/addItem",
  async (item: Omit<CarouselItem, "id">, { rejectWithValue }) => {
    try {
      const response = await carouselService.addCarouselItem(item);
      return response;
    } catch (error) {
      return rejectWithValue("新增輪播項目失敗");
    }
  }
);

// 更新輪播項目
export const updateCarouselItem = createAsyncThunk(
  "carousel/updateItem",
  async (item: CarouselItem, { rejectWithValue }) => {
    try {
      const response = await carouselService.updateCarouselItem(item);
      return response;
    } catch (error) {
      return rejectWithValue("更新輪播項目失敗");
    }
  }
);

// 更新輪播項目順序
export const updateCarouselItemOrder = createAsyncThunk(
  "carousel/updateItemOrder",
  async (
    {
      id,
      display_order,
      change,
    }: { id: number; display_order: number; change: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await carouselService.updateCarouselItemOrder(
        id,
        display_order,
        change
      );
      return response;
    } catch (error) {
      return rejectWithValue("更新輪播項目順序失敗");
    }
  }
);

// 刪除輪播項目
export const deleteCarouselItem = createAsyncThunk(
  "carousel/deleteItem",
  async ({ id, index }: { id: number; index: number }, { rejectWithValue }) => {
    try {
      await carouselService.deleteCarouselItem(id, index);
      return { id, index };
    } catch (error) {
      return rejectWithValue("刪除輪播項目失敗");
    }
  }
);

const carouselSlice = createSlice({
  name: "carousel",
  initialState,
  reducers: {
    reorderCarouselItems: (state, action: PayloadAction<CarouselItem[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 處理獲取輪播項目
      .addCase(fetchCarouselItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarouselItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCarouselItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 處理新增輪播項目
      .addCase(addCarouselItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // .addCase(addCarouselItem.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.items.push(action.payload);
      // })
      .addCase(addCarouselItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 處理更新輪播項目
      .addCase(updateCarouselItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCarouselItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (item) => item.ID === action.payload.ID
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateCarouselItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 處理刪除輪播項目
      .addCase(deleteCarouselItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCarouselItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (item) => item.ID !== Number(action.payload)
        );
      })
      .addCase(deleteCarouselItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { reorderCarouselItems } = carouselSlice.actions;
export default carouselSlice.reducer;
