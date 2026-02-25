import { getConnection } from "@/config/database";
import oracledb from "oracledb";

// 取得輪播資料
export async function getCarousel() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM CAROUSEL_ITEMS ORDER BY DISPLAY_ORDER`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    return result.rows;
  } catch (error) {
    console.error("取得輪播圖片失敗:", error);
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

// 取得技術資源
export async function getNews() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT NEWS_ID, TITLE, CATEGORY, URL, UPLOAD_DATE, DESCRIPTION FROM NEWS`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return result.rows;
  } catch (error) {
    console.error("取得技術資源失敗:", error);
    throw error;
  }
}

// 取得技術資源
export async function getTechResources() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT TECH_ID, TITLE, CATEGORY, URL, UPLOAD_DATE, DESCRIPTION FROM Technical_Resource`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return result.rows;
  } catch (error) {
    console.error("取得技術資源失敗:", error);
    throw error;
  }
}
