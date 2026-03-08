# ZenStore — 全端電商平台

> 🛍 整合前台購物、後台管理與 API 服務的全端電商系統（開發中）

## 📖 專案簡介

**ZenStore** 是一個全端電商平台，採用前後端分離架構，包含：

- **前台（Client）**：提供消費者流暢的購物體驗
- **後台（Admin）**：提供管理員完整的商品、訂單、會員與內容管理
- **後端（Back-End）**：提供 RESTful API 服務，串接前台與後台

---

## 🗂 系統架構

```
ZenStore/
├── client/       # 前台購物系統（Next.js 15）
├── admin/        # 後台管理系統（Next.js 15）
├── back-end/     # API 服務（Node.js + Express）
└── docker-compose.yml
```

### 架構示意圖

```
┌─────────────────┐     ┌─────────────────┐
│  Client (前台)   │     │  Admin (後台)    │
│  Next.js 15     │     │  Next.js 15     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │        RESTful API     │
         └──────────┬────────────┘
                    │
         ┌──────────▼────────────┐
         │   Back-End (API)      │
         │   Node.js + Express   │
         └──────────┬────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼───────┐     ┌─────────▼─────┐
│ Oracle Database│     │     Redis     │
│  (持久化層)    │     │   (緩存層)    │
└───────────────┘     └───────────────┘
```

---

## 🛠 技術總覽

| 類別     | Client                        | Admin              | Back-End          |
| -------- | ----------------------------- | ------------------ | ----------------- |
| 框架     | Next.js 15                    | Next.js 15         | Express.js        |
| 語言     | TypeScript                    | TypeScript         | TypeScript        |
| 狀態管理 | Redux Toolkit + Redux Persist | Redux Toolkit      | —                 |
| 資料請求 | Axios                         | Axios              | —                 |
| 資料庫   | —                             | —                  | Oracle DB + Redis |
| 驗證     | —                             | —                  | Passport.js + JWT |
| 樣式     | Bootstrap 5 + SCSS            | Bootstrap 5 + SCSS | —                 |
| 容器化   | Docker + Docker Compose       |                    |                   |

---

## 🚀 快速啟動（Docker Compose）

### 環境需求

- Node.js v18+
- Docker + Docker Compose

### 啟動步驟

```bash
# 1. Clone 專案
git clone <your-repo-url>
cd ZenStore

# 2. 複製各子專案的環境變數範本
cp client/.env.example client/.env.local
cp admin/.env.example admin/.env.local
cp back-end/.env.example back-end/.env

# 3. 填寫環境變數（請參考各子專案說明）

# 4. 啟動所有服務
docker-compose up -d
```

### 服務對應埠口

| 服務           | 網址                  |
| -------------- | --------------------- |
| 前台（Client） | http://localhost:3000 |
| 後台（Admin）  | http://localhost:3001 |
| 後端 API       | http://localhost:5000 |

---

## 📌 專案狀態

| 模組                | 狀態        |
| ------------------- | ----------- |
| 前台購物系統        | ✅ 功能完成 |
| 後台管理系統        | ✅ 功能完成 |
| 後端 API 服務       | ✅ 功能完成 |
| Docker Compose 整合 | ✅ 完成     |
| 金流整合            | 🔄 開發中   |
| GA4 整合            | 🔄 開發中   |

---

## 📂 子專案說明

- [Client — 前台購物系統](./client/README.md)
- [Admin — 後台管理系統](./admin/README.md)
- [Back-End — API 服務](./back-end/README.md)
