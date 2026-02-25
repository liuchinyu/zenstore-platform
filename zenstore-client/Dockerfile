# 階段 1: 安裝依賴並編譯
FROM node:20-alpine AS builder
WORKDIR /app

# 先複製 package.json 以利用 Docker 快取層
COPY package.json package-lock.json* ./
RUN npm install

# [優化點 1] 定義變數插孔 (ARG)
# 這些變數只在 build 的時候有效
ARG NEXT_PUBLIC_CHATWOOT_BASE_URL
ARG NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN

# [優化點 2] 將 ARG 轉為系統環境變數 (ENV)
# Next.js build 時會去抓系統環境裡的這些值
ENV NEXT_PUBLIC_CHATWOOT_BASE_URL=$NEXT_PUBLIC_CHATWOOT_BASE_URL
ENV NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN=$NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN

COPY . .
RUN npm run build

# --- 階段 2: Run ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]