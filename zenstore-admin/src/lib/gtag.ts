export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX";

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_TRACKING_ID, {
      page_location: url,
    });
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value?: number;
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// 後台管理系統特定事件追蹤
export const adminLogin = (userId: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "admin_login", {
      event_category: "admin",
      event_label: "login",
      user_id: userId,
    });
  }
};

export const adminAction = (
  action: string,
  resource: string,
  details?: string
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "admin_action", {
      event_category: "admin",
      event_label: action,
      resource: resource,
      details: details,
    });
  }
};

export const productManagement = (
  action: "create" | "update" | "delete",
  productId: string
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "product_management", {
      event_category: "admin",
      event_label: action,
      product_id: productId,
    });
  }
};

export const orderManagement = (
  action: "view" | "update_status" | "cancel",
  orderId: string
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "order_management", {
      event_category: "admin",
      event_label: action,
      order_id: orderId,
    });
  }
};

export const userManagement = (
  action: "view" | "block" | "unblock",
  userId: string
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "user_management", {
      event_category: "admin",
      event_label: action,
      user_id: userId,
    });
  }
};
