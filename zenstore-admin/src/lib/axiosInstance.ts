// API 實例設定（全 CSR 後台版本）

import axios from "axios";

// 因為 zenstore-admin 所有頁面均為 'use client' (純 CSR)
// 所以統一使用瀏覽器看得到的公開網址，不需要判斷 Server/Client 環境
// 這可避免 Next.js 預渲染時發起無謂的 SSR 連線，影響載入效能
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/admin",
  timeout: 10000,
});

// // 未來若需要 Authorization Token，可在此啟用攔截器
// axiosInstance.interceptors.request.use((config) => {
//   if (typeof window !== "undefined") {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   }
//   return config;
// });

export default axiosInstance;
