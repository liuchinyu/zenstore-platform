import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import ProductService from "@/services/productService";
import { Product, ProductDetail } from "@/types";

interface ProductState {
  products: Product[];
  productDetail: ProductDetail | null; // 改為可為 null
  hotProducts?: Product[];
  newProducts?: Product[];
  saleProducts?: Product[];
  loading: boolean;
  hotProductsLoading: boolean;
  newProductsLoading: boolean;
  saleProductsLoading: boolean;
  error: string | null;
  hotProductsError: string | null;
  newProductsError: string | null;
  saleProductsError: string | null;
}

const initialState: ProductState = {
  products: [],
  productDetail: null, // 改為 null
  hotProducts: [],
  newProducts: [],
  saleProducts: [],
  loading: false,
  hotProductsLoading: false,
  newProductsLoading: false,
  saleProductsLoading: false,
  error: null,
  hotProductsError: null,
  newProductsError: null,
  saleProductsError: null,
};

// 查詢商品明細
export const fetchProductDetail = createAsyncThunk(
  "products/fetchProductDetail",
  async (oracleId: string, { rejectWithValue }) => {
    try {
      const response = await ProductService.getProductByOracleId(oracleId);
      return response;
    } catch (error) {
      return rejectWithValue("無法獲取商品明細");
    }
  }
);

// 取得熱門商品
export const fetchHotProducts = createAsyncThunk(
  "products/fetchHotProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ProductService.getHotProducts();
      return response;
    } catch (error) {
      return rejectWithValue("無法獲取熱門產品資料");
    }
  },
  {
    condition: (_, { getState }) => {
      const state: any = getState();
      const loading = state?.products?.hotProductsLoading;
      const hasHotProducts =
        Array.isArray(state?.products?.hotProducts) &&
        state.products.hotProducts.length > 0;
      if (loading || hasHotProducts) return false;
      return true;
    },
  }
);

// 取得最新商品
export const fetchNewProducts = createAsyncThunk(
  "products/fetchNewProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ProductService.getNewProducts();
      return response;
    } catch (error) {
      return rejectWithValue("無法獲取最新產品資料");
    }
  },
  {
    condition: (_, { getState }) => {
      const state: any = getState();
      const loading = state?.products?.newProductsLoading;
      const hasNewProducts =
        Array.isArray(state?.products?.newProducts) &&
        state.products.newProducts.length > 0;
      if (loading || hasNewProducts) return false;
      return true;
    },
  }
);

// 取得特價商品
export const fetchSaleProducts = createAsyncThunk(
  "products/fetchSaleProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ProductService.getSaleProducts();
      return response;
    } catch (error) {
      return rejectWithValue("無法獲取特價產品資料");
    }
  },
  {
    condition: (_, { getState }) => {
      const state: any = getState();
      const loading = state?.products?.saleProductsLoading;
      const hasSaleProducts =
        Array.isArray(state?.products?.saleProducts) &&
        state.products.saleProducts.length > 0;
      if (loading || hasSaleProducts) return false;
      return true;
    },
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // 添加清除產品詳情的 action
    clearProductDetail: (state) => {
      state.productDetail = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 查詢商品明細
    builder.addCase(fetchProductDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProductDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.productDetail = action.payload; // 直接儲存 API 回應
      state.error = null;
    });

    builder.addCase(fetchProductDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 熱門商品
    builder.addCase(fetchHotProducts.pending, (state) => {
      state.hotProductsLoading = true;
      state.hotProductsError = null;
    });
    builder.addCase(fetchHotProducts.fulfilled, (state, action) => {
      state.hotProductsLoading = false;
      state.hotProducts = action.payload;
    });
    builder.addCase(fetchHotProducts.rejected, (state, action) => {
      state.hotProductsLoading = false;
      state.hotProductsError = action.payload as string;
    });

    // 最新商品
    builder.addCase(fetchNewProducts.pending, (state) => {
      state.newProductsLoading = true;
      state.newProductsError = null;
    });
    builder.addCase(fetchNewProducts.fulfilled, (state, action) => {
      state.newProductsLoading = false;
      state.newProducts = action.payload;
    });
    builder.addCase(fetchNewProducts.rejected, (state, action) => {
      state.newProductsLoading = false;
      state.newProductsError = action.payload as string;
    });

    // 特價商品
    builder.addCase(fetchSaleProducts.pending, (state) => {
      state.saleProductsLoading = true;
      state.saleProductsError = null;
    });
    builder.addCase(fetchSaleProducts.fulfilled, (state, action) => {
      state.saleProductsLoading = false;
      state.saleProducts = action.payload;
    });
    builder.addCase(fetchSaleProducts.rejected, (state, action) => {
      state.saleProductsLoading = false;
      state.saleProductsError = action.payload as string;
    });
  },
});

// 導出 action
export const { clearProductDetail } = productSlice.actions;

export default productSlice.reducer;
