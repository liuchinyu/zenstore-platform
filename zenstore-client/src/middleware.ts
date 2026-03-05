import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get("token");

  // 增強版檢查：是否為 Next.js 內部機制發出的請求
  // 1. 標準 Prefetch 標頭
  const isStandardPrefetch =
    request.headers.get("x-middleware-prefetch") ||
    request.headers.get("next-router-prefetch") ||
    request.headers.get("purpose") === "prefetch";

  // 2. Client-side Navigation 發出的 RSC (React Server Component) 請求
  // 當 Next.js 客戶端路由嘗試獲取新頁面的 payload 時，會帶有 rsc: 1
  const isRscRequest = request.headers.get("rsc") === "1";

  // 3. 識別是否為 AJAX/Fetch 請求 (sec-fetch-dest: empty)
  const isAjaxRequest = request.headers.get("sec-fetch-dest") === "empty";

  // 只要符合任何一種「非直接導航」的內部請求特徵，我們都把它視為預取或資料載入
  const isBackgroundRequest =
    isStandardPrefetch || isRscRequest || isAjaxRequest;

  if (!tokenCookie) {
    if (isBackgroundRequest) {
      // 對於所有的背景/預取請求，不執行跳轉，直接放行給 React 組件處理
      // 這樣才不會因為 307 Redirect 破壞 Client Router 的狀態
      return NextResponse.next();
    }

    const loginUrl = new URL("/auth/login", request.nextUrl.origin);
    loginUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    loginUrl.searchParams.set("toast", "請先登入");
    loginUrl.searchParams.set("toastType", "error");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*"],
};
