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
    // 關鍵修復：因為 Docker 環境下 RSC 請求可能遺失 Cookie
    // 所以我們將所有的預取與背景請求 (含 RSC) 都放行，交由帶有 Redux 持久化 Token 的 Client 端處理權限
    if (isBackgroundRequest) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/auth/login", request.nextUrl.origin);
    // 統一參數名稱為 redirect，與 Page 端邏輯對齊
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    loginUrl.searchParams.set("toast", "請先登入");
    loginUrl.searchParams.set("toastType", "error");

    console.log(
      `[Middleware] 攔截未登入請求: ${request.nextUrl.pathname}，執行伺服器重定向`,
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*"],
};
