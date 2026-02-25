import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  isAnyOf,
} from "@reduxjs/toolkit";
import ProductService from "@/services/productService";
import { TagState } from "@/types/products/tagType";

const initialState: TagState = {
  tags: [],
  selectedTags: [],
  tagRelation: [],
  isLoading: false,
  error: null,
  activeRequests: 0,
};

// 創建標籤
export const createTag = createAsyncThunk(
  "tag/createTage",
  async (tag_name: string, { rejectWithValue }) => {
    try {
      const response = await ProductService.createTag(tag_name);
      if (response && response.data.success) {
        return response.data;
      }
      return rejectWithValue("新增標籤失敗");
    } catch (error) {
      return rejectWithValue("新增標籤失敗");
    }
  },
);
// 取得標籤資料
export const fetchTags = createAsyncThunk(
  "tag/fetchTags",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ProductService.getTags();
      if (response && response.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      return rejectWithValue("獲取標籤失敗");
    }
  },
);
// 取得標籤關聯資料
export const fetchTagRelation = createAsyncThunk(
  "tag/fetchTagRelation",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ProductService.getTagRelation();
      if (response && response.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.log("error", error);
      return rejectWithValue("獲取標籤失敗");
    }
  },
);

// 套用標籤
export const applyTag = createAsyncThunk(
  "tag/applyTag",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await ProductService.applyTag(payload);
      if (response.success) {
        return response.data.data;
      }
      return rejectWithValue("套用標籤失敗");
    } catch (error) {
      return rejectWithValue("套用標籤失敗");
    }
  },
);

// 更新標籤
export const updateTag = createAsyncThunk(
  "tag/updateTag",
  async (
    payload: { tag_id: number; tag_name: string },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const response = await ProductService.updateTag(
        payload.tag_id,
        payload.tag_name,
      );
      if (response && response.data.success) {
        // 更新成功後重新獲取標籤列表
        dispatch(fetchTags());
        return response.data;
      }
      return rejectWithValue("更新標籤失敗");
    } catch (error) {
      return rejectWithValue("更新標籤失敗");
    }
  },
);

// 刪除標籤
export const deleteTag = createAsyncThunk(
  "tag/deleteTag",
  async (tag_id: number, { rejectWithValue, dispatch }) => {
    try {
      const response = await ProductService.deleteTag(tag_id);
      if (response && response.data.success) {
        // 刪除成功後重新獲取標籤列表
        dispatch(fetchTags());
        return response.data;
      }
      return rejectWithValue("刪除標籤失敗");
    } catch (error) {
      return rejectWithValue("刪除標籤失敗");
    }
  },
);

export const tagSlice = createSlice({
  name: "tag",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createTag.fulfilled, (state, action) => {
        state.tags.push(action.payload);
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tags = action.payload;
      })
      .addCase(fetchTagRelation.fulfilled, (state, action) => {
        state.tagRelation = action.payload;
      })
      .addCase(applyTag.fulfilled, (state, action: PayloadAction<any>) => {
        state.tags = action.payload.tagResult;
        state.tagRelation = action.payload.tagRelationResult;
      })
      // 使用 matcher 統一 pending/fulfilled/rejected
      .addMatcher(
        isAnyOf(
          createTag.pending,
          fetchTags.pending,
          fetchTagRelation.pending,
          applyTag.pending,
          updateTag.pending,
          deleteTag.pending,
        ),
        (state) => {
          state.activeRequests += 1;
          if (!state.isLoading) state.isLoading = true;
        },
      )
      .addMatcher(
        isAnyOf(
          createTag.fulfilled,
          fetchTags.fulfilled,
          fetchTagRelation.fulfilled,
          applyTag.fulfilled,
          updateTag.fulfilled,
          deleteTag.fulfilled,
        ),
        (state) => {
          const next = Math.max(0, state.activeRequests - 1);
          state.activeRequests = next;
          const nextLoading = next > 0;
          if (state.isLoading !== nextLoading) state.isLoading = nextLoading;
        },
      )
      .addMatcher(
        isAnyOf(
          createTag.rejected,
          fetchTags.rejected,
          fetchTagRelation.rejected,
          applyTag.rejected,
          updateTag.rejected,
          deleteTag.rejected,
        ),
        (state, action) => {
          const next = Math.max(0, state.activeRequests - 1);
          state.activeRequests = next;
          const nextLoading = next > 0;
          if (state.isLoading !== nextLoading) state.isLoading = nextLoading;
          state.error = action.error.message || "操作標籤失敗";
        },
      );
  },
});
export default tagSlice.reducer;
