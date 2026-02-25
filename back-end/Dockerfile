# --- 階段 1: Build (編譯 TypeScript) ---
FROM node:20-alpine AS builder
WORKDIR /app

# 複製 package 檔案
COPY package.json package-lock.json ./
RUN npm install

# 複製所有程式碼
COPY . .

# 執行編譯 (會產生 dist 資料夾)
RUN npm run build

# --- 階段 2: Run (正式運行) ---
FROM node:20-alpine AS runner
WORKDIR /app

# 設定環境為生產模式
ENV NODE_ENV production

# 只複製運行所需的精華
# 注意：後端需要運行時的 node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 根據你的 scripts/start，主程式在 dist/src/app.js
# 暴露 API 埠號 (假設你 Express 監聽 8080，請根據 app.ts 實際情況調整)
EXPOSE 8080

CMD ["node", "dist/src/app.js"]