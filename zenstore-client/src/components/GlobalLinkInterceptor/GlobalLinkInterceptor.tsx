// "use client";

// import React, { useCallback, useEffect } from "react";
// import { useGlobalLoading } from "@/hooks/useGlobalLoading";
// import { getLoadingText } from "@/utils/loadingTexts";

// const GlobalLinkInterceptor: React.FC = () => {
//   const { navigateWithLoading } = useGlobalLoading();

//   const getCurrentRelativeHref = useCallback((): string => {
//     console.log("window.location", window.location);
//     if (typeof window !== "undefined" && window.location) {
//       return `${window.location.pathname}${window.location.search}${window.location.hash}`;
//     }
//     return "";
//   }, []);

//   const toRelative = useCallback((input: string): string => {
//     if (typeof window === "undefined") return input;
//     try {
//       const url = new URL(input, window.location.origin);
//       return `${url.pathname}${url.search}${url.hash}`;
//     } catch {
//       return input;
//     }
//   }, []);

//   const isSameRoute = useCallback(
//     (href: string) => {
//       const current = getCurrentRelativeHref();
//       const next = toRelative(href);
//       return current === next;
//     },
//     [getCurrentRelativeHref, toRelative]
//   );

//   useEffect(() => {
//     const handleLinkClick = (event: MouseEvent) => {
//       const target = event.target as HTMLElement;
//       const link = target.closest("a[href]") as HTMLAnchorElement;
//       console.log("link", link);

//       if (!link) return;

//       const href = link.getAttribute("href");
//       if (!href) return;

//       // 排除外部/特殊連結
//       if (
//         href.startsWith("http") ||
//         href.startsWith("mailto:") ||
//         href.startsWith("tel:") ||
//         href.startsWith("#") ||
//         href.startsWith("javascript:") ||
//         link.hasAttribute("data-no-loading") ||
//         link.target === "_blank" ||
//         link.classList.contains("no-loading") ||
//         link.closest(".no-loading")
//       ) {
//         return;
//       }

//       // 排除已經是 LoadingLink 的連結
//       if (link.hasAttribute("data-loading-link")) {
//         return;
//       }

//       // 若同一路由，讓瀏覽器預設行為處理（不顯示 Loading、不阻止）
//       if (isSameRoute(href)) {
//         return;
//       }

//       // 阻止預設行為，交由 navigateWithLoading 統一處理
//       event.preventDefault();

//       const loadingText = getLoadingText(href);
//       navigateWithLoading(href, loadingText);
//     };

//     document.addEventListener("click", handleLinkClick, true);
//     return () => {
//       document.removeEventListener("click", handleLinkClick, true);
//     };
//   }, [navigateWithLoading, isSameRoute]);

//   return null;
// };

// export default GlobalLinkInterceptor;
