import { getConnection } from "@/config/database";
import oracledb from "oracledb";
import type { Connection } from "oracledb";

export async function getProductFormatted(oracle_id: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const allPromises = [];
    const productResult = connection.execute(
      `SELECT * FROM PRODUCT WHERE oracle_id = :oracle_id`,
      [oracle_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const productCategoryResult = connection.execute(
      `SELECT tpcr.category_id, pc.category_level, pc.category_type, pc.category_title
        FROM test_product_category_relation tpcr 
        LEFT JOIN product_category pc ON tpcr.category_id = pc.category_id
        WHERE tpcr.ORACLE_ID = :oracle_id
        ORDER BY pc.CATEGORY_TYPE DESC, pc.CATEGORY_LEVEL `,
      [oracle_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const productTagResult = connection.execute(
      `SELECT TAGS.TAG_ID, TAGS.TAG_NAME FROM tag_product_relation TPR 
       JOIN TAGS ON TPR.TAG_ID = TAGS.TAG_ID 
       WHERE oracle_id = :oracle_id`,
      [oracle_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const productImagesResult = connection.execute(
      `SELECT * FROM product_images WHERE oracle_id = :oracle_id order by image_id`,
      [oracle_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const productPricesResult = connection.execute(
      `SELECT * FROM product_prices WHERE oracle_id = :oracle_id order by min`,
      [oracle_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    allPromises.push(productResult);
    allPromises.push(productCategoryResult);
    allPromises.push(productImagesResult);
    allPromises.push(productPricesResult);
    allPromises.push(productTagResult);
    const results = await Promise.all(allPromises);

    return {
      success: true,
      message: "商品查詢成功",
      data: {
        product: results[0].rows?.[0] || null,
        categories: results[1].rows || [],
        images: results[2].rows || [],
        prices: results[3].rows || [],
        tags: results[4].rows || [],
      },
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "商品查詢失敗",
      error,
    };
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
