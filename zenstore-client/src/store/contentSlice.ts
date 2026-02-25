import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import { ContentState } from "@/types/content";
import ContentService from "@/services/contentService";

const initialState: any = {
  techResources: [],
  carousel: [],
  storeInfo: [],
  news: [],
  announcements: [],
  marquee: [],
  marqueeLoading: false,
  techResourcesLoading: false,
  carouselLoading: false,
  storeInfoLoading: false,
  newsLoading: false,
  announcementsLoading: false,
  error: null,
};

export const fetchTechResources = createAsyncThunk(
  "content/fetchTechResources",
  async () => {
    const response = await ContentService.fetchTechResources();
    return response;
  },
  {
    condition: (_, { getState }) => {
      const state: any = getState();
      const d = state?.content;
      const hasData =
        Array.isArray(d?.techResources) && d.techResources.length > 0;
      if (d?.techResourcesLoading || hasData) return false;
      return true;
    },
  },
);

export const fetchCarousel = createAsyncThunk(
  "content/fetchCarousel",
  async () => {
    const response = await ContentService.fetchCarousel();
    return response;
  },
  {
    condition: (_, { getState }) => {
      const state: any = getState();
      const d = state?.content;
      const hasData = Array.isArray(d?.carousel) && d.carousel.length > 0;
      if (d?.carouselLoading || hasData) return false;
      return true;
    },
  },
);

export const fetchNews = createAsyncThunk(
  "content/fetchNews",
  async () => {
    const response = await ContentService.fetchNews();
    return response;
  },
  {
    condition: (_, { getState }) => {
      const state: any = getState();
      const d = state?.content;
      const hasData = Array.isArray(d?.news) && d.news.length > 0;
      if (d?.newsLoading || hasData) return false;
      return true;
    },
  },
);

export const fetchAnnouncements = createAsyncThunk(
  "content/fetchAnnouncements",
  async () => {
    const response = await ContentService.fetchAnnouncements();
    return response;
  },
  {
    condition: (_, { getState }) => {
      const state: any = getState();
      const d = state?.content;
      const hasData =
        Array.isArray(d?.announcements) && d.announcements.length > 0;
      if (d?.announcementsLoading || hasData) return false;
      return true;
    },
  },
);

export const fetchMarquee = createAsyncThunk(
  "content/fetchMarquee",
  async () => {
    const response = await ContentService.fetchMarquee();
    return response;
  },
  {
    condition: (_, { getState }) => {
      const state: any = getState();
      const d = state?.content;
      const hasData = Array.isArray(d?.marquee) && d.marquee.length > 0; // 修正這行
      if (d?.marqueeLoading || hasData) return false;
      return true;
    },
  },
);

export const fetchStoreInfo = createAsyncThunk(
  "content/fetchStoreInfo",
  async () => {
    const response = await ContentService.fetchStoreInfo();
    return response;
  },
  {
    condition: (_, { getState }) => {
      const state: any = getState();
      const d = state?.content;
      const hasData = Array.isArray(d?.storeInfo) && d.storeInfo.length > 0;
      if (d?.storeInfoLoading || hasData) return false;
      return true;
    },
  },
);

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTechResources.pending, (state) => {
      state.techResourcesLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTechResources.fulfilled, (state, action) => {
      state.techResources = action.payload;
      state.techResourcesLoading = false;
    });
    builder.addCase(fetchTechResources.rejected, (state, action) => {
      state.techResourcesLoading = false;
      state.error = action.error.message || "Error fetching tech resources";
    });
    builder.addCase(fetchCarousel.pending, (state) => {
      state.carouselLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCarousel.fulfilled, (state, action) => {
      state.carousel = action.payload;
      state.carouselLoading = false;
    });
    builder.addCase(fetchCarousel.rejected, (state, action) => {
      state.carouselLoading = false;
      state.error = action.error.message || "Error fetching carousel";
    });
    builder.addCase(fetchStoreInfo.pending, (state) => {
      state.storeInfoLoading = true;
      state.error = null;
    });
    builder.addCase(fetchStoreInfo.fulfilled, (state, action) => {
      state.storeInfo = action.payload;
      state.storeInfoLoading = false;
    });
    builder.addCase(fetchStoreInfo.rejected, (state, action) => {
      state.storeInfoLoading = false;
      state.error = action.error.message || "Error fetching StoreInfo";
    });
    builder.addCase(fetchNews.pending, (state) => {
      state.newsLoading = true;
      state.error = null;
    });
    builder.addCase(fetchNews.fulfilled, (state, action) => {
      state.news = action.payload;
      state.newsLoading = false;
    });
    builder.addCase(fetchNews.rejected, (state, action) => {
      state.newsLoading = false;
      state.error = action.error.message || "Error fetching news";
    });
    builder.addCase(fetchAnnouncements.pending, (state) => {
      state.announcementsLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAnnouncements.fulfilled, (state, action) => {
      state.announcements = action.payload;
      state.announcementsLoading = false;
    });
    builder.addCase(fetchAnnouncements.rejected, (state, action) => {
      state.announcementsLoading = false;
      state.error = action.error.message || "Error fetching announcements";
    });
    builder.addCase(fetchMarquee.pending, (state) => {
      state.marqueeLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMarquee.fulfilled, (state, action) => {
      state.marquee = action.payload;
      state.marqueeLoading = false;
    });
    builder.addCase(fetchMarquee.rejected, (state, action) => {
      state.marqueeLoading = false;
      state.error = action.error.message || "Error fetching marquee";
    });
  },
});

export default contentSlice.reducer;
