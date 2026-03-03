# --- 階段 1: Build (編譯 TypeScript) ---
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# 複製 package 檔案
COPY package.json package-lock.json ./
RUN npm install

# 複製所有程式碼
COPY . .

# 執行編譯
RUN npm run build

# --- 階段 2: Run (正式運行) ---
FROM node:20-bullseye-slim AS runner
WORKDIR /app

# 設定環境為生產模式
ENV NODE_ENV production

# 安裝 Oracle Instant Client 所需的依賴
RUN apt-get update && apt-get install -y libaio1 wget unzip && \
    mkdir -p /opt/oracle && \
    cd /opt/oracle && \
    wget https://download.oracle.com/otn_software/linux/instantclient/2113000/instantclient-basiclite-linux.x64-21.13.0.0.0dbru.zip && \
    unzip instantclient-basiclite-linux.x64-21.13.0.0.0dbru.zip && \
    rm -f instantclient-basiclite-linux.x64-21.13.0.0.0dbru.zip && \
    echo /opt/oracle/instantclient_21_13 > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    ldconfig && \
    apt-get purge -y wget unzip && apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# 設定環境變數
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_21_13

# 複製編譯後的程式與依賴
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 暴露埠號
EXPOSE 8080

CMD ["node", "dist/src/app.js"]