import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get("token");
  // 直接檢查,不需要 if 判斷
  if (!tokenCookie) {
    const loginUrl = new URL("/auth/login", request.nextUrl.origin);
    loginUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    loginUrl.searchParams.set("toast", "請先登入");
    loginUrl.searchParams.set("toastType", "error");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*", // 匹配 /account 及其所有子路徑
    "/checkout/:path*", // 匹配 /checkout 及其所有子路徑
  ],
};
