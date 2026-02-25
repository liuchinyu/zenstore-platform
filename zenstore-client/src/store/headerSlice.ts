import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Category } from "@/types";
import ProductService from "@/services/productService";

interface HeaderState {
  showOffcanvas: boolean;
  showSubOptions: boolean;
  showTechMenu: boolean;
  showManufactureMenu: boolean;
  showAccountMenu: boolean; // 新增控制我的帳號下拉選單的狀態
  isNavigating: boolean; // 新增導航等待狀態
  navigationText: string; // 導航等待文字
  categories: Category[];
  manufactureCategories: any[];
  productCategoriesRelation: Category[];
}

const initialState: HeaderState = {
  showOffcanvas: false,
  showSubOptions: false,
  showTechMenu: false,
  showManufactureMenu: false,
  showAccountMenu: false, // 初始值為 false
  isNavigating: false, // 初始值為 false
  navigationText: "載入中...", // 預設等待文字
  categories: [],
  manufactureCategories: [],
  productCategoriesRelation: [],
};

// 取得商品總分類
export const fetchProductCategoriesRelation = createAsyncThunk(
  "products/fetchProductCategoriesRelation",
  async (category_ids: number[], { rejectWithValue }) => {
    try {
      console.log("category_ids", category_ids);
      const response = await ProductService.getProductCategoriesRelation(
        category_ids
      );
      console.log("fetch+____response", response);
      return response;
    } catch (error) {
      return rejectWithValue("無法獲取商品總分類");
    }
  }
);

const headerSlice = createSlice({
  name: "header",
  initialState,
  reducers: {
    setShowOffcanvas: (state, action: PayloadAction<boolean>) => {
      state.showOffcanvas = action.payload;
    },
    setShowSubOptions: (state, action: PayloadAction<boolean>) => {
      state.showSubOptions = action.payload;
    },
    setShowTechMenu: (state, action: PayloadAction<boolean>) => {
      state.showTechMenu = action.payload;
    },
    setShowManufactureMenu: (state, action: PayloadAction<boolean>) => {
      state.showManufactureMenu = action.payload;
    },
    setShowAccountMenu: (state, action: PayloadAction<boolean>) => {
      state.showAccountMenu = action.payload;
    },
    setIsNavigating: (state, action: PayloadAction<boolean>) => {
      state.isNavigating = action.payload;
    },
    setNavigationText: (state, action: PayloadAction<string>) => {
      state.navigationText = action.payload;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setManufactureCategories: (state, action: PayloadAction<any[]>) => {
      state.manufactureCategories = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchProductCategoriesRelation.fulfilled,
      (state, action) => {
        state.productCategoriesRelation = action.payload;
      }
    );
  },
});

export const {
  setShowOffcanvas,
  setShowSubOptions,
  setShowTechMenu,
  setCategories,
  setManufactureCategories,
  setShowManufactureMenu,
  setShowAccountMenu,
  setIsNavigating,
  setNavigationText,
} = headerSlice.actions;
export default headerSlice.reducer;
