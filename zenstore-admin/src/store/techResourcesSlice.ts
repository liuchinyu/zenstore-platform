import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  isAnyOf,
} from "@reduxjs/toolkit";
import TechResourcesService from "@/services/techResourcesService";
import {
  TechResource,
  TechResourceState,
} from "@/types/techResources/techResourceType";

const initialState: TechResourceState = {
  resources: [],
  isLoading: false,
  error: null,
  activeRequests: 0,
};

// 獲取技術文章列表
export const fetchTechResources = createAsyncThunk(
  "techResources/fetchTechResources",
  async (_, { rejectWithValue }) => {
    try {
      const response = await TechResourcesService.getTechResources();
      return response;
    } catch (error) {
      return rejectWithValue("獲取技術文章列表失敗");
    }
  }
);

// 創建技術文章
export const createTechResource = createAsyncThunk(
  "techResources/createTechResource",
  async (data: TechResource, { rejectWithValue }) => {
    try {
      const response = await TechResourcesService.createTechResource(data);
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "創建技術文章失敗，請稍後再試";
      return rejectWithValue(message);
    }
  }
);

// 更新技術文章
export const updateTechResource = createAsyncThunk(
  "techResources/updateTechResource",
  async (
    { id, data }: { id: string; data: Partial<TechResource> },
    { rejectWithValue }
  ) => {
    try {
      const response = await TechResourcesService.updateTechResource(id, data);
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "更新技術文章失敗，請稍後再試";
      return rejectWithValue(message);
    }
  }
);

// 刪除技術文章
export const deleteTechResource = createAsyncThunk(
  "techResources/deleteTechResource",
  async (id: string, { rejectWithValue }) => {
    try {
      await TechResourcesService.deleteTechResource(id);
      return id; // 回傳ID，讓reducer知道要刪除哪個文章
    } catch (error: any) {
      const message =
        error.response?.data?.message || "刪除技術文章失敗，請稍後再試";
      return rejectWithValue(message);
    }
  }
);

export const techResourcesSlice = createSlice({
  name: "techResources",
  initialState,
  reducers: {
    setResources: (state, action: PayloadAction<TechResource[]>) => {
      state.resources = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch resources
      .addCase(fetchTechResources.fulfilled, (state, action) => {
        state.resources = action.payload;
      })

      // Delete resource
      .addCase(deleteTechResource.fulfilled, (state, action) => {
        state.resources = state.resources.filter(
          (resource) => resource.TECH_ID !== action.payload
        );
      })
      // 使用 matcher 統一處理 pending/fulfilled/rejected 狀態
      .addMatcher(
        isAnyOf(
          fetchTechResources.pending,
          createTechResource.pending,
          updateTechResource.pending,
          deleteTechResource.pending
        ),
        (state) => {
          state.activeRequests += 1;
          if (!state.isLoading) state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(
          fetchTechResources.fulfilled,
          createTechResource.fulfilled,
          updateTechResource.fulfilled,
          deleteTechResource.fulfilled
        ),
        (state) => {
          state.activeRequests -= 1;
          if (state.activeRequests === 0) state.isLoading = false;
        }
      )
      .addMatcher(
        isAnyOf(
          fetchTechResources.rejected,
          createTechResource.rejected,
          updateTechResource.rejected,
          deleteTechResource.rejected
        ),
        (state, action) => {
          state.activeRequests -= 1;
          if (state.activeRequests === 0) state.isLoading = false;
          state.error = action.payload as string;
        }
      );
  },
});

export const { setResources, setLoading, setError, clearError } =
  techResourcesSlice.actions;
export default techResourcesSlice.reducer;
