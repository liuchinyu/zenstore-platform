import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ProductService from "@/services/productService";

interface SearchState {
  searchResults: any[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

const initialState: SearchState = {
  searchResults: [],
  isLoading: false,
  error: null,
  searchQuery: "",
  currentPage: 1,
  totalPages: 1,
  pageSize: 24,
};

export const searchProducts = createAsyncThunk(
  "search/searchProducts",
  async (
    { query, page = 1 }: { query: string; page: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await ProductService.searchProduct(query, page);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearch: (state) => {
      state.searchResults = [];
      state.searchQuery = "";
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload?.items || [];
        state.totalPages = action.payload?.totalPages || 1;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchQuery, clearSearch, setCurrentPage, setSearchResults } =
  searchSlice.actions;
export default searchSlice.reducer;
