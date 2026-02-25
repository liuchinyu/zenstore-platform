// "use client";
// import { jwtDecode } from "jwt-decode";

// export interface JwtPayload {
//   // 根據您的token結構定義相應的類型
//   sub?: string; // 用戶ID
//   email?: string;
//   name?: string;
//   role?: string;
//   iat?: number; // 簽發時間
//   exp?: number; // 過期時間
//   [key: string]: any; // 其他可能的字段
// }

// /**
//  * 從cookie中獲取JWT token並解析其中的數據
//  * @returns 解析後的token數據
//  */
// export function getTokenData(): JwtPayload | null {
//   if (typeof window === "undefined") {
//     return null;
//   }

//   try {
//     // 從document.cookie中獲取token
//     const cookieString = document.cookie;
//     const tokenMatch = cookieString.match(/token=([^;]+)/);

//     if (!tokenMatch) {
//       return null;
//     }

//     const token = tokenMatch[1];
//     const decodedToken = jwtDecode<JwtPayload>(token);

//     return decodedToken;
//   } catch (error) {
//     console.error("解析token失敗:", error);
//     return null;
//   }
// }

// /**
//  * 獲取token的過期時間
//  * @returns 過期時間的時間戳(秒)
//  */
// export function getTokenExpiration(): number | null {
//   const tokenData = getTokenData();
//   return tokenData?.exp || null;
// }

// /**
//  * 檢查token是否過期
//  * @returns 是否過期
//  */
// export function isTokenExpired(): boolean {
//   const exp = getTokenExpiration();
//   if (!exp) return true;

//   // 將秒轉換為毫秒並與當前時間比較
//   return Date.now() >= exp * 1000;
// }
