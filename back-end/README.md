# ZenStore Backend API

ZenStore 後端系統是基於 **Node.js**、**TypeScript** 與 **Express** 構建的高性能電商 API 服務。本專案採用業界標準的層次架構，集成了 Oracle Database (持久化層)、Redis (緩存層) ，為 ZenStore 前台與管理後台提供穩固的數據服務支撐。

---

## 🚀 技術棧 (Tech Stack)

- **Runtime**: Node.js v18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: Oracle Database (使用 `oracledb` 驅動)
- **Caching**: Redis
- **Authentication**: Passport.js & JWT (JSON Web Tokens)
- **Mailing**: Nodemailer
- **Task Management**: Nodemon for Development

---

## 📁 專案目錄結構

```text
back-end/
├── src/
│   ├── app.ts              # 應用程式入口點 (Entry Point)
│   ├── config/             # 全域配置 (DB, Redis, Passport, etc.)
│   ├── controllers/        # 控制層：負責解析請求與調用 Service
│   ├── models/             # 數據模型：封裝數據庫查詢邏輯
│   ├── services/           # 業務邏輯層：封裝複雜業務流程
│   ├── routes/             # 路由定義：分開 admin 與 client
│   │   ├── admin/          # 管理員端 API 路由
│   │   └── client/         # 客戶端 API 路由
│   ├── middlewares/        # 中間件 (Auth, Error Handling, etc.)
│   ├── types/              # TypeScript 介面與型別定義
│   ├── utils/              # 通用工具函式 (AppError, Date formatting, etc.)
├── dist/                   # 編譯後的 JavaScript 文件 (生產環境)
├── .env                    # 環境變數配置 (不應進入版本控制)
├── .env.example            # 環境變數範本
├── nodemon.json            # Nodemon 開發配置
├── package.json            # 依賴與腳本定義
└── tsconfig.json           # TypeScript 配置
```

---

## ⚙️ 快速啟動

### 1. 環境準備

請確保本地或環境中已安裝 Node.js、Redis、Oracle 客戶端。

### 2. 安裝依賴

```bash
npm install
```

### 3. 配置環境變數

將 `.env.example` 複製為 `.env` 並填寫正確的配置：

```bash
cp .env.example .env
```

### 4. 啟動開發環境

```bash
npm run dev
```

### 5. 生產環境編譯與啟動

```bash
npm run build
npm start
```

---

## 🏗️ 系統架構描述

### 數據流向 (Request Lifecycle)

1.  **Request**: 客戶端發送 HTTP 請求。
2.  **Middlewares**: 進行 JWT 驗證、CORS 處理與請求解析。
3.  **Router**: 根據路徑導航至對應的 Controller。
4.  **Controller**: 驗證 Request Body，調用 Service 並捕捉異常。
5.  **Service**: 執行核心業務邏輯，視需求調用複數個 Model 或外部 API。
6.  **Model**: 與 Oracle DB、Redis
7.  **Response**: 統一格式化數據並回傳給客戶端。

### 錯誤處理機制

專案使用全域錯誤處理中間件 `globalErrorHandler`。所有 API 錯誤應通過 `AppError` 拋出：

```typescript
throw new AppError("找不到該商品", 404);
```

---
