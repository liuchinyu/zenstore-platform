import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  isAnyOf,
} from "@reduxjs/toolkit";
import ProductService from "@/services/productService";
import { Product } from "@/types/products/productType";

interface PublishProductArgs {
  oracle_id: string[];
  is_published: number;
}

interface ProductState {
  products: Product[];
  pagination: {
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  activeRequests: number; //處理併發請求
}

const initialState: ProductState = {
  products: [],
  pagination: {
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
  activeRequests: 0,
};

// 獲取產品列表(有分頁)
export const fetchProducts = createAsyncThunk(
  "product/fetchProductsByPage",
  async (
    {
      page,
      pageSize,
      filters,
    }: { page: number; pageSize: number; filters?: {} },
    { rejectWithValue },
  ) => {
    try {
      const response = await ProductService.getProductListByPage(
        page,
        pageSize,
        filters,
      );
      return response;
    } catch (error) {
      return rejectWithValue("獲取產品列表失敗");
    }
  },
);
// 更新產品上下架狀態
export const publishProduct = createAsyncThunk(
  "product/publishProduct",
  async (
    { oracle_id, is_published }: PublishProductArgs,
    { rejectWithValue },
  ) => {
    try {
      await ProductService.publishProduct(oracle_id, is_published);
      // 成功時，回傳參數，讓 reducer 知道要更新哪個產品
      return { oracle_id, is_published };
    } catch (error: any) {
      const message =
        error.response?.data?.message || "上下架產品失敗，請稍後再試";
      return rejectWithValue(message);
    }
  },
);

export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<[]>) => {
      state.products = action.payload;
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
      .addCase(fetchProducts.fulfilled, (state, action) => {
        // 資料處理流程
        state.products = action.payload.items;
        state.pagination = {
          currentPage: action.payload.page,
          totalItems: action.payload.totalItems,
          totalPages: action.payload.totalPages,
        };
      })
      // Publish product reducers
      .addCase(
        publishProduct.fulfilled,
        (state, action: PayloadAction<PublishProductArgs>) => {
          const { oracle_id, is_published } = action.payload;
          oracle_id.forEach((id) => {
            const productIndex = state.products.findIndex(
              (p) => id === p.ORACLE_ID,
            );
            if (productIndex !== -1) {
              state.products[productIndex].IS_PUBLISHED = is_published;
            }
          });
        },
      )
      // 使用 matcher 統一 UI狀態處理
      .addMatcher(
        isAnyOf(fetchProducts.pending, publishProduct.pending),
        (state) => {
          state.activeRequests += 1;
          if (!state.isLoading) state.isLoading = true;
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(fetchProducts.fulfilled, publishProduct.fulfilled),
        (state) => {
          const next = Math.max(0, state.activeRequests - 1);
          state.activeRequests = next;
          const nextLoading = next > 0;
          if (state.isLoading !== nextLoading) state.isLoading = nextLoading;
        },
      )
      .addMatcher(
        isAnyOf(fetchProducts.rejected, publishProduct.rejected),
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
      )
      // 監聽 categorySlice 的 applyCategory 成功事件，更新產品列表
      .addMatcher(
        (action) => action.type === "product/applyCategory/fulfilled",
        (state, action: PayloadAction<any>) => {
          if (action.payload?.productListResult) {
            state.products = action.payload.productListResult;
          }
        },
      )
      // 監聽 tagSlice 的 applyTag 成功事件，更新產品列表
      .addMatcher(
        (action) => action.type === "tag/applyTag/fulfilled",
        (state, action: PayloadAction<any>) => {
          if (action.payload?.productListResult) {
            state.products = action.payload.productListResult;
          }
        },
      );
  },
});

export const { setProducts, setLoading, setError } = productSlice.actions;
export default productSlice.reducer;
