# ZenStore Client — 前台購物系統

> 🛒 基於 Next.js 15 構建的高性能電商前台系統（開發中）

## 📖 專案簡介

**ZenStore Client** 提供流暢、直觀且響應式的購物體驗。使用者可瀏覽商品、管理購物車、進行安全結帳，並在個人中心追蹤訂單狀態與維護會員資料。

---

## 🛠 核心技術棧

| 類別     | 技術                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| 前端框架 | [Next.js 15](https://nextjs.org/) (App Router)                                          |
| 程式語言 | [TypeScript](https://www.typescriptlang.org/)                                           |
| UI 框架  | [Bootstrap 5](https://getbootstrap.com/) + Bootstrap Icons                              |
| 狀態管理 | [Redux Toolkit](https://redux-toolkit.js.org/) + Redux Persist                          |
| 資料請求 | [Axios](https://axios-http.com/)                                                        |
| 樣式處理 | [SASS/SCSS](https://sass-lang.com/)                                                     |
| 輪播動畫 | [Swiper](https://swiperjs.com/) + [Slick-carousel](https://kenwheeler.github.io/slick/) |
| 表單處理 | [React Hook Form](https://react-hook-form.com/)                                         |
| 日期處理 | [date-fns](https://date-fns.org/)                                                       |

---

## 📁 目錄結構

```text
src/
├── app/                # Next.js 頁面路由與佈局 (App Router)
│   ├── (auth)/         # 認證模組（登入、註冊、忘記密碼）
│   ├── products/       # 商品瀏覽模組（分類篩選、商品詳情）
│   ├── cart/           # 購物車管理頁面
│   ├── checkout/       # 結帳流程模組（收件資訊、付款確認）
│   ├── account/        # 會員中心（個人資料、地址簿、訂單紀錄、收藏夾）
│   ├── announcements/  # 系統公告與消息模組
│   └── page.tsx        # 首頁（動態 Banner、熱銷推薦、品牌牆）
├── components/         # 可複用 UI 組件（NavBar, Footer, ProductCard, Carousel）
├── services/           # API 服務封裝（與後端通訊的單一入口）
├── store/              # Redux 狀態中心（Slices, Selectors & Persist Config）
├── hooks/              # 自定義 React Hooks（useAuth, useCart, useDynamicReducer）
├── styles/             # 全域 SCSS 與 Bootstrap 變數自定義
├── types/              # TypeScript 介面與類型定義
└── utils/              # 通用工具函式（格式化、驗證）
```

---

## ✨ 核心功能

### 🏠 首頁與視覺體驗

- 動態跑馬燈，即時顯示最新優惠訊息
- 支援手勢觸控的高清品牌 Banner 輪播
- 動態商品分類導覽與全站關鍵字搜尋

### 🔍 商品瀏覽與搜尋

- 支援分類、標籤、關鍵字多維度交叉篩選
- 熱銷 / 新品 / 特價等動態商品牆
- 商品圖庫、規格、型號選擇與即時庫存顯示

### 🛒 購物車與結帳

- Redux Persist 持久化購物車，重啟瀏覽器後資料不丟失
- 動態計算小計、稅金、運費與總額
- 常用收件地址選擇、付款方式確認與訂單摘要審核

### 👤 個人化中心

- 歷史訂單追蹤與物流進度查詢
- 多組收件地址管理
- 收藏清單（Wishlist）
- 個人資料更新與密碼變更

---

## 🏗 架構設計

### API 服務層封裝

所有 API 通訊封裝於 `src/services`，採用 Axios 單例模式統一處理請求與錯誤：

- `authService.ts` — 認證、權限驗證與 Token 管理
- `productService.ts` — 商品資料請求
- `cartService.ts` / `orderService.ts` — 購物邏輯與訂單提交

### 狀態管理

以 Redux 作為 Single Source of Truth，透過 `Slices` 管理狀態。
使用 `useDynamicReducer` hook 實現 Reducer 動態加載，有效減少初始 Bundle Size。

### RWD 響應式設計

嚴格遵循 Bootstrap 5 網格系統，支援 320px 手機至 2K 螢幕的全裝置適配。
含骨架屏（Skeleton）、加載動畫與即時 Toast 提示，確保高回應性的操作體驗。

---

## 🚀 本機啟動

### 環境需求

- Node.js 18+
- 搭配 ZenStore Back-End 服務運行

### 安裝與啟動

```bash
# 安裝依賴
npm install

# 複製環境變數範本
cp .env.example .env.local

# 啟動開發伺服器
npm run dev
```

### 環境變數設定（`.env.local`）

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

> 若使用 Docker Compose 啟動整個專案，請參考根目錄 README。

---

## 📌 專案狀態

| 模組            | 狀態      |
| --------------- | --------- |
| 首頁 / 商品瀏覽 | ✅ 完成   |
| 購物車 / 結帳   | ✅ 完成   |
| 會員中心        | ✅ 完成   |
| 金流整合        | 🔄 開發中 |

---

## 🔗 相關連結

- [ZenStore Admin — 後台管理系統](../admin/README.md)
- [ZenStore Back-End — 後端 API 服務](../back-end/README.md)
- [根目錄 README — Docker Compose 啟動說明](../README.md)
