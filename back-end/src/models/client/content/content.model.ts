import { getConnection } from "../../../config/database";
import oracledb from "oracledb";

// 取得啟用狀態的公告資訊
export async function getActiveAnnouncements() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ANNOUNCEMENTS_ID, TITLE, CATEGORY, CONTENT, STATUS, PUBLISH_DATE, END_DATE FROM ANNOUNCEMENTS WHERE STATUS = 1 ORDER BY PUBLISH_DATE DESC`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return result.rows;
  } catch (error) {
    console.error("取得公告失敗:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.log("關閉資料庫連接失敗", e);
      }
    }
  }
}

// 取得啟用狀態的跑馬燈
export async function getActiveMarquees() {
  let connection: oracledb.Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT 
         ID,
         TEXT,
         SPEED_MS,
         TEXT_COLOR,
         BACKGROUND_COLOR,
         IS_ACTIVE,
         PUBLISH_DATE,
         END_DATE
       FROM MARQUEE_ITEMS
       WHERE IS_ACTIVE = 1
       ORDER BY ID DESC`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return result.rows;
  } catch (error) {
    console.error("取得跑馬燈失敗:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.log("關閉資料庫連接失敗", e);
      }
    }
  }
}

// 取得啟用狀態的商店資訊，For前台使用
export async function getActiveStoreInfo() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM STORE_INFO WHERE IS_ACTIVE = 1`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return result.rows;
  } catch (error) {
    console.error("獲取商店資訊失敗:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.log("關閉資料庫連接失敗", e);
      }
    }
  }
}
