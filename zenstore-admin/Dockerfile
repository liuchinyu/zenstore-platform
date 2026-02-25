# --- 階段 1: Build ---
FROM node:20-alpine AS builder
WORKDIR /app

# [修改點] 這裡只放後台需要的變數插孔
ARG NEXT_PUBLIC_API_URL

# 將 ARG 轉為系統環境變數，供 npm run build 使用
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json package-lock.json ./
RUN npm install

# 複製所有檔案（會被 .dockerignore 過濾）
COPY . .
RUN npm run build

# --- 階段 2: Run ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# 複製編譯成果
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 容器內部維持 3000
EXPOSE 3000
CMD ["npm", "start"]