import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import passport from "./config/passport";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import adminRoute from "./routes/admin";
import clientRoute from "./routes/client";
import { initializePool } from "./config/database"; // 導入初始化連接池函數
import { initializeRedis } from "./config/redis"; // 導入 Redis 初始化
import { globalErrorHandler } from "./middlewares/error.middleware";
import { AppError } from "./utils/appError";

const app = express();

// 中間件設置
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") ?? [],
    credentials: true,
  }),
);
app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 }, // 限制檔案大小為 50MB
  }),
);
app.use(passport.initialize());

// 路由註冊
app.use("/api/admin/", adminRoute);
app.use("/api/client/", clientRoute);

// 404 處理：找不到路由
app.all("*", (req, res, next) => {
  next(new AppError(`找不到路徑: ${req.originalUrl}`, 404));
});

// 全域錯誤處理中間件（必須放在所有路由之後）
app.use(globalErrorHandler);

// 初始化數據庫連接池和 Redis，然後啟動服務器
(async () => {
  try {
    await initializePool();
    await initializeRedis(); // 初始化 Redis

    // 服務器啟動
    app.listen(8080, () => {
      console.log("Server is running on port 8080");
    });
  } catch (err) {
    console.error("服務器啟動失敗:", err);
    process.exit(1);
  }
})();

export default app;
