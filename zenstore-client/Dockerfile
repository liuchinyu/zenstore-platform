# 階段 1: Build (編譯)
FROM node:20-alpine AS builder 
WORKDIR /app

# 僅複製 package 檔案以利用快取
COPY package.json package-lock.json* ./
RUN npm install

# ARG 參數傳遞
ARG NEXT_PUBLIC_CHATWOOT_BASE_URL
ARG NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN
ARG NEXT_IMAGE_UNOPTIMIZED

ENV NEXT_PUBLIC_CHATWOOT_BASE_URL=$NEXT_PUBLIC_CHATWOOT_BASE_URL
ENV NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN=$NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN
ENV NEXT_IMAGE_UNOPTIMIZED=$NEXT_IMAGE_UNOPTIMIZED

# 複製程式碼並編譯
COPY . .
RUN npm run build

# --- 階段 2: Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# 關閉 Next.js 遙測（選用）
ENV NEXT_TELEMETRY_DISABLED 1

# 僅複製 standalone 所需的最精簡檔案
# 注意：這些路徑是 Next.js output: 'standalone' 特有的
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
# 執行 standalone server
CMD ["node", "server.js"]