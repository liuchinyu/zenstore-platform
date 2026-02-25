# ZenStore Client 前台購物系統 - 專案總覽 (Project Overview)

## 1. 專案簡介

**ZenStore Client** 是一個基於 **Next.js 15** 構建的高性能電商前台系統。本系統致力於提供流暢、直觀且回應式（Responsive）的購物體驗。使用者可以透過本系統輕鬆瀏覽商品、管理購物車、進行安全結帳，並在個人中心追蹤訂單狀態與維護會員資料。

## 2. 核心技術棧

本專案採用現代前端技術開發，確保極致的用戶體驗與 SEO 優化：

- **前端框架**: [Next.js 15](https://nextjs.org/) (App Router)
- **程式語言**: [TypeScript](https://www.typescriptlang.org/)
- **UI 框架**: [Bootstrap 5](https://getbootstrap.com/) + [Bootstrap Icons](https://icons.getbootstrap.com/)
- **狀態管理**: [Redux Toolkit](https://redux-toolkit.js.org/) & [Redux Persist](https://github.com/rt2zz/redux-persist) (持久化購物車與登入狀態)
- **資料請求**: [Axios](https://axios-http.com/)
- **樣式處理**: [SASS/SCSS](https://sass-lang.com/) (自定義主題與模組化樣式)
- **動畫與滑動**: [Swiper](https://swiperjs.com/) & [Slick-carousel](https://kenwheeler.github.io/slick/) (用於 Banner 與商品輪播)
- **表單處理**: [React Hook Form](https://react-hook-form.com/)
- **日期處理**: [date-fns](https://date-fns.org/)

## 3. 目錄結構分析

專案採用清晰的模組化結構，將業務邏輯與介面組件有效分離：

```text
src/
├── app/                # Next.js 頁面路由與佈局 (App Router)
│   ├── (auth)/         # 認證模組 (登入、註冊、忘記密碼)
│   ├── products/       # 商品瀏覽模組 (分類篩選、商品詳情)
│   ├── cart/           # 購物車管理頁面
│   ├── checkout/       # 結帳流程模組 (收件資訊、付款確認)
│   ├── account/        # 會員中心 (個人資料、地址簿、訂單紀錄、收藏夾)
│   ├── announcements/  # 系統公告與消息模組
│   └── page.tsx        # 首頁 (動態 Banner、熱銷推薦、品牌牆)
├── components/         # 可複用 UI 組件 (NavBar, Footer, ProductCard, Carousel)
├── services/           # API 服務封裝 (與後端通訊的單一入口)
├── store/              # Redux 狀態中心 (Slices, Selectors & Persist Config)
├── hooks/              # 自定義 React Hooks (useAuth, useCart, useDynamicReducer)
├── styles/             # 全域 SCSS 與 Bootstrap 變數自定義
├── types/              # TypeScript 介面與類型定義
└── utils/              # 通用庫與工具函式 (格式化、驗證)
```

## 4. 核心功能模組

### 4.1 首頁與視覺體驗 (Home & UX)

- **動態跑馬燈 (Marquee)**: 即時顯示最新優惠訊息。
- **視覺輪播 (Carousel)**: 支援手勢觸控的高清品牌 Banner 展示。
- **導覽與搜尋**: 動態商品分類導覽與全站快速關鍵字搜尋。

### 4.2 商品瀏覽與搜尋 (Product Catalog)

- **多維度篩選**: 支援按分類、標籤及關鍵字進行商品交叉檢索。
- **動態展示**: 包含熱銷 (Hot)、新品 (New) 與特價 (Sale) 等動態商品牆。
- **詳情呈現**: 整合商品圖庫、詳細規格、型號選擇與動態庫存顯示。

### 4.3 購物車與結帳 (Cart & Checkout)

- **持久化購物車**: 使用 Redux Persist 確保跨頁面甚至是重啟瀏覽器後購物車內容不丟失。
- **即時結算**: 動態計算商品小計、稅金、運費與最終總額。
- **結帳流程**: 整合常用收件地址選擇、付款方式確認與訂單摘要審核。

### 4.4 個人化中心 (Member Center)

- **訂單管理**: 追蹤所有歷史訂單詳細狀態與物流進度。
- **地址簿管理**: 支援多組收件地址維護，優化結帳體驗。
- **收藏清單 (Wishlist)**: 收藏喜愛商品，方便後續隨時購入。
- **帳戶設定**: 提供個人資料更新、密碼變更等安全維護功能。

## 5. 開發規範與架構設計

### 5.1 API 服務層封裝 (Service Layer)

所有的外部 API 通訊均封裝於 `src/services` 目錄下，採用 Axios 單例模式，確保請求的一致性與錯誤處置：

- `authService.ts`: 負責認證、權限驗證與 Token 管理。
- `productService.ts`: 負責所有商品資料的撈取。
- `cartService.ts` / `orderService.ts`: 處理核心購物邏輯與訂單提交。

### 5.2 狀態管理 (Redux Toolkit)

系統以 Redux 作為 Single Source of Truth。透過 `Slices` 管理狀態，並利用 `useDynamicReducer` hook 實現組件層級的 Reducer 動態加載，有效減少初始 Bundle Size。

### 5.3 回應式介面設計 (RWD & UI)

- **全面適配**: 嚴格遵循 Bootstrap 5 的網格系統，確保系統從 320px 手機到 2K 螢幕皆有極佳呈現。
- **互動反饋**: 包含骨架屏 (Skeleton)、加載動畫與即時 Toast 提示，確保系統操作的「高回應性」。

## 6. 版本與維護

- **版本**: 0.1.0
- **最新更新日期**: 2026-02-10
