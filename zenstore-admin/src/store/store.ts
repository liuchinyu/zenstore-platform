import { configureStore } from "@reduxjs/toolkit";

import categoryReducer from "./categorySlice";
import productReducer from "./productSlice";
import tagReducer from "./tagSlice";
import memberReducer from "./memberSlice";
import orderReducer from "./orderSlice";
import techResourcesReducer from "./techResourcesSlice";
import carouselReducer from "./carouselSlice";
import newsReducer from "./newsSlice";
import announcementReducer from "./announcementSlice";
import marqueeReducer from "./marqueeSlice";
import storeInfoReducer from "./storeInfoSlice";
import { memberApi } from "./api/memberApi";

export const store = configureStore({
  reducer: {
    category: categoryReducer,
    product: productReducer,
    tag: tagReducer,
    member: memberReducer,
    order: orderReducer,
    techResources: techResourcesReducer,
    carousel: carouselReducer,
    news: newsReducer,
    announcements: announcementReducer,
    marquee: marqueeReducer,
    storeInfo: storeInfoReducer,
    [memberApi.reducerPath]: memberApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(memberApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
