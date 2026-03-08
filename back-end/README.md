# ZenStore Backend API

> ⚙️ 基於 Node.js、TypeScript 與 Express 構建的電商 API 服務（開發中）

## 📖 專案簡介

**ZenStore Backend** 採用業界標準的層次架構，整合 Oracle Database（持久化層）與 Redis（緩存層），為 ZenStore 前台與管理後台提供穩固的數據服務支撐。

---

## 🛠 核心技術棧

| 類別 | 技術 |
|------|------|
| 執行環境 | Node.js v18+ |
| 程式語言 | TypeScript |
| 框架 | Express.js |
| 資料庫 | Oracle Database（`oracledb` 驅動） |
| 快取 | Redis |
| 驗證 | Passport.js + JWT |
| 寄信 | Nodemailer |
| 開發工具 | Nodemon |

---

## 📁 目錄結構

```text
back-end/
├── src/
│   ├── app.ts              # 應用程式入口點
│   ├── config/             # 全域配置（DB, Redis, Passport, etc.）
│   ├── controllers/        # 控制層：解析請求與調用 Service
│   ├── models/             # 數據模型：封裝資料庫查詢邏輯
│   ├── services/           # 業務邏輯層：封裝複雜業務流程
│   ├── routes/             # 路由定義
│   │   ├── admin/          # 管理員端 API 路由
│   │   └── client/         # 客戶端 API 路由
│   ├── middlewares/        # 中間件（Auth, Error Handling, etc.）
│   ├── types/              # TypeScript 介面與型別定義
│   └── utils/              # 通用工具函式（AppError, Date formatting, etc.）
├── dist/                   # 編譯後的 JavaScript 檔案（生產環境）
├── .env                    # 環境變數配置（不應進入版本控制）
├── .env.example            # 環境變數範本
├── nodemon.json            # Nodemon 開發配置
├── package.json            # 依賴與腳本定義
└── tsconfig.json           # TypeScript 配置
```

---

## 🚀 本機啟動

### 環境需求
- Node.js v18+
- Redis
- Oracle Database 客戶端

### 安裝與啟動

```bash
# 安裝依賴
npm install

# 複製環境變數範本
cp .env.example .env

# 啟動開發伺服器
npm run dev
```

### 生產環境

```bash
npm run build
npm start
```

### 環境變數設定（`.env`）

```env
PORT=5000
ORACLE_USER=
ORACLE_PASSWORD=
ORACLE_CONNECTION_STRING=
REDIS_URL=
JWT_SECRET=
MAIL_USER=
MAIL_PASS=
```

---

## 🏗 架構設計

### Request Lifecycle

```
Request → Middlewares → Router → Controller → Service → Model → Response
```

1. **Request** — 客戶端發送 HTTP 請求
2. **Middlewares** — JWT 驗證、CORS 處理與請求解析
3. **Router** — 根據路徑導向對應的 Controller
4. **Controller** — 驗證 Request Body，調用 Service 並捕捉異常
5. **Service** — 執行核心業務邏輯，視需求調用複數個 Model
6. **Model** — 與 Oracle DB、Redis 交互
7. **Response** — 統一格式化數據並回傳給客戶端

### 錯誤處理

使用全域錯誤處理中間件 `globalErrorHandler`，所有 API 錯誤透過 `AppError` 拋出：

```typescript
throw new AppError("找不到該商品", 404);
```

---

## 📌 專案狀態

| 模組 | 狀態 |
|------|------|
| 認證（JWT / Passport） | ✅ 完成 |
| 商品 API | ✅ 完成 |
| 訂單 API | ✅ 完成 |
| 會員 API | ✅ 完成 |
| 寄信功能 | ✅ 完成 |
| 金流整合 | 🔄 開發中 |

---

## 🔗 相關連結

- [ZenStore Client — 前台購物系統](../client/README.md)
- [ZenStore Admin — 後台管理系統](../admin/README.md)
- [根目錄 README — Docker Compose 啟動說明](../README.md)