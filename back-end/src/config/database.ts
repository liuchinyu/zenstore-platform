import * as oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();
const POOL_ALIAS = "default";
let poolInitialized = false;

oracledb.initOracleClient();

// 配置連接池
async function initializePool() {
  if (poolInitialized) {
    return; // 已經初始化過，直接return
  }

  try {
    try {
      // 先檢查連接池是否已存在
      oracledb.getPool(POOL_ALIAS);
      console.log(`連接池 "${POOL_ALIAS}" 已存在，直接使用`);
      poolInitialized = true;
      return;
    } catch (err) {
      // 只有在連接池不存在時才創建（NJS-047錯誤）
      if (err instanceof Error && err.message.includes("NJS-047")) {
        await oracledb.createPool({
          user: process.env.USER,
          password: process.env.PASSWORD,
          connectString: process.env.CONNECT_STRING,
          poolAlias: POOL_ALIAS,

          poolMin: 10,
          poolMax: 50,
          poolIncrement: 5, //現有連線不足時，一次批量建立 5 條新連線
          poolTimeout: 60, //連線閒置 60 秒自動關閉
          poolPingInterval: 60, //每 60 秒 ping 一次連線

          queueMax: 500, //最多允許 500 個請求排隊
          stmtCacheSize: 30, //快取最近執行的 30 條 SQL 語句
          enableStatistics: true, //啟用統計功能
          connectTimeout: 15000, //連線超時時間
        });
        console.log(`連接池 "${POOL_ALIAS}" 創建成功`);
        poolInitialized = true;
      } else {
        // 其他錯誤
        throw err;
      }
    }
  } catch (err) {
    // 處理連接池已存在 (NJS-046) 或其他錯誤
    if (err instanceof Error && err.message.includes("NJS-046")) {
      console.log(`連接池 "${POOL_ALIAS}" 已在其他地方創建，將直接使用`);
      poolInitialized = true;
      return;
    }

    console.error("初始化連接池時發生錯誤:", err);
    throw err;
  }
}

// 執行查詢的函數
async function getConnection() {
  try {
    await initializePool();
    return await oracledb.getConnection(POOL_ALIAS);
  } catch (err) {
    console.error("獲取數據庫連接失敗:", err);
    throw err;
  }
}

// 使用 export 導出
export { getConnection, initializePool };
