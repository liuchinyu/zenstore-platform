// GA4 為 gtag 添加類型定義
declare global {
  interface Window {
    gtag: (
      command: "config" | "event",
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

// GA4 追蹤設定和函數
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "";

// 檢查 GA4 是否可用
export const isGAEnabled = () => {
  return typeof window !== "undefined" && GA_TRACKING_ID && window.gtag;
};

// 頁面瀏覽追蹤
export const pageview = (url: string) => {
  if (!isGAEnabled()) return;

  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

// 自定義事件追蹤
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (!isGAEnabled()) return;

  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// 電商相關追蹤函數
export const trackProductView = (
  productId: string,
  productName: string,
  category: string,
  price?: number
) => {
  event({
    action: "view_item",
    category: "ecommerce",
    label: `${productId} - ${productName}`,
  });

  // 產品瀏覽事件
  if (isGAEnabled()) {
    window.gtag("event", "view_item", {
      currency: "TWD",
      value: price,
      items: [
        {
          item_id: productId,
          item_name: productName,
          item_category: category,
          price: price,
          currency: "TWD",
        },
      ],
    });
  }
};

export const trackAddToCart = (
  productId: string,
  productName: string,
  category: string,
  price: number,
  quantity: number
) => {
  event({
    action: "add_to_cart",
    category: "ecommerce",
    label: `${productId} - ${productName}`,
    value: price * quantity,
  });

  // 加入購物車事件
  if (isGAEnabled()) {
    window.gtag("event", "add_to_cart", {
      currency: "TWD",
      value: price * quantity,
      items: [
        {
          item_id: productId,
          item_name: productName,
          item_category: category,
          price: price,
          quantity: quantity,
          currency: "TWD",
        },
      ],
    });
  }
};

export const trackPurchase = (
  transactionId: string,
  value: number,
  items: Array<{
    item_id: string;
    item_name: string;
    item_category: string;
    price: number;
    quantity: number;
  }>
) => {
  event({
    action: "purchase",
    category: "ecommerce",
    label: transactionId,
    value: value,
  });

  // 購買完成事件
  if (isGAEnabled()) {
    window.gtag("event", "purchase", {
      transaction_id: transactionId,
      value: value,
      currency: "TWD",
      items: items.map((item) => ({
        ...item,
        currency: "TWD",
      })),
    });
  }
};

// 搜尋追蹤
export const trackSearch = (searchTerm: string) => {
  event({
    action: "search",
    category: "engagement",
    label: searchTerm,
  });
};

// 表單提交追蹤
export const trackFormSubmit = (formName: string) => {
  event({
    action: "form_submit",
    category: "engagement",
    label: formName,
  });
};

// 點擊追蹤
export const trackClick = (
  elementName: string,
  category: string = "engagement"
) => {
  event({
    action: "click",
    category: category,
    label: elementName,
  });
};
