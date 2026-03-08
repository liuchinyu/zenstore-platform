# ZenStore Admin — 後台管理系統

> 🛠 基於 Next.js 15 構建的電商後台管理系統（開發中）

## 📖 專案簡介

**ZenStore Admin** 專為管理員設計，提供直觀、響應式且功能完整的後台介面，用於管理訂單、商品、會員資料，以及網站前端內容（公告、跑馬燈、輪播圖等）。

---

## 🛠 核心技術棧

| 類別     | 技術                                                                                          |
| -------- | --------------------------------------------------------------------------------------------- |
| 前端框架 | [Next.js 15](https://nextjs.org/) (App Router)                                                |
| 程式語言 | [TypeScript](https://www.typescriptlang.org/)                                                 |
| UI 框架  | [Bootstrap 5](https://getbootstrap.com/) + [Bootstrap Icons](https://icons.getbootstrap.com/) |
| 狀態管理 | [Redux Toolkit](https://redux-toolkit.js.org/)                                                |
| 資料請求 | [Axios](https://axios-http.com/)                                                              |
| 樣式處理 | [SASS/SCSS](https://sass-lang.com/)（自定義 Bootstrap 主題）                                  |
| 表單處理 | [React Hook Form](https://react-hook-form.com/)                                               |
| 日期處理 | [date-fns](https://date-fns.org/)                                                             |

---

## 📁 目錄結構

```text
src/
├── app/                # Next.js App Router 頁面路由與佈局
│   ├── products/       # 商品管理模組（清單、新增／編輯）
│   ├── orders/         # 訂單管理模組（查詢、出貨、退貨）
│   ├── customers/      # 會員管理模組
│   ├── content/        # 網站內容管理（公告、輪播圖、技術資源）
│   └── page.tsx        # 儀表板總覽
├── components/         # 可複用組件（UI Elements, Forms, Layouts）
├── services/           # API 服務封裝（Axios base）
├── store/              # Redux 狀態中心（Slices & Selectors）
├── hooks/              # 自定義 React Hooks（封裝商務邏輯）
├── styles/             # 全域與組件 SCSS 樣式
├── types/              # TypeScript 介面與類型定義
└── utils/              # 通用工具函式
```

---

## ✨ 核心功能

### 📊 儀表板總覽

- 即時數據卡片：未出貨訂單數、未付款訂單數、庫存告急商品數

### 📦 商品管理

- 商品完整 CRUD（新增、編輯、刪除）
- 分類與標籤管理
- 即時庫存狀態監控
- 多圖上傳與主圖設定

### 🧾 訂單管理

- 訂單狀態追蹤：待付款 / 處理中 / 已出貨 / 已完工 / 已取消
- 出貨確認、訂單取消申請審核與詳細內容檢視

### 👥 會員管理

- 會員列表檢視與搜尋
- 單一會員訂單紀錄與帳戶狀態追蹤

### 📝 內容管理（CMS）

- 跑馬燈（Marquee）、公告（Announcement）與最新消息（News）編輯
- 首頁輪播圖（Carousel）與商店資訊管理
- 技術資源下載與分類管理

---

## 🏗 架構設計

### API 服務層封裝

所有 API 通訊封裝於 `src/services`，透過 Service 模式避免組件內直接暴露 API 路徑：

- `productService.ts` — 商品相關 API
- `orderService.ts` — 訂單相關 API
- `memberService.ts` — 會員相關 API

### 狀態管理

使用 Redux Toolkit 作為 Single Source of Truth，透過 `Slice` 進行狀態更新，並以 `Selector` 選取資料，確保 UI 組件的渲染效能。

### UI 與樣式

- 透過 `src/styles/custom-bootstrap.scss` 自定義 Bootstrap 變數，達成品牌視覺統一
- 嚴格遵循 Bootstrap Grid System，確保各螢幕尺寸下的易用性

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
NEXT_PUBLIC_API_URL=http://localhost:8080/api/admin
```

> 若使用 Docker Compose 啟動整個專案，請參考根目錄 README。

---

## 📌 專案狀態

| 模組            | 狀態    |
| --------------- | ------- |
| 儀表板          | ✅ 完成 |
| 商品管理        | ✅ 完成 |
| 訂單管理        | ✅ 完成 |
| 會員管理        | ✅ 完成 |
| 內容管理（CMS） | ✅ 完成 |

---

## 🔗 相關連結

- [ZenStore Client — 前台購物系統](../client/README.md)
- [ZenStore Back-End — 後端 API 服務](../back-end/README.md)
- [根目錄 README — Docker Compose 啟動說明](../README.md)
