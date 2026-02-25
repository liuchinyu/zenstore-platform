import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  isAnyOf,
} from "@reduxjs/toolkit";
import NewsService from "@/services/newsService";
import { News, NewsState } from "@/types/news/newsType";

const initialState: NewsState = {
  news: [],
  isLoading: false,
  error: null,
  activeRequests: 0,
};

// 獲取新聞列表
export const fetchNews = createAsyncThunk(
  "news/fetchNews",
  async (_, { rejectWithValue }) => {
    try {
      const response = await NewsService.getNews();
      return response;
    } catch (error) {
      return rejectWithValue("獲取新聞列表失敗");
    }
  }
);

// 創建新聞
export const createNews = createAsyncThunk(
  "news/createNews",
  async (data: News, { rejectWithValue }) => {
    try {
      const response = await NewsService.createNews(data);
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "創建新聞失敗，請稍後再試";
      return rejectWithValue(message);
    }
  }
);

// 更新新聞
export const updateNews = createAsyncThunk(
  "news/updateNews",
  async (
    { id, data }: { id: string; data: Partial<News> },
    { rejectWithValue }
  ) => {
    try {
      const response = await NewsService.updateNews(id, data);
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "更新新聞失敗，請稍後再試";
      return rejectWithValue(message);
    }
  }
);

// 刪除新聞
export const deleteNews = createAsyncThunk(
  "news/deleteNews",
  async (id: string, { rejectWithValue }) => {
    try {
      await NewsService.deleteNews(id);
      return id; // 回傳ID，讓reducer知道要刪除哪個新聞
    } catch (error: any) {
      const message =
        error.response?.data?.message || "刪除新聞失敗，請稍後再試";
      return rejectWithValue(message);
    }
  }
);

export const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    setNews: (state, action: PayloadAction<News[]>) => {
      state.news = action.payload;
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
      // Fetch news
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.news = action.payload;
      })

      // Delete news
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.news = state.news.filter(
          (newsItem) => newsItem.NEWS_ID !== action.payload
        );
      })
      // 使用 matcher 統一處理 pending/fulfilled/rejected 狀態
      .addMatcher(
        isAnyOf(
          fetchNews.pending,
          createNews.pending,
          updateNews.pending,
          deleteNews.pending
        ),
        (state) => {
          state.activeRequests += 1;
          if (!state.isLoading) state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(
          fetchNews.fulfilled,
          createNews.fulfilled,
          updateNews.fulfilled,
          deleteNews.fulfilled
        ),
        (state) => {
          state.activeRequests -= 1;
          if (state.activeRequests === 0) state.isLoading = false;
        }
      )
      .addMatcher(
        isAnyOf(
          fetchNews.rejected,
          createNews.rejected,
          updateNews.rejected,
          deleteNews.rejected
        ),
        (state, action) => {
          state.activeRequests -= 1;
          if (state.activeRequests === 0) state.isLoading = false;
          state.error = action.payload as string;
        }
      );
  },
});

export const { setNews, setLoading, setError, clearError } = newsSlice.actions;
export default newsSlice.reducer;
