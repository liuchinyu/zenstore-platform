"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import AuthService from "@/services/authService";
import { setCompanyData, setIsAuthenticated, setUser } from "@/store/authSlice";
import { setCart } from "@/store/cartSlice";

const AuthInitializer = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(
    (state) => state.auth?.isAuthenticated,
  );
  const user = useAppSelector((state) => state.auth?.user);
  const companyData = useAppSelector((state) => state.auth?.companyData); // 新增：讀取公司資料

  useEffect(() => {
    // 只有在沒有用戶數據的情況下才進行 API 請求檢查
    const checkAuthStatus = async () => {
      const isEnterprise = user?.MEMBER_TYPE === "企業會員";
      const needsCompany =
        isEnterprise && (!companyData || companyData.length === 0);

      // 如果已有身份驗證數據且有用戶信息，則不需要再次驗證
      if (isAuthenticated && user && !needsCompany) {
        return;
      }

      try {
        const response = await AuthService.getCurrentUser();
        if (response.success) {
          dispatch(setIsAuthenticated(true));
          dispatch(setUser(response.data.userData));
          if (response.data.userData.MEMBER_TYPE === "企業會員") {
            const companyData = await AuthService.getCompanyData(
              response.data.userData.MEMBER_ID,
            );
            dispatch(setCompanyData(companyData.data.companyData.rows));
          }
        } else {
          // 如果 API 返回未登入，但本地狀態是已登入，則更新狀態
          if (isAuthenticated) {
            dispatch(setIsAuthenticated(false));
            dispatch(setUser(null));
          }
        }
      } catch (error) {
        console.log("檢查登入狀態失敗", error);
        // 發生錯誤時，假設未登入
        dispatch(setIsAuthenticated(false));
        dispatch(setUser(null));
      }
    };

    checkAuthStatus();
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    const handleUnauthorized = () => {
      // ✅ 核心邏輯：只有原本是「登入狀態」但收到 401 時，才視為過期並跳轉
      if (isAuthenticated) {
        console.log("🔒 偵測到登入狀態過期，執行重導向");

        const currentPath = window.location.pathname;
        // 避免在登入/註冊頁面執行
        if (
          !currentPath.includes("/auth/login") &&
          !currentPath.includes("/auth/register")
        ) {
          window.location.href = `/auth/login?redirectedFrom=${encodeURIComponent(
            currentPath,
          )}&toast=${encodeURIComponent(
            "登入已過期，請重新登入",
          )}&toastType=error`;
        }
        // 只有「原本已登入」的用戶登出，才清空購物車資料
        // 訪客不應受此影響，避免 Redux Persist 的本地購物車被誤刪
        dispatch(setCart({}));
        // localStorage.removeItem("persist:cart");
      }
      // 無論如何，確保前端狀態與後端一致（清空狀態）
      dispatch(setIsAuthenticated(false));
      dispatch(setUser(null));
      dispatch(setCompanyData(null));
      AuthService.clearUserDataCache(); //清空 API 快取
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [dispatch, isAuthenticated]);

  return null; // 這個組件不渲染任何內容
};

export default AuthInitializer;
