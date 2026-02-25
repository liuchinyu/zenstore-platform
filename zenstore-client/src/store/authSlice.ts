import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import AuthService from "@/services/authService";
import { syncCartAfterLogin } from "@/store/cartSlice";
import { LoginCredentials, UserData, CompanyData } from "@/types";

import { setCart } from "@/store/cartSlice";

interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  companyData: CompanyData | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  companyData: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { dispatch }) => {
    try {
      const response = await AuthService.login(credentials);
      let message = "";
      if (response.success === true) {
        try {
          const member_id = response.data.userData.MEMBER_ID;
          // 登入成功後，同步購物車
          const syncCartAfterLoginResponse = await dispatch(
            syncCartAfterLogin(member_id),
          ).unwrap();
          if (
            syncCartAfterLoginResponse?.success &&
            syncCartAfterLoginResponse?.message
          ) {
            message = syncCartAfterLoginResponse.message;
          }
        } catch (syncError) {
          console.error("同步購物車失敗:", syncError);
          // 不阻止登入流程繼續
        }
      }
      if ("data" in response) {
        return {
          success: true,
          userData: response.data.userData,
          data: response.data,
          message: message || "",
        };
      }
      return response;
    } catch (error) {
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await AuthService.logout();
      dispatch(setCart({}));
      if (typeof window !== "undefined") {
        // 為防止因為時序問題，導致在清空購物車尚未完成前，就已經重新導覽的狀況，輔以手動清除
        localStorage.removeItem("persist:cart");
      }
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    setCompanyData: (state, action: PayloadAction<any>) => {
      state.companyData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      const payload = action.payload as any;
      console.log("login_payload", payload);
      if (payload.success && payload.userData) {
        state.user = payload.userData;
        state.isAuthenticated = true;
      }
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.companyData = null;
    });
  },
});

export const { setIsAuthenticated, setUser, setCompanyData } =
  authSlice.actions;
export default authSlice.reducer;
