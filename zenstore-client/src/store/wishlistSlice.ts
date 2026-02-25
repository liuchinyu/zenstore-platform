import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import WishlistService from "@/services/wishlistService";
import { ExtendedRootState } from "./store";
import { WishlistItem } from "@/types";

interface WishlistState {
  items: WishlistItem[]; //完整的收藏清單
  productIds: string[]; // 僅儲存商品oracle_id，使用陣列而非 Set
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: WishlistState = {
  items: [],
  productIds: [], // 初始化為空陣列
  loading: false,
  error: null,
  isInitialized: false,
};

// 獲取收藏清單
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (member_id: string, { rejectWithValue }) => {
    try {
      const response = await WishlistService.getWishlist(member_id);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue("無法獲取收藏清單");
    }
  }
);

// 添加商品到收藏清單
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (
    { member_id, oracle_id }: { member_id: string; oracle_id: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await WishlistService.addToWishlist(
        member_id,
        oracle_id
      );
      if (response.success) {
        // 重新獲取最新的收藏清單
        return {
          success: true,
          message: "添加到收藏清單成功",
          data: response.data,
        };
      }

      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue("無法添加到收藏清單");
    }
  }
);

// 從收藏清單中移除商品
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (
    { member_id, wishlist_id }: { member_id: string; wishlist_id: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await WishlistService.removeFromWishlist(
        member_id,
        wishlist_id
      );
      if (response.success) {
        // 重新獲取最新的收藏清單
        return {
          success: true,
          message: "移除收藏清單成功",
          data: response.data,
        };
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue("無法從收藏清單中移除");
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.productIds = [];
      state.isInitialized = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // 獲取收藏清單
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchWishlist.fulfilled,
        (state, action: PayloadAction<WishlistItem[]>) => {
          state.loading = false;
          state.items = action.payload;
          state.isInitialized = true;

          // 儲存產品 ID 列表
          state.productIds = action.payload?.map((item: any) => item.ORACLE_ID);
        }
      )
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 處理添加到收藏清單
      .addCase(addToWishlist.fulfilled, (state, action) => {
        // 如果後端返回了添加的產品信息，可以直接更新 productIds
        state.items = action.payload.data;
        state.productIds = action.payload?.data?.map(
          (item: any) => item.ORACLE_ID
        );
      })
      // 處理從收藏清單移除
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.productIds = action.payload?.data?.map(
          (item: any) => item.ORACLE_ID
        );
      });
  },
});

// 導出選擇器和 actions
export const { clearWishlist } = wishlistSlice.actions;

export const selectWishlistItems = (state: ExtendedRootState) =>
  state.wishlist?.items || [];
export const selectWishlistLoading = (state: ExtendedRootState) =>
  state.wishlist?.loading || false;
export const selectWishlistError = (state: ExtendedRootState) =>
  state.wishlist?.error || null;
export const selectIsProductInWishlist = (
  state: ExtendedRootState,
  oracle_id: string
) => state.wishlist?.productIds?.includes(oracle_id) || false;

export default wishlistSlice.reducer;
