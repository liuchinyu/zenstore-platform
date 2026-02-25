# ZenStore Admin 後台管理系統 - 專案總覽 (Project Overview)

## 1. 專案簡介

**ZenStore Admin** 是一個基於 **Next.js 15** 構建的高性能電商管理系統。本系統專為管理員設計，旨在提供一個直觀、回應式且功能強大的後台介面，用於管理訂單、產品、會員資料以及網站前端內容（如公告、跑馬燈、新聞等）。

## 2. 核心技術棧

本專案採用現代前端技術開發，確保系統的可擴展性與維護性：

- **前端框架**: [Next.js 15](https://nextjs.org/) (App Router)
- **程式語言**: [TypeScript](https://www.typescriptlang.org/)
- **UI 框架**: [Bootstrap 5](https://getbootstrap.com/) + [Bootstrap Icons](https://icons.getbootstrap.com/)
- **狀態管理**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **資料請求**: [Axios](https://axios-http.com/)
- **樣式處理**: [SASS/SCSS](https://sass-lang.com/) (自定義 Bootstrap 主題)
- **表單處理**: [React Hook Form](https://react-hook-form.com/)
- **日期處理**: [date-fns](https://date-fns.org/)

## 3. 目錄結構分析

專案採用模組化結構，將邏輯與介面清晰分離：

```text
src/
├── app/                # Next.js App Router 頁面路由與佈局
│   ├── products/       # 商品管理模組 (清單、新增/編輯)
│   ├── orders/         # 訂單管理模組 (查詢、出貨、退貨)
│   ├── customers/      # 會員管理模組
│   ├── content/        # 網站內容管理 (公告、輪播圖、技術資源)
│   └── page.tsx        # 儀表板總覽
├── components/         # 可複用組件 (UI Elements, Forms, Layouts)
├── services/           # API 服務封裝 (Axios base)
├── store/              # Redux 狀態中心 (Slices & Selectors)
├── hooks/              # 自定義 React Hooks (封裝商務邏輯)
├── styles/             # 全域與組件 SCSS 樣式
├── types/              # TypeScript 介面與類型定義
└── utils/              # 通用工具函式
```

## 4. 核心功能模組

### 4.1 儀表板總覽 (Dashboard)

- **即時數據卡片**: 顯示未出貨訂單、未付款訂單、庫存告急產品等。
- **銷售統計**: 透過圖表顯示近期銷售趨勢與訂單數。

### 4.2 商品管理 (Product Management)

- **完整 CRUD**: 商品的新增、編輯、刪除。
- **分類與標籤**: 管理商品分類與關聯標籤。
- **庫存追蹤**: 即時監控商品庫存狀態。
- **圖片上傳**: 支援多圖上傳與主圖設定。

### 4.3 訂單管理 (Order Management)

- **訂單追蹤**: 查看所有訂單狀態 (待付款、處理中、已出貨、已完工、已取消)。
- **訂單操作**: 包含出貨確認、訂單取消申請審核及詳細訂單內容檢視。

### 4.4 會員管理 (Customer Management)

- **會員列表**: 檢視與搜尋註冊會員資料。
- **會員詳情**: 追蹤單一會員的訂單紀錄與帳戶狀態。

### 4.5 內容管理 (Content Management - CMS)

- **資訊管理**: 編輯網站跑馬燈 (Marquee)、公告 (Announcement) 與最新消息 (News)。
- **視覺管理**: 管理首頁輪播圖 (Carousel) 與商店資訊。
- **資源庫**: 管理技術資源下載與分類。

## 5. 開發規範與架構設計

### 5.1 API 服務封裝

所有的 API 通訊均封裝於 `src/services` 目錄下，使用 `Axios` 進行請求，並結合 `services` 模式，避免組件內直接暴露 API 路徑：

- `productService.ts`: 處理所有商品相關 API。
- `orderService.ts`: 處理所有訂單相關 API。
- `memberService.ts`: 處理會員相關邏輯。

### 5.2 狀態管理 (Redux)

專案使用 Redux Toolkit 作為唯一的 Truth of Source，數據通過 `Slice` 進行狀態更新，並使用 `Selector` 進行數據選取，確保 UI 組件的渲染效能。

### 5.3 UI 與樣式

- **模組化 SCSS**: 透過 `src/styles/custom-bootstrap.scss` 修改 Bootstrap 變數，達成品牌視覺統一。
- **回應式設計**: 嚴格遵循 Bootstrap 的 Grid System，確保系統在不同螢幕尺寸下的易用性。

## 6. 版本與維護

- **版本**: 0.1.0
- **最新更新日期**: 2026-02-10
