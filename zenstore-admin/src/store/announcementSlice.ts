import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  isAnyOf,
} from "@reduxjs/toolkit";
import AnnouncementService from "@/services/announcementService";
import {
  Announcement,
  AnnouncementState,
} from "@/types/announcements/announcementType";

const initialState: AnnouncementState = {
  announcements: [],
  isLoading: false,
  error: null,
  activeRequests: 0,
};

// 獲取公告列表
export const fetchAnnouncements = createAsyncThunk(
  "announcements/fetchAnnouncements",
  async (_, { rejectWithValue }) => {
    try {
      const response = await AnnouncementService.getAnnouncements();
      return response;
    } catch (error) {
      return rejectWithValue("獲取公告列表失敗");
    }
  }
);

// 創建公告
export const createAnnouncement = createAsyncThunk(
  "announcements/createAnnouncement",
  async (data: Announcement, { rejectWithValue }) => {
    try {
      const response = await AnnouncementService.createAnnouncement(data);
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "創建公告失敗，請稍後再試";
      return rejectWithValue(message);
    }
  }
);

// 更新公告
export const updateAnnouncement = createAsyncThunk(
  "announcements/updateAnnouncement",
  async (
    { id, data }: { id: string; data: Partial<Announcement> },
    { rejectWithValue }
  ) => {
    try {
      const response = await AnnouncementService.updateAnnouncement(id, data);
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "更新公告失敗，請稍後再試";
      return rejectWithValue(message);
    }
  }
);

// 刪除公告
export const deleteAnnouncement = createAsyncThunk(
  "announcements/deleteAnnouncement",
  async (id: string, { rejectWithValue }) => {
    try {
      await AnnouncementService.deleteAnnouncement(id);
      return id; // 回傳ID，讓reducer知道要刪除哪個公告
    } catch (error: any) {
      const message =
        error.response?.data?.message || "刪除公告失敗，請稍後再試";
      return rejectWithValue(message);
    }
  }
);

export const announcementSlice = createSlice({
  name: "announcements",
  initialState,
  reducers: {
    setAnnouncements: (state, action: PayloadAction<Announcement[]>) => {
      state.announcements = action.payload;
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
      // Fetch announcements
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.announcements = action.payload;
      })

      // Delete announcement
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.announcements = state.announcements.filter(
          (announcement) => announcement.ANNOUNCEMENTS_ID !== action.payload
        );
      })
      // 使用 matcher 統一處理 pending/fulfilled/rejected 狀態
      .addMatcher(
        isAnyOf(
          fetchAnnouncements.pending,
          createAnnouncement.pending,
          updateAnnouncement.pending,
          deleteAnnouncement.pending
        ),
        (state) => {
          state.activeRequests += 1;
          if (!state.isLoading) state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(
          fetchAnnouncements.fulfilled,
          createAnnouncement.fulfilled,
          updateAnnouncement.fulfilled,
          deleteAnnouncement.fulfilled
        ),
        (state) => {
          state.activeRequests -= 1;
          if (state.activeRequests === 0) state.isLoading = false;
        }
      )
      .addMatcher(
        isAnyOf(
          fetchAnnouncements.rejected,
          createAnnouncement.rejected,
          updateAnnouncement.rejected,
          deleteAnnouncement.rejected
        ),
        (state, action) => {
          state.activeRequests -= 1;
          if (state.activeRequests === 0) state.isLoading = false;
          state.error = action.payload as string;
        }
      );
  },
});

export const { setAnnouncements, setLoading, setError, clearError } =
  announcementSlice.actions;
export default announcementSlice.reducer;
