import { getConnection } from "../../../config/database";
import type { Connection } from "oracledb";
import oracledb from "oracledb";

// 取得商品分類及製造商對應分類，用以前台-製造商導覽列多階層選單
export async function getCategoriesByManufacturer() {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const productCategories = await connection.execute(
      `SELECT * FROM Product_Category WHERE CATEGORY_TYPE = '產品' ORDER BY category_title`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const manufactureCategories = await connection.execute(
      `select DISTINCT
        m.CATEGORY_ID MANUFACTURE_CATEGORYID, 
        M.CATEGORY_TITLE MANUFACTURE_CATEGORY_TITLE, 
        M.CATEGORY_TYPE MANUFACTURE_CATEGORY_TYPE, 
        C.CATEGORY_ID PRODUCT_CATEGORY_ID, 
        C.CATEGORY_TITLE PRODUCT_CATEGORY_TITLE , 
        C.PARENT_ID, 
        C.CATEGORY_LEVEL, 
        C.CATEGORY_TYPE PRODUCT_CATEGORY_TYPE
      FROM test_product_category_relation r1
      JOIN product_category m 
        ON r1.CATEGORY_ID = m.CATEGORY_ID AND m.CATEGORY_TYPE = '製造商'
      JOIN test_product_category_relation r2 
        ON r1.ORACLE_ID = r2.ORACLE_ID
      JOIN product_category c 
        on r2.category_id = c.category_id and c.category_type = '產品'
      ORDER BY m.CATEGORY_TITLE, c.CATEGORY_LEVEL ASC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return {
      product: productCategories.rows,
      manufacture: manufactureCategories.rows,
    };
  } catch (e) {
    console.log(e);
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

// 獲取商品關聯
export async function getProductCategoriesRelation(category_ids: number[]) {
  let connection: Connection | undefined;
  let bindParams: any = {};
  try {
    connection = await getConnection();

    if (category_ids.length === 0 || !category_ids) return;

    const categoryPlaceholders = category_ids.map((_, index) => `:cat${index}`);

    category_ids.forEach((id, index) => {
      bindParams[`cat${index}`] = id;
    });

    const result = await connection.execute(
      `select 
       distinct(category_title), pcr.category_id, pc.parent_id, pc.category_level, pc.category_type
       FROM TEST_PRODUCT_CATEGORY_RELATION PCR
       JOIN PRODUCT_CATEGORY PC ON PCR.CATEGORY_ID = PC.CATEGORY_ID
       WHERE PCR.ORACLE_ID IN (
          SELECT ORACLE_ID
          FROM TEST_PRODUCT_CATEGORY_RELATION
          WHERE CATEGORY_ID IN (${categoryPlaceholders.join(", ")})
          GROUP BY ORACLE_ID
          HAVING COUNT(DISTINCT CATEGORY_ID) = ${category_ids.length}
      )
      `,
      { ...bindParams },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return result.rows;
  } catch (e) {
    console.log(e);
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

// 獲取指定類別的產品
export async function getProductsByCategory(
  category_id: number[],
  page: number = 1,
  pageSize: number = 25,
) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    // 判斷是否取得所有產品，(若category_id[0] === 0 表清空篩選條件 -> 要取得所有產品)
    let getAllProduct =
      category_id.length > 3 || category_id[0] === 0 ? true : false;

    // 計算分頁參數
    const offset = (page - 1) * pageSize;

    // 根據 category_id 是否為 0 來決定 SQL 查詢語句
    let countSql: string;
    let dataSql: string;
    let countParams: any;
    let dataParams: any;

    //查詢所有產品
    if (getAllProduct) {
      countSql = `SELECT COUNT(*) as TOTAL
                  FROM PRODUCT
                  WHERE IS_PUBLISHED = 1`;
      countParams = {};

      dataSql = `SELECT PRODUCT_ID, DESCRIPTION, BRAND, INVENTORY,
                 FIXED_LOT_MULTIPLIER, IMAGE_URL, PRICE, ORACLE_ID, IS_PUBLISHED
                 FROM PRODUCT
                 WHERE IS_PUBLISHED = 1
                 ORDER BY PRODUCT_ID
                 OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`;
      dataParams = {
        offset: offset,
        pageSize: pageSize,
      };
    } else {
      let bindParams: any = {};
      const categoryPlaceholders = category_id.map(
        (_, index) => `:cat${index}`,
      );

      category_id.forEach((id, index) => {
        bindParams[`cat${index}`] = id;
      });
      //查詢特定類別的產品
      countSql = `SELECT count(*)
                    FROM PRODUCT B
                    WHERE B.IS_PUBLISHED = 1
                    AND EXISTS (
                      SELECT 1
                      FROM TEST_PRODUCT_CATEGORY_RELATION R
                      WHERE R.ORACLE_ID = B.ORACLE_ID
                      AND R.CATEGORY_ID IN (${categoryPlaceholders.join(", ")})
                      GROUP BY R.ORACLE_ID
                      HAVING COUNT(DISTINCT R.CATEGORY_ID) =  ${
                        category_id.length
                      }
                  )`;
      countParams = { ...bindParams };

      dataSql = `SELECT  B.PRODUCT_ID,
                         B.DESCRIPTION,
                         B.BRAND,
                         B.INVENTORY,
                         B.FIXED_LOT_MULTIPLIER,
                         B.IMAGE_URL,
                         B.PRICE,
                         B.ORACLE_ID,
                         B.IS_PUBLISHED
                    FROM PRODUCT B
                    WHERE B.IS_PUBLISHED = 1
                    AND EXISTS (
                        SELECT 1
                        FROM TEST_PRODUCT_CATEGORY_RELATION R
                        WHERE R.ORACLE_ID = B.ORACLE_ID
                        AND R.CATEGORY_ID IN (${categoryPlaceholders.join(
                          ", ",
                        )})
                        GROUP BY R.ORACLE_ID
                        HAVING COUNT(DISTINCT R.CATEGORY_ID) = ${
                          category_id.length
                        }
                    )
                    ORDER BY B.PRODUCT_ID
                    OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`;
      dataParams = {
        ...bindParams,
        offset: offset,
        pageSize: pageSize,
      };
    }

    // 查詢總筆數
    const countResult = await connection.execute(countSql, countParams);
    const countResultRows = countResult.rows as any[];
    const totalItems = countResultRows[0][0];
    const totalPages = Math.ceil(totalItems / pageSize);

    // 查詢產品資料
    const result = await connection.execute(dataSql, dataParams, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    return {
      items: result,
      totalItems: totalItems,
      totalPages: totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.log("error", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉資料庫連接失敗", error);
      }
    }
  }
}
// 獲取所有類別的對應數量
export async function batchGetCategoryCountById(category_id: number[]) {
  let connection: Connection | undefined;
  let bindParams: any = {};
  try {
    connection = await getConnection();
    if (category_id.length === 0 || !category_id) return;

    // 所有商品數量
    if (category_id.length > 3) {
      const result = await connection.execute(
        `select PCR.CATEGORY_ID, COUNT(*)
          FROM TEST_PRODUCT_CATEGORY_RELATION PCR
          JOIN PRODUCT_CATEGORY PC ON PCR.CATEGORY_ID = PC.CATEGORY_ID
          where pc.category_level <> 1
          GROUP BY PCR.CATEGORY_ID`,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
      return result.rows;
    } else {
      // 呈現篩選後的商品數量
      const categoryPlaceholders = category_id.map(
        (_, index) => `:cat${index}`,
      );

      category_id.forEach((id, index) => {
        bindParams[`cat${index}`] = id;
      });

      const result = await connection.execute(
        `select 
          PCR.CATEGORY_ID, COUNT(*)
          FROM TEST_PRODUCT_CATEGORY_RELATION PCR
          JOIN PRODUCT_CATEGORY PC ON PCR.CATEGORY_ID = PC.CATEGORY_ID
          WHERE PCR.ORACLE_ID IN (
              SELECT ORACLE_ID
              from test_product_category_relation
              WHERE CATEGORY_ID IN (${categoryPlaceholders.join(", ")})
              GROUP BY ORACLE_ID
              HAVING COUNT(DISTINCT CATEGORY_ID) = ${category_id.length}
          )
          AND pc.category_level <> 1
          GROUP BY PCR.CATEGORY_ID 
      `,
        { ...bindParams },
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
      return result.rows;
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉資料庫連接失敗", error);
      }
    }
  }
}

export async function getSearchResult(
  query: string,
  page: number,
  pageSize: number,
) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const offset = (page - 1) * pageSize;
    query = "%" + query.toUpperCase() + "%";
    const result = await connection.execute(
      `SELECT P.ORACLE_ID, P.PRODUCT_ID, P.IMAGE_URL
       FROM PRODUCT P 
       LEFT JOIN (SELECT TPCR.ORACLE_ID, LISTAGG(PC.CATEGORY_TITLE, '-') WITHIN GROUP (ORDER BY PC.CATEGORY_LEVEL, PC.CATEGORY_TITLE) AS CATEGORY_TITLES 
             FROM TEST_PRODUCT_CATEGORY_RELATION TPCR 
             JOIN PRODUCT_CATEGORY PC 
             ON TPCR.CATEGORY_ID = PC.CATEGORY_ID 
             GROUP BY TPCR.ORACLE_ID) PC_LIST
       ON P.ORACLE_ID = PC_LIST.ORACLE_ID
       LEFT JOIN (SELECT TPR.ORACLE_ID, LISTAGG(T.TAG_NAME, '/') WITHIN GROUP (ORDER BY T.TAG_NAME) AS TAG_NAMES 
             FROM TAG_PRODUCT_RELATION TPR 
             JOIN TAGS T 
             ON TPR.TAG_ID = T.TAG_ID GROUP BY TPR.ORACLE_ID) T_LIST 
       ON P.ORACLE_ID = T_LIST.ORACLE_ID
       WHERE P.IS_PUBLISHED = 1
       AND (UPPER(P.DESCRIPTION) LIKE :query OR UPPER(P.BRAND) LIKE :query OR UPPER(P.PRODUCT_ID) LIKE :query
            OR UPPER(PC_LIST.CATEGORY_TITLES) LIKE :query OR UPPER(T_LIST.TAG_NAMES) LIKE :query)
       ORDER BY P.PRODUCT_ID
       OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY
      `,
      {
        offset: offset,
        pageSize: pageSize,
        query: query,
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const resultQuantity = await connection.execute(
      `SELECT COUNT(*)
       FROM PRODUCT P 
       LEFT JOIN (SELECT TPCR.ORACLE_ID, LISTAGG(PC.CATEGORY_TITLE, '-') WITHIN GROUP (ORDER BY PC.CATEGORY_LEVEL, PC.CATEGORY_TITLE) AS CATEGORY_TITLES 
             FROM test_product_category_relation TPCR 
             JOIN PRODUCT_CATEGORY PC 
             ON TPCR.CATEGORY_ID = PC.CATEGORY_ID 
             GROUP BY TPCR.ORACLE_ID) PC_LIST
       ON P.ORACLE_ID = PC_LIST.ORACLE_ID
       LEFT JOIN (SELECT TPR.ORACLE_ID, LISTAGG(T.TAG_NAME, '/') WITHIN GROUP (ORDER BY T.TAG_NAME) AS TAG_NAMES 
             FROM TAG_PRODUCT_RELATION TPR 
             JOIN TAGS T 
             ON TPR.TAG_ID = T.TAG_ID GROUP BY TPR.ORACLE_ID) T_LIST 
       ON P.ORACLE_ID = T_LIST.ORACLE_ID
       WHERE P.IS_PUBLISHED = 1
       AND (UPPER(P.DESCRIPTION) LIKE :query OR UPPER(P.BRAND) LIKE :query OR UPPER(P.PRODUCT_ID) LIKE :query
            OR UPPER(PC_LIST.CATEGORY_TITLES) LIKE :query OR UPPER(T_LIST.TAG_NAMES) LIKE :query)
      `,
      {
        query: query,
      },
    );
    const resultRows = resultQuantity.rows as any[];
    const totalItems = resultRows[0][0];
    const totalPages = Math.ceil(totalItems / pageSize);
    return {
      items: result.rows,
      totalItems: totalItems,
      totalPages: totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.log("error", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉資料庫連接失敗", error);
      }
    }
  }
}

// 獲取產品的所有類別資訊(elastic search)
// export async function getProductCategories(
//   oracleId: string
// ): Promise<{ [key: string]: CategoryInfo }> {
//   let connection: Connection | undefined;
//   try {
//     connection = await getConnection();

//     // 1. 查詢產品關聯的類別ID
//     const relationResult = await connection.execute(
//       `SELECT CATEGORY_ID FROM product_category_relation WHERE ORACLE_ID = :oracleId`,
//       { oracleId }
//     );

//     if (!relationResult.rows || relationResult.rows.length === 0) {
//       return {};
//     }
//     // 儲存料號所有的類別ID
//     const categoryIds = relationResult.rows.map((row: any) => row[0]);

//     // 2. 查詢類別詳細資訊
//     const placeholders = categoryIds
//       .map((_, index) => `:id${index}`)
//       .join(", ");

//     const params = categoryIds.reduce((acc: any, id: number, index: number) => {
//       acc[`id${index}`] = id;
//       return acc;
//     }, {});

//     const categoryResult = await connection.execute(
//       `SELECT CATEGORY_ID, CATEGORY_TITLE, CATEGORY_TYPE, PARENT_ID
//        FROM product_category
//        WHERE CATEGORY_ID IN (${placeholders})`,
//       params
//     );

//     // 3. 整理類別資訊
//     const categoriesMap: { [key: string]: CategoryInfo } = {};

//     if (categoryResult.rows) {
//       categoryResult.rows.forEach((row: any) => {
//         const categoryId = row[0];
//         const title = row[1];
//         const type = row[2];
//         const parentId = row[3];

//         if (!categoriesMap[title]) {
//           categoriesMap[title] = {
//             ids: [],
//             type: [],
//             parentId: [],
//           };
//         }

//         categoriesMap[title].ids.push(categoryId);
//         categoriesMap[title].parentId.push(parentId);
//         if (!categoriesMap[title].type.includes(type)) {
//           categoriesMap[title].type.push(type);
//         }
//       });
//     }

//     return categoriesMap;
//   } catch (error) {
//     console.log("獲取產品類別失敗:", error);
//     throw error;
//   } finally {
//     if (connection) {
//       try {
//         await connection.close();
//       } catch (error) {
//         console.log("關閉資料庫連接失敗", error);
//       }
//     }
//   }
// }

// 取得熱門商品

export async function getHotProducts() {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `Select TPR.TAG_ID, TPR.ORACLE_ID, P.PRODUCT_ID, P.BRAND, TAGS.TAG_NAME, TAGS.PRODUCT_COUNT, P.IMAGE_URL
        From Tag_Product_Relation TPR
        Join Tags On Tpr.Tag_Id = Tags.Tag_Id
        Join Product P On Tpr.Oracle_Id = P.Oracle_Id
        WHERE TAGS.TAG_NAME = '熱門商品'
        AND P.IS_PUBLISHED = 1
        `,
      {}, // 參數
      { outFormat: oracledb.OUT_FORMAT_OBJECT }, // 使用正確的常數
    );
    return result.rows;
  } catch (error) {
    console.log("error", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉資料庫連接失敗", error);
      }
    }
  }
}

// 取得新品
export async function getNewProducts() {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `Select TPR.TAG_ID, TPR.ORACLE_ID, P.PRODUCT_ID, P.BRAND, TAGS.TAG_NAME, TAGS.PRODUCT_COUNT, P.IMAGE_URL
        From Tag_Product_Relation TPR
        Join Tags On Tpr.Tag_Id = Tags.Tag_Id
        Join Product P On Tpr.Oracle_Id = P.Oracle_Id
        WHERE TAGS.TAG_NAME = '新品'
        AND P.IS_PUBLISHED = 1
        `,
      {}, // 參數
      { outFormat: oracledb.OUT_FORMAT_OBJECT }, // 使用正確的常數
    );
    return result.rows;
  } catch (error) {
    console.log("error", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉資料庫連接失敗", error);
      }
    }
  }
}

// 取得特價商品
export async function getSaleProducts() {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `Select TPR.TAG_ID, TPR.ORACLE_ID, P.PRODUCT_ID, P.BRAND, TAGS.TAG_NAME, TAGS.PRODUCT_COUNT, P.IMAGE_URL
        From Tag_Product_Relation TPR
        Join Tags On Tpr.Tag_Id = Tags.Tag_Id
        Join Product P On Tpr.Oracle_Id = P.Oracle_Id
        WHERE TAGS.TAG_NAME = '特價商品'
        AND P.IS_PUBLISHED = 1
        `,
      {}, // 參數
      { outFormat: oracledb.OUT_FORMAT_OBJECT }, // 使用正確的常數
    );

    return result.rows;
  } catch (error) {
    console.log("error", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉資料庫連接失敗", error);
      }
    }
  }
}
