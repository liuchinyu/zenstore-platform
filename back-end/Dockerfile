# --- 階段 1: Build (編譯 TypeScript) ---
FROM node:20-bullseye-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# --- 階段 2: Production Dependencies (僅安裝生產環境套件) ---
FROM node:20-bullseye-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# --- 階段 3: Run (正式運行) ---
FROM node:20-bullseye-slim AS runner
WORKDIR /app

ENV NODE_ENV production

# 安裝 Oracle Instant Client
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

ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_21_13

# 1. 複製編譯後的程式碼
COPY --from=builder /app/dist ./dist
# 2. 複製僅含生產環境的 node_modules
COPY --from=prod-deps /app/node_modules ./node_modules
# 3. 複製設定檔
COPY --from=builder /app/package.json ./package.json

EXPOSE 8080

CMD ["node", "dist/src/app.js"]