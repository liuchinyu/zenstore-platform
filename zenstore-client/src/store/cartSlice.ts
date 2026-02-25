import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CartItem, CartState, AddToCartRequest } from "@/types";
import CartService from "@/services/cartService";

const initialState: CartState = {
  items: {}, //儲存購物車相關資料，如品牌、價格等等
  items_request: {}, //僅儲存oracle_id、數量欄位，發送API
  isLoading: false,
  error: null,
  showCartModal: false,
  cartTotal: 0,
  animatingItems: [],
};
// 登入後合併購物車
export const syncCartAfterLogin = createAsyncThunk(
  "cart/syncCartAfterLogin",
  async (member_id: string, { getState }) => {
    // 1. 取得用戶 DB 中的購物車
    const cartResponse = await CartService.getUserCart(member_id);
    // 2. 取得目前 Redux (Local) 的購物車
    const state: any = getState();
    const localCart: { [key: string]: any } = {
      ...(state?.cart?.items || {}),
    };
    // 3. 執行合併邏輯
    if (cartResponse.success && cartResponse.data) {
      const dbCartItems = cartResponse.data;

      // 遍歷 DB 購物車項目
      for (const dbItem of dbCartItems) {
        const matchingLocalItem = localCart[dbItem.ORACLE_ID];
        if (matchingLocalItem) {
          // 如果 Local 也有，數量相加
          dbItem.QUANTITY += matchingLocalItem.QUANTITY;
        }
        // 更新 Local Cart
        localCart[dbItem.ORACLE_ID] = {
          ...dbItem,
        };
      }
      // 將合併後的結果寫回 DB
      try {
        let forceSyncCartResponse = await CartService.forceSyncCart(
          member_id,
          localCart,
        );
        if (forceSyncCartResponse?.success && forceSyncCartResponse?.data) {
          const itemsMap: { [key: string]: CartItem } = {};
          forceSyncCartResponse.data.forEach((item: CartItem) => {
            itemsMap[item.ORACLE_ID] = item;
          });
          return {
            success: true,
            data: itemsMap,
            message: forceSyncCartResponse?.overValueMessage || "",
          };
        }
      } catch (error) {
        console.error("同步購物車失敗", error);
      }
    }
    return localCart;
  },
);

// 取得資料庫的購物車資料
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (member_id: string) => {
    const response = await CartService.getUserCart(member_id);
    return response;
  },
);

// 批量加入購物車
export const addBatchToCartAsync = createAsyncThunk(
  "cart/addBatchToCartAsync",
  async (params: { items: AddToCartRequest[]; member_id?: string }) => {
    const { items, member_id } = params;

    // ✅ 直接傳遞 AddToCartRequest[]，由 Service 層統一處理格式轉換
    if (member_id) {
      const data = await CartService.addToUserCart(member_id, items);
      return data;
    }
    const data = await CartService.addToGuestCart(items);
    return data;
  },
);

// 將購物車寫入DB(已登入)
export const addToCartAsync = createAsyncThunk(
  "cart/addToCartAsync",
  async (params: { cartItem: AddToCartRequest; member_id: string }) => {
    const { cartItem, member_id } = params;

    // ✅ 直接傳遞 AddToCartRequest，由 Service 層統一處理格式轉換
    const data = await CartService.addToUserCart(member_id, [cartItem]);
    return data;
  },
);

// 訪客串聯購物車資訊
export const addToGuestCartAsync = createAsyncThunk(
  "cart/addToGuestCartAsync",
  async (items: AddToCartRequest) => {
    // ✅ 直接傳遞 AddToCartRequest，由 Service 層統一處理格式轉換
    const data = await CartService.addToGuestCart([items]);
    return data;
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    //removeFromCart:移除購物車指定商品
    removeFromCart: (state, action: PayloadAction<string>) => {
      delete state.items[action.payload];
    },
    setCart: (state, action: PayloadAction<{ [key: string]: CartItem }>) => {
      state.items = action.payload;
    },
    clearCart: (state) => {
      state.items = {};
    },
    // 開啟購物車Modal
    toggleCartModal: (state) => {
      state.showCartModal = !state.showCartModal;
    },
    setCartTotal: (state, action: PayloadAction<number>) => {
      state.cartTotal = action.payload;
    },
    // 設定購物車加入動畫
    setAnimatingItems: (
      state,
      action: PayloadAction<
        { id: string; left: number; top: number; image_url: string }[]
      >,
    ) => {
      state.animatingItems = action.payload;
    },
    clearAnimatingItems: (state) => {
      state.animatingItems = [];
    },
  },
  extraReducers: (builder) => {
    // 取得使用者購物車資料
    builder.addCase(fetchCart.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      if (action.payload.success && action.payload.data) {
        // 將陣列轉換為以 oracle_id 為 key 的物件
        const itemsMap: { [key: string]: CartItem } = {};
        action.payload.data.forEach((item: CartItem) => {
          itemsMap[item.ORACLE_ID] = item;
        });
        state.items = itemsMap;
      }
      state.isLoading = false;
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Error fetching cart";
    });
    // 儲存使用者購物車資料
    builder.addCase(addToCartAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addToCartAsync.fulfilled, (state, action) => {
      if (action.payload.success && action.payload.data) {
        // 將陣列轉換為以 oracle_id 為 key 的物件
        action.payload.data.forEach((item: CartItem) => {
          state.items[item.ORACLE_ID] = item;
        });
      }
      state.isLoading = false;
    });
    builder.addCase(addToCartAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Error fetching cart";
    });
    // 訪客取得購物車資料
    builder.addCase(addToGuestCartAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addToGuestCartAsync.fulfilled, (state, action) => {
      if (action.payload && action.payload.data) {
        const itemsMap: { [key: string]: CartItem } = {};
        action.payload.data.forEach((item: CartItem) => {
          itemsMap[item.ORACLE_ID] = item;
        });
        // 合併到現有購物車
        state.items = { ...state.items, ...itemsMap };
      }
      state.isLoading = false;
    });
    builder.addCase(addToGuestCartAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Error adding to guest cart";
    });
    // 處理合併完成後的狀態更新
    builder.addCase(syncCartAfterLogin.fulfilled, (state, action) => {
      state.items = action.payload.data; // 直接更新 Store
      state.isLoading = false;
    });
    // 處理批次加入購物車
    builder.addCase(addBatchToCartAsync.fulfilled, (state, action) => {
      console.log("action.payload", action.payload);
      const itemsMap: { [key: string]: CartItem } = {};
      if (action.payload.success && action.payload.data) {
        action.payload.data.forEach((item: CartItem) => {
          itemsMap[item.ORACLE_ID] = item;
        });
      }
      state.items = itemsMap;
      state.isLoading = false;
    });
  },
});

export const {
  removeFromCart,
  setCart,
  clearCart,
  toggleCartModal,
  setCartTotal,
  setAnimatingItems,
  clearAnimatingItems,
} = cartSlice.actions;
export default cartSlice.reducer;
