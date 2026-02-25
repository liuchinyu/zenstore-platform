// 等待動畫文字映射
export const getLoadingText = (href: string): string => {
  // 移除查詢參數和錨點
  const path = href.split("?")[0].split("#")[0];

  // 根據路徑返回對應的等待文字
  const loadingTexts: Record<string, string> = {
    // 首頁
    "/": "正在載入首頁...",

    // 產品相關
    "/products": "正在載入產品列表...",
    "/products/search": "正在載入搜尋結果...",

    // 帳號相關
    "/account": "正在載入帳號中心...",
    "/account/profile": "正在載入帳號資料...",
    "/account/addresses": "正在載入收貨人資料...",
    "/account/orders": "正在載入訂購記錄...",
    "/account/wishlist": "正在載入收藏清單...",
    "/account/coupons": "正在載入優惠券...",
    "/account/updatePassword": "正在載入修改密碼...",

    // 購物車相關
    "/cart": "正在載入購物車...",
    "/checkout": "正在載入結帳頁面...",
    "/checkout/confirm": "正在載入訂單確認...",
    "/checkout/payment": "正在載入付款頁面...",

    // 登入相關
    "/auth/login": "正在載入登入頁面...",
    "/auth/register": "正在載入註冊頁面...",
    "/auth/forgot-password": "正在載入忘記密碼...",

    // 其他頁面
    "/announcements": "正在載入公告訊息...",
    "/manufacture": "正在載入製造商...",
  };

  // 精確匹配
  if (loadingTexts[path]) {
    return loadingTexts[path];
  }

  // 動態路由匹配
  if (path.startsWith("/products/") && path !== "/products/search") {
    return "正在載入產品詳情...";
  }

  if (path.startsWith("/account/orders/")) {
    return "正在載入訂單詳情...";
  }

  if (path.startsWith("/announcements/")) {
    return "正在載入公告詳情...";
  }

  if (path.startsWith("/auth/")) {
    return "正在載入驗證頁面...";
  }

  // 預設文字
  return "載入中...";
};
