import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  CategoryType,
  CategoryRelationType,
} from "@/types/products/categoryType";
import ProductService from "@/services/productService";
import { act } from "react";

interface CategoryState {
  tag: string;
  tagValue: number;
  tagTitle: string;
  parentId: number;
  categories: CategoryType[]; //總分類
  productCategoires: any[]; //商品分類
  manufactureCategories: CategoryType[]; //製造商分類
  categoryRelation: CategoryRelationType[];
  isLoading: boolean;
  buttonProps: string;
  error: string | null;
}

const initialState: CategoryState = {
  tag: "",
  tagValue: 0,
  tagTitle: "",
  parentId: 0,
  categories: [],
  productCategoires: [],
  manufactureCategories: [],
  categoryRelation: [],
  isLoading: false,
  buttonProps: "",
  error: null,
};
// 取得總分類
export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      // test:getAllCategory
      const response = await ProductService.getAllCategory();
      if (response) {
        const formattedCategories = response.rows
          .map((row: any) => ({
            category_id: row[0],
            category_title: row[1],
            parent_id: row[2],
            category_level: row[3],
            created_at: row[4],
            updated_at: row[5],
            category_type: row[6],
          }))
          .sort((a: any, b: any) =>
            a.category_title.localeCompare(b.category_title, "zh-TW"),
          );
        return formattedCategories;
      }
      return [];
    } catch (error) {
      return rejectWithValue("獲取分類列表失敗");
    }
  },
);

// 取得商品分類
export const fetchProductCategories = createAsyncThunk(
  "category/fetchProductCategories",
  async (_, { rejectWithValue }) => {
    try {
      // test:getAllCategory
      const response = await ProductService.getProductCategory();
      if (response) {
        return response;
      }
      return [];
    } catch (error) {
      return rejectWithValue("獲取分類列表失敗");
    }
  },
);

// 取得製造商分類
export const fetchManufactureCategories = createAsyncThunk(
  "category/fetchManufactureCategories",
  async (_, { rejectWithValue }) => {
    try {
      // test:getAllCategory
      const response = await ProductService.getManufactureCategory();

      if (response) {
        return response;
      }
      return [];
    } catch (error) {
      return rejectWithValue("獲取分類列表失敗");
    }
  },
);

// 取得分類關係
export const fetchCategoryRelation = createAsyncThunk(
  "category/fetchCategoryRelation",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ProductService.getCategoryRelation();
      if (response) {
        return response.data;
      }
      return [];
    } catch (error) {
      return rejectWithValue("獲取分類關係失敗");
    }
  },
);

// 套用產品分類
export const applyCategory = createAsyncThunk(
  "product/applyCategory",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await ProductService.applyCategory(payload);
      if (response && response.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      return rejectWithValue("套用產品列表失敗");
    }
  },
);

export const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setTag: (state, action: PayloadAction<string>) => {
      state.tag = action.payload;
    },
    setTagValue: (state, action: PayloadAction<number>) => {
      //tag_level
      state.tagValue = action.payload;
    },
    setTagTitle: (state, action: PayloadAction<string>) => {
      state.tagTitle = action.payload;
    },
    setParentId: (state, action: PayloadAction<number>) => {
      state.parentId = action.payload;
    },
    // 設定總分類
    setCategories: (state, action: PayloadAction<CategoryType[]>) => {
      state.categories = action.payload;
    },
    // 設定產品分類
    setProductCategories: (state, action: PayloadAction<CategoryType[]>) => {
      state.productCategoires = action.payload;
    },
    setManufactureCategories: (
      state,
      action: PayloadAction<CategoryType[]>,
    ) => {
      state.manufactureCategories = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setButtonProps: (state, action: PayloadAction<string>) => {
      state.buttonProps = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "獲取分類列表失敗";
      })
      .addCase(fetchProductCategories.fulfilled, (state, action) => {
        state.productCategoires = action.payload;
      })
      .addCase(fetchManufactureCategories.fulfilled, (state, action) => {
        state.manufactureCategories = action.payload;
      })
      .addCase(fetchCategoryRelation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategoryRelation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoryRelation = action.payload;
      })
      .addCase(fetchCategoryRelation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "獲取分類關係失敗";
      })
      .addCase(applyCategory.fulfilled, (state, action) => {
        state.categoryRelation = action.payload.productCategoryRelationResult;
      });
  },
});

export const {
  setTag,
  setTagValue,
  setTagTitle,
  setParentId,
  setCategories,
  setProductCategories,
  setManufactureCategories,
  setLoading,
  setButtonProps,
} = categorySlice.actions;
export default categorySlice.reducer;
