import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface HomeProductState {
  currentPosition: number;
  cardWidth: number;
  isMobile: boolean;
}

const initialState: HomeProductState = {
  currentPosition: 0,
  cardWidth: 0,
  isMobile: false,
};

const homeProductSlice = createSlice({
  name: "homeProduct",
  initialState,
  reducers: {
    setCurrentPosition: (state, action: PayloadAction<number>) => {
      state.currentPosition = action.payload;
    },
    setCardWidth: (state, action: PayloadAction<number>) => {
      state.cardWidth = action.payload;
    },
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
    },
  },
});

export const { setCurrentPosition, setCardWidth, setIsMobile } =
  homeProductSlice.actions;
export default homeProductSlice.reducer;
