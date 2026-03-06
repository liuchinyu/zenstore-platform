import { configureStore, combineReducers } from "@reduxjs/toolkit";
import type { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { OrderState } from "./orderSlice";

// 核心 reducers
import headerReducer from "./headerSlice";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import toastReducer from "./toastSlice";
import wishlistReducer from "./wishlistSlice";

//單獨配置持久化
const cartPersistConfig = {
  key: "cart",
  storage,
  whitelist: ["items", "cartTotal"], //只持久化必要的資料
  blacklist: ["isLoading", "error", "showCartModal", "animatingItems"],
};

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "isAuthenticated", "companyData"],
  // blacklist: ["companyData"], // 如果 companyData 過大或不需要持久化
};

//不同 reducer 配置持久化
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// 保存已注冊的動態 reducers
const asyncReducers: Record<string, any> = {};

// 創建 rootReducer 函數
const createRootReducer = (asyncReducers: Record<string, any> = {}) => {
  return combineReducers({
    header: headerReducer,
    auth: persistedAuthReducer, // 使用持久化的 auth reducer
    cart: persistedCartReducer, // 使用持久化的 cart reducer
    toast: toastReducer,
    wishlist: wishlistReducer,
    ...asyncReducers,
  });
};

// 確保 store 和 persistor 是單例（只初始化一次）
let storeInstance: ReturnType<typeof configureStore> | undefined = undefined;
let persistorInstance: ReturnType<typeof persistStore> | undefined = undefined;

// 只在第一次調用時創建 store 和 persistor
if (!storeInstance) {
  console.log("[Store] 初始化 store 和 persistor");
  const rootReducer = createRootReducer();
  storeInstance = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
  persistorInstance = persistStore(storeInstance);
  console.log("[Store] Store 和 persistor 初始化完成");
} else {
  console.log("[Store] 使用已存在的 store 實例");
}

export const store = storeInstance!;
export const persistor = persistorInstance!;

//  關鍵修復3: 簡化動態 reducer 注入
export const injectReducer = (key: string, reducer: any) => {
  console.log(`[InjectReducer] 嘗試注入 reducer: ${key}`);
  if (asyncReducers[key]) {
    console.log(`[InjectReducer] ${key} 已經存在，跳過`);
    return; //若已經載入則return
  }

  // 不允許覆蓋核心 reducers（已做 persist）
  const staticKeys = new Set(["header", "auth", "cart", "toast"]);
  if (staticKeys.has(key)) return;

  asyncReducers[key] = reducer; //將 reducer 注入到 asyncReducers

  // 重新創建 rootReducer
  const newRootReducer = createRootReducer(asyncReducers);
  store.replaceReducer(newRootReducer as any); //動態注入使用as any
};

export type RootState = ReturnType<typeof store.getState>;
export type ExtendedRootState = RootState & {
  auth?: ReturnType<typeof persistedAuthReducer>;
  cart?: ReturnType<typeof persistedCartReducer>;
  header: ReturnType<typeof headerReducer>;
  toast?: ReturnType<typeof toastReducer>;
  search?: any;
  homeProduct?: any;
  wishlist?: any;
  checkout?: any;
  orders?: OrderState;
  products?: any;
  content?: any;
};
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
