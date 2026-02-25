import { getConnection } from "../../../config/database";
import { redisCacheService } from "../../../services/redis.service";
import oracledb from "oracledb";
import type { Connection } from "oracledb";

// 獲取所有產品(分頁)
export async function getProductListByPage(
  page: number,
  pageSize: number,
  filters?: any,
) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const conditions: string[] = [];
    const bindParams: any = {};

    // --- 1. 類別篩選器整合 (brand, catLevel1, catLevel2) ---
    const categoryIds: any[] = [];

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;

        // 上架狀態
        switch (key) {
          case "publishStatus":
            conditions.push("P.IS_PUBLISHED = :publishStatus");
            bindParams.publishStatus = value;
            break;

          // 將所有類別相關的 ID 收集起來
          case "brand":
          case "categoryLevel1":
          case "categoryLevel2":
            categoryIds.push(value);
            break;

          // 搜尋關鍵字
          case "keyword":
            conditions.push(
              "(UPPER(P.PRODUCT_ID) LIKE :kw OR UPPER(P.DESCRIPTION) LIKE :kw OR UPPER(P.BRAND) LIKE :kw OR UPPER(PC_LIST.CATEGORY_TITLES) LIKE :kw OR UPPER(T_LIST.TAG_NAMES) LIKE :kw)",
            );
            bindParams.kw = `%${String(value).toUpperCase()}%`;
            break;

          // 搜尋標籤
          case "tag":
            conditions.push(
              `EXISTS (SELECT 1 FROM TAG_PRODUCT_RELATION TPR WHERE TPR.ORACLE_ID = P.ORACLE_ID AND TPR.TAG_ID = :tagId)`,
            );
            bindParams.tagId = value;
            break;
        }
      });

      // --- 2. 動態處理類別交集篩選 ---
      if (categoryIds.length > 0) {
        // 這裡動態產生 IN (:c0, :c1, :c2)
        const categoryPlaceholders = categoryIds.map(
          (_, index) => `:cat${index}`,
        );
        categoryIds.forEach((id, index) => {
          bindParams[`cat${index}`] = id;
        });

        conditions.push(`
          P.ORACLE_ID IN (
            SELECT TPCR.ORACLE_ID 
            FROM test_product_category_relation TPCR 
            WHERE TPCR.CATEGORY_ID IN (${categoryPlaceholders.join(", ")})
            GROUP BY TPCR.ORACLE_ID 
            HAVING COUNT(DISTINCT TPCR.CATEGORY_ID) = ${categoryIds.length}
          )
        `);
      }
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // --- 3. 執行查詢 ---
    // 定義共用的 Join 邏輯，確保 COUNT(*) 也能搜尋類別與標籤
    const commonJoinSql = `
      LEFT JOIN (
        SELECT TPCR.ORACLE_ID, 
               LISTAGG(PC.CATEGORY_TITLE, '-') WITHIN GROUP (ORDER BY PC.CATEGORY_LEVEL, PC.CATEGORY_TITLE) AS CATEGORY_TITLES 
        FROM test_product_category_relation TPCR 
        JOIN PRODUCT_CATEGORY PC ON TPCR.CATEGORY_ID = PC.CATEGORY_ID 
        GROUP BY TPCR.ORACLE_ID
      ) PC_LIST ON P.ORACLE_ID = PC_LIST.ORACLE_ID
      LEFT JOIN (
        SELECT TPR.ORACLE_ID, 
               LISTAGG(T.TAG_NAME, '/') WITHIN GROUP (ORDER BY T.TAG_NAME) AS TAG_NAMES 
        FROM TAG_PRODUCT_RELATION TPR 
        JOIN TAGS T ON TPR.TAG_ID = T.TAG_ID 
        GROUP BY TPR.ORACLE_ID
      ) T_LIST ON P.ORACLE_ID = T_LIST.ORACLE_ID
    `;

    const offset = (page - 1) * pageSize;

    // A. 總筆數 (需包含 Join 才能在 WHERE 中使用 PC_LIST/T_LIST)
    const countSql = `SELECT COUNT(*) as TOTAL FROM PRODUCT P ${commonJoinSql} ${whereClause}`;
    const countResult = await connection.execute(countSql, bindParams);

    // Oracle 預設回傳可能是物件或陣列，增加防呆處理
    const countRows = countResult.rows as any[];
    const totalItems =
      countRows[0].TOTAL !== undefined ? countRows[0].TOTAL : countRows[0][0];
    const totalPages = Math.ceil(totalItems / pageSize);

    // B. 分頁查詢
    const sql = `
        SELECT P.PRODUCT_ID, P.DESCRIPTION, P.BRAND, P.INVENTORY, P.FIXED_LOT_MULTIPLIER, 
               P.IMAGE_URL, P.PRICE, P.ORACLE_ID, P.IS_PUBLISHED, 
               PC_LIST.CATEGORY_TITLES, T_LIST.TAG_NAMES 
        FROM PRODUCT P 
        ${commonJoinSql}
        ${whereClause}
        ORDER BY P.PRODUCT_ID
        OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`;

    const result = await connection.execute(
      sql,
      { ...bindParams, offset, pageSize },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    return {
      items: result.rows,
      totalItems,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Query Error:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// 取得總分類
export async function getAllCategory() {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM Product_Category 
      WHERE CATEGORY_TYPE = '產品' OR (category_type = '製造商' AND CATEGORY_LEVEL = 1) `,
      [],
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

// 取得商品分類
export async function getProductCategory() {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM Product_Category 
       WHERE CATEGORY_TYPE = '產品' 
       ORDER BY CATEGORY_TITLE`,
      [],
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

// 取得製造商分類
export async function getManufactureCategory() {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM Product_Category 
       WHERE CATEGORY_TYPE = '製造商' AND CATEGORY_LEVEL = 1
       ORDER BY CATEGORY_TITLE`,
      [],
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

export async function getCategoryRelation() {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `Select A.Oracle_Id, A.Category_Id
       From Test_Product_Category_Relation A Join Product_Category B
       On A.Category_Id = B.Category_Id
       Where B.Category_Type = '產品'Or ( B.Category_Type = '製造商' And  B.Category_Level = 1)`,
      [],
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

// 新增分類
export async function createCategory(
  category_title: string,
  parentId: number,
  category_level: number,
  category_type: string,
) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `INSERT INTO Product_Category 
             (category_title, parent_id, category_level, category_type) 
             VALUES (:category_title, :parentId, :category_level, :category_type)`,
      [category_title, parentId, category_level, category_type],
      { autoCommit: true }, // 自動提交事務
    );
    await clearProductCache();
    return result;
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
// 套用分類
export async function applyCategory(payload: any) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const { productIds, categoryIds, brand } = payload;

    // 建立所有操作的 Promise 陣列
    const allPromises = [];

    // 對每個產品 ID 和分類 ID 組合進行處理
    for (const oracle_id of productIds) {
      // 更新商品分類
      if (brand) {
        const updatePromise = connection.execute(
          `UPDATE PRODUCT SET brand = :brand WHERE oracle_id = :oracle_id`,
          [brand, oracle_id],
        );
        allPromises.push(updatePromise);
      }

      const checkResult = await connection.execute(
        `SELECT COUNT(*) FROM TEST_PRODUCT_CATEGORY_RELATION WHERE oracle_id = :oracle_id `,
        [oracle_id],
      );
      const checkCategoryExist =
        checkResult && checkResult.rows && checkResult.rows.length > 0;
      if (checkCategoryExist) {
        // 關聯已存在，先將整個分類資料刪除
        const deletePromise = connection.execute(
          `DELETE FROM TEST_PRODUCT_CATEGORY_RELATION WHERE oracle_id = :oracle_id `,
          [oracle_id],
        );
        allPromises.push(deletePromise);
      }
      // 將新的分類資料插入
      for (const category_id of categoryIds) {
        const insertPromise = connection.execute(
          `INSERT INTO TEST_PRODUCT_CATEGORY_RELATION (oracle_id, category_id) VALUES (:oracle_id, :category_id)`,
          [oracle_id, category_id],
        );
        allPromises.push(insertPromise);
      }
    }

    // 等待所有操作完成
    await Promise.all(allPromises);

    // 提交事務
    await connection.commit();
    await clearProductCache();

    // 取得更新後的分類關聯
    const productCategoryRelationResult = await connection.execute(
      `Select A.Oracle_Id, A.Category_Id
       From Test_Product_Category_Relation A Join Product_Category B
       On A.Category_Id = B.Category_Id
       Where B.Category_Type = '產品'Or ( B.Category_Type = '製造商' And  B.Category_Level = 1)`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const productListResult = await getProductList(connection);

    // 回傳成功訊息
    return {
      success: true,
      message: "分類套用成功",
      data: {
        productCategoryRelationResult: productCategoryRelationResult.rows,
        productListResult: productListResult,
      },
    };
  } catch (error) {
    console.log("error", error);
    return {
      success: false,
      message: "分類套用失敗",
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

// 更新分類
export async function updateCategory(
  category_id: number,
  category_title: string,
) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `UPDATE Product_Category SET category_title = :category_title WHERE category_id = :category_id `,
      [category_title, category_id],
      { autoCommit: true },
    );
    await clearProductCache();
    return result;
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

// 確認是否有子分類
export async function checkChildCategories(category_id: number) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT COUNT(*) as count FROM Product_Category WHERE parent_id = :category_id`,
      [category_id],
    );
    return (result.rows as Array<Array<number>>)[0][0];
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

// 刪除分類
export async function deleteCategory(category_id: number) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `DELETE FROM Product_Category WHERE category_id = :category_id`,
      [category_id],
      { autoCommit: true },
    );
    await clearProductCache();
    return result;
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

// 新增商品
export async function createProduct(payload: any) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const {
      brand_id,
      brand,
      description,
      detail_images,
      fixed_lot_multiplier,
      high_temp,
      high_voltage,
      is_published,
      low_temp,
      low_voltage,
      main_images,
      main_product_category,
      oracle_id,
      package_method,
      priceRanges,
      product_application,
      product_id,
      second_product_category,
      seo_description,
      inventory,
      tags,
      third_product_category,
      unit_weight,
      vendor_lead_time,
    } = payload;
    const price = priceRanges[0].unitPrice;
    const image_url = main_images[0];

    // 新增商品資料
    const allPromises = [];

    const result = connection.execute(
      `INSERT INTO PRODUCT (brand, description, fixed_lot_multiplier, high_temp, high_voltage, is_published, low_temp, low_voltage, 
       oracle_id, package_method, product_application, product_id, seo_description, inventory, price, unit_weight, vendor_lead_time, image_url) 
       VALUES (:brand, :description, :fixed_lot_multiplier, :high_temp, :high_voltage, :is_published, :low_temp, :low_voltage, 
       :oracle_id, :package_method, :product_application, :product_id, :seo_description, :inventory, :price, :unit_weight, :vendor_lead_time, :image_url)`,
      [
        brand,
        description,
        fixed_lot_multiplier,
        high_temp,
        high_voltage,
        is_published,
        low_temp,
        low_voltage,
        oracle_id,
        package_method,
        product_application,
        product_id,
        seo_description,
        inventory,
        price,
        unit_weight,
        vendor_lead_time,
        image_url,
      ],
    );
    allPromises.push(result);

    // 新增商品主圖
    main_images.map((item: any) => {
      if (!connection) return;
      const image_url = item;
      const image_type = "main";
      const result2 = connection.execute(
        `INSERT INTO PRODUCT_IMAGES (oracle_id, image_url, image_type) VALUES (:oracle_id, :image_url, :image_type)`,
        [oracle_id, image_url, image_type],
      );
      allPromises.push(result2);
    });

    // 新增商品詳細圖片
    detail_images.map((item: any) => {
      if (!connection) return;
      const image_url = item;
      const image_type = "detail";
      const result3 = connection.execute(
        `INSERT INTO PRODUCT_IMAGES (oracle_id, image_url, image_type) VALUES (:oracle_id, :image_url, :image_type)`,
        [oracle_id, image_url, image_type],
      );
      allPromises.push(result3);
    });

    // 新增商品價格
    priceRanges.map((item: any) => {
      if (!connection) return;
      const min = item.minQuantity;
      const max = item.maxQuantity;
      const price = item.unitPrice;
      const currency = "NTD";
      const unit = item.unit;
      const result4 = connection.execute(
        `INSERT INTO PRODUCT_PRICES (oracle_id, min, max, price, currency, unit) VALUES (:oracle_id, :min, :max, :price, :currency, :unit)`,
        [oracle_id, min, max, price, currency, unit],
      );
      allPromises.push(result4);
    });

    // 新增商品標籤
    tags.map((item: any) => {
      if (!connection) return;
      const tag_id = item;
      const result5 = connection.execute(
        `INSERT INTO tag_product_relation (oracle_id, tag_id) VALUES (:oracle_id, :tag_id)`,
        [oracle_id, tag_id],
      );
      allPromises.push(result5);
    });

    // 新增商品製造商
    if (brand_id) {
      const result = await connection.execute(
        `INSERT INTO test_product_category_relation(ORACLE_ID, CATEGORY_ID)
          VALUES(:oracle_id, :brand_id)`,
        [oracle_id, brand_id],
      );
      allPromises.push(result);
    }

    // 新增商品大分類
    if (main_product_category) {
      const result = await connection.execute(
        `INSERT INTO test_product_category_relation(ORACLE_ID, CATEGORY_ID)
          VALUES(:oracle_id, :main_product_category)`,
        [oracle_id, main_product_category],
      );
      allPromises.push(result);
    }

    // 新增商品中分類
    if (second_product_category) {
      const result = await connection.execute(
        `INSERT INTO test_product_category_relation(ORACLE_ID, CATEGORY_ID)
          VALUES(:oracle_id, :second_product_category)`,
        [oracle_id, second_product_category],
      );
      allPromises.push(result);
    }

    // 新增商品小分類
    if (third_product_category) {
      const result = await connection.execute(
        `INSERT INTO test_product_category_relation(ORACLE_ID, CATEGORY_ID)
      VALUES(:oracle_id, :third_product_category)`,
        [oracle_id, third_product_category],
      );
      allPromises.push(result);
    }

    await Promise.all(allPromises);
    await connection.commit();
    await clearProductCache();
    return {
      success: true,
      message: "商品新增成功",
    };
  } catch (error) {
    console.log(error);
    await connection?.rollback();
    return {
      success: false,
      message: "商品新增失敗",
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

// 查詢所有商品 For Excel匯出
export async function gatAllProudct(selectProducts: string[] | null) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    let allPromises = [];
    let productResult;
    let productImagesResult;
    let productPricesResult;
    let productTagsResult;
    let productCategoryResult;
    if (selectProducts && selectProducts.length > 0) {
      const formattedValues = selectProducts
        .map((value) => `'${value}'`)
        .join(", ");
      productResult = connection.execute(
        `SELECT ORACLE_ID, PRODUCT_ID, BRAND, DESCRIPTION, INVENTORY, VENDOR_LEAD_TIME, UNIT_WEIGHT, FIXED_LOT_MULTIPLIER, PACKAGE_METHOD, IMAGE_URL, IS_PUBLISHED, 
        HIGH_TEMP, HIGH_VOLTAGE, LOW_TEMP, LOW_VOLTAGE, PRODUCT_APPLICATION, SEO_DESCRIPTION 
        FROM PRODUCT
        WHERE ORACLE_ID IN (${formattedValues})`,
      );
      productImagesResult = connection.execute(
        `SELECT ORACLE_ID, IMAGE_URL, IMAGE_TYPE FROM PRODUCT_IMAGES WHERE ORACLE_ID IN (${formattedValues}) ORDER BY ORACLE_ID, IMAGE_TYPE DESC`,
      );
      productPricesResult = connection.execute(
        `SELECT ORACLE_ID, MIN, MAX, PRICE, CURRENCY, UNIT FROM PRODUCT_PRICES WHERE ORACLE_ID IN (${formattedValues}) ORDER BY ORACLE_ID, MIN`,
      );
      productTagsResult = connection.execute(
        `SELECT ORACLE_ID, TAG_ID FROM TAG_PRODUCT_RELATION WHERE ORACLE_ID IN (${formattedValues}) ORDER BY ORACLE_ID`,
      );
      productCategoryResult = connection.execute(
        `SELECT ORACLE_ID, CATEGORY_ID FROM TEST_PRODUCT_CATEGORY_RELATION WHERE ORACLE_ID IN (${formattedValues}) ORDER BY ORACLE_ID`,
      );
    } else {
      productResult = connection.execute(
        `SELECT ORACLE_ID, PRODUCT_ID, BRAND, DESCRIPTION, INVENTORY, VENDOR_LEAD_TIME, UNIT_WEIGHT, FIXED_LOT_MULTIPLIER, PACKAGE_METHOD, IMAGE_URL, IS_PUBLISHED, 
        HIGH_TEMP, HIGH_VOLTAGE, LOW_TEMP, LOW_VOLTAGE, PRODUCT_APPLICATION, SEO_DESCRIPTION 
        FROM PRODUCT`,
      );
      productImagesResult = connection.execute(
        `SELECT ORACLE_ID, IMAGE_URL, IMAGE_TYPE FROM PRODUCT_IMAGES ORDER BY ORACLE_ID, IMAGE_TYPE DESC`,
      );
      productPricesResult = connection.execute(
        `SELECT ORACLE_ID, MIN, MAX, PRICE, CURRENCY, UNIT FROM PRODUCT_PRICES ORDER BY ORACLE_ID, MIN`,
      );
      productTagsResult = connection.execute(
        `SELECT ORACLE_ID, TAG_ID FROM TAG_PRODUCT_RELATION ORDER BY ORACLE_ID`,
      );
      productCategoryResult = connection.execute(
        `SELECT ORACLE_ID, CATEGORY_ID FROM TEST_PRODUCT_CATEGORY_RELATION ORDER BY ORACLE_ID`,
      );
    }

    const categoryMapping = connection.execute(
      `SELECT CATEGORY_ID, CATEGORY_TITLE, CATEGORY_LEVEL, CATEGORY_TYPE FROM PRODUCT_CATEGORY`,
    );
    const tagMapping = connection.execute(`SELECT TAG_ID, TAG_NAME FROM TAGS`);

    allPromises.push(productResult);
    allPromises.push(productImagesResult);
    allPromises.push(productPricesResult);
    allPromises.push(productTagsResult);
    allPromises.push(productCategoryResult);
    allPromises.push(categoryMapping);
    allPromises.push(tagMapping);
    const result = await Promise.all(allPromises);

    return {
      success: true,
      message: "商品獲取成功",
      data: {
        product: result[0].rows,
        images: result[1].rows,
        prices: result[2].rows,
        tags: result[3].rows,
        category: result[4].rows,
        categoryMapping: result[5].rows,
        tagMapping: result[6].rows,
      },
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

// 更新商品
export async function updateProduct(payload: any) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const { oracle_id } = payload;
    const allPromises = [];
    const updateColumn = Object.keys(payload);
    // 針對陣列資料進行排除
    const productColumn = updateColumn.filter(
      (item: any) =>
        item !== "priceRanges" &&
        item !== "main_images_changed" &&
        item !== "detail_images_changed" &&
        item !== "tags" &&
        item !== "oracle_id" &&
        item !== "brand_id" &&
        item !== "main_product_category" &&
        item !== "second_product_category" &&
        item !== "third_product_category",
    );
    const tagColumn = updateColumn.filter((item: any) => item === "tags");
    const priceColumn = updateColumn.filter(
      (item: any) => item === "priceRanges",
    );
    const mainImageColumn = updateColumn.filter(
      (item: any) => item === "main_images_changed",
    );
    const detailImageColumn = updateColumn.filter(
      (item: any) => item === "detail_images_changed",
    );
    const brandColumn = updateColumn.filter((item: any) => item === "brand_id");
    const mainProductCategoryColumn = updateColumn.filter(
      (item: any) => item === "main_product_category",
    );
    const secondProductCategoryColumn = updateColumn.filter(
      (item: any) => item === "second_product_category",
    );
    const thirdProductCategoryColumn = updateColumn.filter(
      (item: any) => item === "third_product_category",
    );
    // 商品更新設定
    if (productColumn.length > 0) {
      const productValues = productColumn.map((column) => payload[column]);
      const setProductClause = productColumn
        .map((column) => `${column} = :${column}`)
        .join(", ");

      // 創建綁定參數物件
      const bindProductParams: { [key: string]: any } = {};
      productColumn.forEach((column) => {
        bindProductParams[column] = payload[column];
      });
      bindProductParams.oracle_id = oracle_id;

      // 更新商品樂觀鎖版本
      const updateResult = connection.execute(
        `UPDATE PRODUCT SET ${setProductClause}, VERSION = VERSION + 1, LAST_UPDATED = :last_updated 
         WHERE oracle_id = :oracle_id`,
        {
          ...bindProductParams,
          last_updated: new Date().toISOString().split("T")[0],
        },
      );
      allPromises.push(updateResult);
    }
    // 商品標籤更新設定
    if (tagColumn.length > 0) {
      const tagValues = payload.tags; // 直接獲取標籤陣列
      const deleteTagResult = connection.execute(
        `DELETE FROM tag_product_relation WHERE oracle_id = :oracle_id`,
        { oracle_id },
      );
      allPromises.push(deleteTagResult);
      // 新增新的標籤關聯
      for (const tag_id of tagValues) {
        const insertTagResult = connection.execute(
          `INSERT INTO tag_product_relation (oracle_id, tag_id) VALUES (:oracle_id, :tag_id)`,
          { oracle_id, tag_id },
        );
        allPromises.push(insertTagResult);
      }
    }
    // 商品價格更新設定
    if (priceColumn.length > 0) {
      const priceValues = payload.priceRanges;
      const deletePriceResult = connection.execute(
        `DELETE FROM product_prices WHERE oracle_id = :oracle_id`,
        { oracle_id },
      );
      allPromises.push(deletePriceResult);
      for (const col of priceValues) {
        const { minQuantity, maxQuantity, unitPrice, unit } = col;
        const min = minQuantity;
        const max = maxQuantity;
        const price = unitPrice;
        const currency = "NTD";
        const insertPriceResult = connection.execute(
          `INSERT INTO product_prices (oracle_id, min, max, price, currency, unit) VALUES (:oracle_id, :min, :max, :price, :currency, :unit)`,
          { oracle_id, min, max, price, currency, unit },
        );
        allPromises.push(insertPriceResult);
      }
    }
    // 商品圖片更新設定
    if (mainImageColumn.length > 0) {
      const mainImageValues = payload.main_images_changed;
      mainImageValues.map((item: any) => {
        if (!connection) return;
        const image_url = item;
        const image_type = "main";
        const result = connection.execute(
          `INSERT INTO PRODUCT_IMAGES (oracle_id, image_url, image_type) VALUES (:oracle_id, :image_url, :image_type)`,
          [oracle_id, image_url, image_type],
        );
        allPromises.push(result);
      });
    }
    // 判斷商品主圖跟圖片表第一張圖片是否相同
    const checkMainImageResult = await connection.execute(
      `SELECT CASE WHEN P.IMAGE_URL = 
        (SELECT IMAGE_URL FROM PRODUCT_IMAGES 
         WHERE oracle_id = :oracle_id 
         AND image_type = 'main' 
         ORDER BY IMAGE_ID 
         FETCH FIRST 1 ROW ONLY) 
       THEN 1 ELSE 0 END AS IS_SAME
       FROM PRODUCT P
       WHERE P.oracle_id = :oracle_id`,
      { oracle_id },
    );

    const checkMainImageResultRows = checkMainImageResult.rows as any[];
    if (checkMainImageResultRows && checkMainImageResultRows[0][0] === 0) {
      const result = connection.execute(
        `UPDATE PRODUCT SET IMAGE_URL = 
        (SELECT IMAGE_URL FROM PRODUCT_IMAGES 
         WHERE oracle_id = :oracle_id 
         AND image_type = 'main' 
         ORDER BY IMAGE_ID 
         FETCH FIRST 1 ROW ONLY) 
        WHERE oracle_id = :oracle_id`,
        { oracle_id },
      );
      allPromises.push(result);
    }
    if (detailImageColumn.length > 0) {
      const detailImageValues = payload.detail_images_changed;
      detailImageValues.map((item: any) => {
        if (!connection) return;
        const image_url = item;
        const image_type = "detail";
        const result = connection.execute(
          `INSERT INTO PRODUCT_IMAGES (oracle_id, image_url, image_type) VALUES (:oracle_id, :image_url, :image_type)`,
          [oracle_id, image_url, image_type],
        );
        allPromises.push(result);
      });
    }
    // 商品分類更新設定
    if (brandColumn.length > 0) {
      const category_id = payload.brand_id;
      const checkBrandResult = await connection.execute(
        `SELECT COUNT(*) FROM TEST_PRODUCT_CATEGORY_RELATION TPCR LEFT JOIN PRODUCT_CATEGORY PC 
        ON TPCR.CATEGORY_ID = PC.CATEGORY_ID
        WHERE TPCR.ORACLE_ID = :oracle_id 
        AND PC.CATEGORY_TYPE = '製造商'`,
        { oracle_id },
      );
      const checkBrandResultRows = checkBrandResult.rows as any[];
      // 判斷資料是否存在
      if (checkBrandResultRows[0][0] > 0) {
        const result = connection.execute(
          `UPDATE TEST_PRODUCT_CATEGORY_RELATION TPCR SET TPCR.CATEGORY_ID = :category_id
           WHERE TPCR.ORACLE_ID = :oracle_id 
           AND EXISTS (
               SELECT 1
               FROM PRODUCT_CATEGORY PC
               WHERE PC.CATEGORY_ID = TPCR.CATEGORY_ID 
               AND PC.CATEGORY_TYPE = '製造商'
           )`,
          { oracle_id, category_id },
        );
        allPromises.push(result);
      } else {
        const result = connection.execute(
          `INSERT INTO TEST_PRODUCT_CATEGORY_RELATION (ORACLE_ID, CATEGORY_ID) VALUES (:oracle_id, :category_id)`,
          { oracle_id, category_id },
        );
        allPromises.push(result);
      }
    }
    if (mainProductCategoryColumn.length > 0) {
      const category_id = payload.main_product_category;
      const checkMainCategoryResult = await connection.execute(
        `SELECT COUNT(*) FROM TEST_PRODUCT_CATEGORY_RELATION TPCR LEFT JOIN PRODUCT_CATEGORY PC 
        ON TPCR.CATEGORY_ID = PC.CATEGORY_ID
        WHERE TPCR.ORACLE_ID = :oracle_id 
        AND PC.CATEGORY_TYPE = '產品' 
        AND PC.CATEGORY_LEVEL = 1`,
        { oracle_id },
      );
      const checkMainCategoryResultRows = checkMainCategoryResult.rows as any[];
      if (checkMainCategoryResultRows[0][0] > 0) {
        const result = connection.execute(
          `UPDATE TEST_PRODUCT_CATEGORY_RELATION TPCR SET TPCR.CATEGORY_ID = :category_id
           WHERE TPCR.ORACLE_ID = :oracle_id 
           AND EXISTS (
               SELECT 1
               FROM PRODUCT_CATEGORY PC
               WHERE PC.CATEGORY_ID = TPCR.CATEGORY_ID 
               AND PC.CATEGORY_TYPE = '產品'
               AND PC.CATEGORY_LEVEL = 1
           )`,
          { oracle_id, category_id },
        );
        allPromises.push(result);
      } else {
        const result = connection.execute(
          `INSERT INTO TEST_PRODUCT_CATEGORY_RELATION (ORACLE_ID, CATEGORY_ID) VALUES (:oracle_id, :category_id)`,
          { oracle_id, category_id },
        );
        allPromises.push(result);
      }
    }
    if (
      secondProductCategoryColumn.length > 0 &&
      payload.second_product_category
    ) {
      const category_id = payload.second_product_category;
      const checkResult = await connection.execute(
        `SELECT COUNT(*) FROM TEST_PRODUCT_CATEGORY_RELATION TPCR LEFT JOIN PRODUCT_CATEGORY PC 
        ON TPCR.CATEGORY_ID = PC.CATEGORY_ID
        WHERE TPCR.ORACLE_ID = :oracle_id 
        AND PC.CATEGORY_TYPE = '產品' 
        AND PC.CATEGORY_LEVEL = 2`,
        { oracle_id },
      );
      const resultRows = checkResult.rows as any[];
      const checkCategoryExist = resultRows[0][0] > 0;
      // 判斷中分類是否存在
      if (!checkCategoryExist) {
        const result = connection.execute(
          `INSERT INTO TEST_PRODUCT_CATEGORY_RELATION (ORACLE_ID, CATEGORY_ID) VALUES (:oracle_id, :category_id)`,
          { oracle_id, category_id },
        );
        allPromises.push(result);
      } else {
        // 判斷是否要清空中分類
        if (!category_id) {
          const result = connection.execute(
            `DELETE FROM TEST_PRODUCT_CATEGORY_RELATION TPCR 
            WHERE TPCR.ORACLE_ID = :oracle_id 
            AND EXISTS (
                SELECT 1
                FROM PRODUCT_CATEGORY PC
                WHERE PC.CATEGORY_ID = TPCR.CATEGORY_ID 
                AND PC.CATEGORY_TYPE = '產品'
                AND PC.CATEGORY_LEVEL = 2
            )`,
            { oracle_id },
          );
          allPromises.push(result);
        } else {
          const result = connection.execute(
            `UPDATE TEST_PRODUCT_CATEGORY_RELATION TPCR SET TPCR.CATEGORY_ID = :category_id
             WHERE TPCR.ORACLE_ID = :oracle_id 
             AND EXISTS (
                 SELECT 1
                 FROM PRODUCT_CATEGORY PC
                 WHERE PC.CATEGORY_ID = TPCR.CATEGORY_ID 
                 AND PC.CATEGORY_TYPE = '產品'
                 AND PC.CATEGORY_LEVEL = 2
            )`,
            { oracle_id, category_id },
          );
          allPromises.push(result);
        }
      }
    }
    if (
      thirdProductCategoryColumn.length > 0 &&
      payload.third_product_category
    ) {
      const category_id = payload.third_product_category;
      const checkResult = await connection.execute(
        `SELECT COUNT(*) FROM TEST_PRODUCT_CATEGORY_RELATION TPCR LEFT JOIN PRODUCT_CATEGORY PC 
        ON TPCR.CATEGORY_ID = PC.CATEGORY_ID
        WHERE TPCR.ORACLE_ID = :oracle_id 
        AND PC.CATEGORY_TYPE = '產品' AND PC.CATEGORY_LEVEL = 3`,
        { oracle_id },
      );
      const checkCategoryExist =
        checkResult && checkResult.rows && checkResult.rows.length > 0;
      // 判斷小分類是否存在
      if (!checkCategoryExist) {
        const result = connection.execute(
          `INSERT INTO TEST_PRODUCT_CATEGORY_RELATION (ORACLE_ID, CATEGORY_ID) VALUES (:oracle_id, :category_id)`,
          { oracle_id, category_id },
        );
        allPromises.push(result);
      } else {
        // 判斷是否要清空小分類
        if (!category_id) {
          const result = connection.execute(
            `DELETE FROM TEST_PRODUCT_CATEGORY_RELATION TPCR 
            WHERE TPCR.ORACLE_ID = :oracle_id 
            AND EXISTS (
                SELECT 1
                FROM PRODUCT_CATEGORY PC
                WHERE PC.CATEGORY_ID = TPCR.CATEGORY_ID 
                AND PC.CATEGORY_TYPE = '產品'
                AND PC.CATEGORY_LEVEL = 3
            )`,
            { oracle_id },
          );
          allPromises.push(result);
        } else {
          const result = connection.execute(
            `UPDATE TEST_PRODUCT_CATEGORY_RELATION TPCR SET TPCR.CATEGORY_ID = :category_id
             WHERE TPCR.ORACLE_ID = :oracle_id 
             AND EXISTS (
                 SELECT 1
                 FROM PRODUCT_CATEGORY PC
                 WHERE PC.CATEGORY_ID = TPCR.CATEGORY_ID 
                 AND PC.CATEGORY_TYPE = '產品'
                 AND PC.CATEGORY_LEVEL = 3
            )`,
            { oracle_id, category_id },
          );
          allPromises.push(result);
        }
      }
    }
    await Promise.all(allPromises);
    await connection.commit();
    await clearProductCache();
    return {
      success: true,
      message: "商品更新成功",
    };
  } catch (error) {
    console.log(error);
    await connection?.rollback();
    return {
      success: false,
      message: "商品更新失敗",
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

// 刪除商品圖片
export async function deleteProductImage(oracleid: number[]) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const allPromises: any[] = [];

    for (const id of oracleid) {
      if (!connection) continue;

      // 確保 ID 是有效的數字
      const oracle_id = Number(id);
      if (isNaN(oracle_id)) {
        console.log(`無效的 oracle_id: ${id}`);
        continue;
      }
      const result = connection.execute(
        `DELETE FROM product_images WHERE image_id = :id`,
        [id],
      );
      allPromises.push(result);
    }

    await Promise.all(allPromises);
    await connection.commit();
    await clearProductCache();
    return {
      success: true,
      message: "商品圖片刪除成功",
    };
  } catch (error) {
    console.log(error);
    await connection?.rollback();
    return {
      success: false,
      message: "商品圖片刪除失敗",
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

// 商品管理(後台)函數
async function getProductList(connection: any) {
  if (!connection) return;
  if (connection) {
    const productListResult = await connection.execute(
      `SELECT P.PRODUCT_ID, P.DESCRIPTION, P.BRAND, P.INVENTORY, P.FIXED_LOT_MULTIPLIER, 
               P.IMAGE_URL, P.PRICE, P.ORACLE_ID, P.IS_PUBLISHED, 
               PC_LIST.CATEGORY_TITLES, T_LIST.TAG_NAMES 
        FROM PRODUCT P
        LEFT JOIN (
        SELECT TPCR.ORACLE_ID, 
               LISTAGG(PC.CATEGORY_TITLE, '-') WITHIN GROUP (ORDER BY PC.CATEGORY_LEVEL, PC.CATEGORY_TITLE) AS CATEGORY_TITLES 
        FROM test_product_category_relation TPCR 
        JOIN PRODUCT_CATEGORY PC ON TPCR.CATEGORY_ID = PC.CATEGORY_ID 
        GROUP BY TPCR.ORACLE_ID
      ) PC_LIST ON P.ORACLE_ID = PC_LIST.ORACLE_ID
      LEFT JOIN (
        SELECT TPR.ORACLE_ID, 
               LISTAGG(T.TAG_NAME, '/') WITHIN GROUP (ORDER BY T.TAG_NAME) AS TAG_NAMES 
        FROM TAG_PRODUCT_RELATION TPR 
        JOIN TAGS T ON TPR.TAG_ID = T.TAG_ID 
        GROUP BY TPR.ORACLE_ID
      ) T_LIST ON P.ORACLE_ID = T_LIST.ORACLE_ID
        ORDER BY P.PRODUCT_ID
        OFFSET 0 ROWS FETCH NEXT 100 ROWS ONLY
        `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return productListResult.rows;
  }
}

// 查詢指定商品(後台)
export async function getProduct(oracle_id: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const allPromises = [];
    const productResult = connection.execute(
      `SELECT * FROM PRODUCT WHERE oracle_id = :oracle_id`,
      [oracle_id],
    );
    const productCategoryResult = connection.execute(
      `SELECT tpcr.category_id FROM test_product_category_relation tpcr 
        LEFT JOIN product_category pc ON tpcr.category_id = pc.category_id
        WHERE tpcr.ORACLE_ID = :oracle_id
        ORDER BY pc.CATEGORY_TYPE DESC, pc.CATEGORY_LEVEL `,
      [oracle_id],
    );
    const productTagResult = connection.execute(
      `SELECT * FROM tag_product_relation WHERE oracle_id = :oracle_id`,
      [oracle_id],
    );
    const productImagesResult = connection.execute(
      `SELECT * FROM product_images WHERE oracle_id = :oracle_id order by image_id`,
      [oracle_id],
    );
    const productPricesResult = connection.execute(
      `SELECT * FROM product_prices WHERE oracle_id = :oracle_id order by min`,
      [oracle_id],
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

// 建立標籤
export async function createTag(tag_name: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `INSERT INTO tags (tag_name) VALUES (:tag_name)`,
      [tag_name],
      { autoCommit: true },
    );
    // 若新增成功，則return標籤資料
    if (result.rowsAffected && result.rowsAffected > 0) {
      const tag = await connection.execute(`SELECT * FROM tags`);
      await clearProductCache();
      return {
        success: true,
        message: "標籤新增成功",
        data: tag.rows,
      };
    }
    return {
      success: false,
      message: "標籤新增失敗",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "標籤新增失敗",
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

//更新標籤
export async function updateTag(tag_id: number, tag_name: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `UPDATE tags SET tag_name = :tag_name WHERE tag_id = :tag_id`,
      [tag_name, tag_id],
      { autoCommit: true },
    );
    await clearProductCache();
    return {
      success: true,
      message: "標籤更新成功",
      data: result,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "標籤更新失敗",
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

// 刪除標籤

export async function deleteTag(tag_id: number) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `DELETE FROM tags WHERE tag_id = :tag_id`,
      [tag_id],
      { autoCommit: true },
    );
    await clearProductCache();
    return {
      success: true,
      message: "標籤刪除成功",
      data: result,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "標籤刪除失敗",
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

// 取得標籤
export async function getTag() {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(`SELECT * FROM tags`, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    return {
      success: true,
      message: "標籤查詢成功",
      data: result.rows,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "標籤查詢失敗",
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
// 取得標籤關聯
export async function getTagRelation() {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM tag_product_relation`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return {
      success: true,
      message: "標籤關聯查詢成功",
      data: result.rows,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "標籤查詢失敗",
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
// 套用標籤
export async function applyTag(payload: any) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const { productIds, tagIds } = payload;

    // 建立所有操作的 Promise 陣列
    const allPromises = [];

    // 對每個產品 ID 和分類 ID 組合進行處理
    for (const oracle_id of productIds) {
      const checkResult = await connection.execute(
        `SELECT COUNT(*) FROM tag_product_relation WHERE oracle_id = :oracle_id `,
        [oracle_id],
      );
      const checkTagExist =
        checkResult && checkResult.rows && checkResult.rows.length > 0;
      if (checkTagExist) {
        // 關聯已存在，執行更新操作
        const deletePromise = connection.execute(
          `DELETE FROM tag_product_relation WHERE oracle_id = :oracle_id `,
          [oracle_id],
        );
        allPromises.push(deletePromise);
      }
      for (const tag_id of tagIds) {
        // 檢查關聯是否已存在

        // 關聯不存在，執行插入操作
        const insertPromise = connection.execute(
          `INSERT INTO tag_product_relation (oracle_id, tag_id) VALUES (:oracle_id, :tag_id)`,
          [oracle_id, tag_id],
        );
        allPromises.push(insertPromise);
      }
    }
    // 等待所有操作完成
    await Promise.all(allPromises);
    // 提交事務
    await connection.commit();
    await clearProductCache();

    // 更新完成取得新標籤關聯
    const tagRelationResult = await connection.execute(
      `SELECT * FROM tag_product_relation`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    // 更新完成取得新標籤
    const tagResult = await connection.execute(`SELECT * FROM tags`, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    const productListResult = await getProductList(connection);

    // 回傳成功訊息
    return {
      success: true,
      message: "標籤套用成功",
      data: {
        tagRelationResult: tagRelationResult.rows,
        tagResult: tagResult.rows,
        productListResult,
      },
    };
  } catch (error) {
    console.log("error", error);
    return {
      success: false,
      message: "分類套用失敗",
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
// 更新標籤數量
export async function updateTagCount() {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE tags SET product_count = (SELECT COUNT(*) FROM tag_product_relation A WHERE tags.tag_id = A.tag_id GROUP BY A.tag_id)`,
      {},
      { autoCommit: true },
    );
    await clearProductCache();

    return {
      success: true,
      message: "標籤數量更新成功",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "標籤數量更新失敗",
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

// 上下架商品
export async function publishProduct(
  oracle_id: string[],
  is_published: number,
) {
  let connection: Connection | undefined;
  if (!oracle_id || oracle_id.length === 0) {
    // 根據您的業務邏輯返回適當的結果，例如 return; 或 return { rowsAffected: 0 };
    return;
  }

  try {
    connection = await getConnection();
    const bindParams: { [key: string]: any } = {
      is_published: is_published,
    };
    const idPlaceholders = oracle_id
      .map((id: string | number, index: number) => {
        const paramName = `id${index}`; // 產生唯一的參數名稱, 如 :id0, :id1, ...
        bindParams[paramName] = id; // 將值加入綁定物件, 如 { id0: '...', id1: '...' }
        return `:${paramName}`;
      })
      .join(", ");

    const sql = `UPDATE PRODUCT SET is_published = :is_published WHERE oracle_id IN (${idPlaceholders})`;

    // 4. 執行查詢
    const result = await connection.execute(
      sql,
      bindParams, // 傳遞包含 is_published 和所有 id 的完整綁定物件
      { autoCommit: true },
    );
    await clearProductCache();
    return result;
  } catch (error) {
    console.log(error);
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

// 批量匯入所有商品相關資料
export async function importAllProductData(payload: {
  products: any[];
  images: any[];
  prices: any[];
  tags: any[];
  categories: any[];
}) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const allPromises: any[] = [];
    const { products, images, prices, tags, categories } = payload;

    // 產品計數
    let productCount = 0;
    let imageCount = 0;
    let priceCount = 0;
    let tagCount = 0;
    let categoryCount = 0;

    // 1. 首先處理產品資料 (必須優先處理，因為其他表依賴於產品表的資料欄位)
    for (const product of products) {
      const {
        oracle_id,
        product_id,
        brand,
        description,
        inventory,
        vendor_lead_time,
        price,
        unit_weight,
        fixed_lot_multiplier,
        package_method,
        image_url,
        is_published,
        high_temp,
        high_voltage,
        low_temp,
        low_voltage,
        product_application,
        seo_description,
      } = product;

      // 驗證必要欄位
      if (!oracle_id) {
        console.log(`跳過無效產品資料: ${JSON.stringify(product)}`);
        continue;
      }
      // 檢查產品是否已存在
      const checkResult = await connection.execute(
        `SELECT COUNT(*) FROM PRODUCT WHERE oracle_id = :oracle_id`,
        [oracle_id],
      );
      const checkResultRows = checkResult.rows as any[];

      const productExists =
        checkResult.rows &&
        checkResult.rows[0] &&
        Number(checkResultRows[0][0]) > 0;

      if (productExists) {
        // 如果產品已存在，進行更新
        const updateFields = [];
        const bindParams: any = { oracle_id };

        if (product_id) {
          updateFields.push("product_id = :product_id");
          bindParams.product_id = product_id;
        }
        if (brand) {
          updateFields.push("brand = :brand");
          bindParams.brand = brand;
        }
        if (description) {
          updateFields.push("description = :description");
          bindParams.description = description;
        }
        if (inventory) {
          updateFields.push("inventory = :inventory");
          bindParams.inventory = inventory;
        }
        if (vendor_lead_time) {
          updateFields.push("vendor_lead_time = :vendor_lead_time");
          bindParams.vendor_lead_time = vendor_lead_time;
        }
        if (price) {
          updateFields.push("price = :price");
          bindParams.price = price;
        }
        if (unit_weight) {
          updateFields.push("unit_weight = :unit_weight");
          bindParams.unit_weight = unit_weight;
        }
        if (fixed_lot_multiplier) {
          updateFields.push("fixed_lot_multiplier = :fixed_lot_multiplier");
          bindParams.fixed_lot_multiplier = fixed_lot_multiplier;
        }
        if (package_method) {
          updateFields.push("package_method = :package_method");
          bindParams.package_method = package_method;
        }
        if (image_url) {
          updateFields.push("image_url = :image_url");
          bindParams.image_url = image_url;
        }
        if (is_published !== undefined) {
          updateFields.push("is_published = :is_published");
          bindParams.is_published = is_published;
        }
        if (high_temp) {
          updateFields.push("high_temp = :high_temp");
          bindParams.high_temp = high_temp;
        }
        if (high_voltage) {
          updateFields.push("high_voltage = :high_voltage");
          bindParams.high_voltage = high_voltage;
        }
        if (low_temp) {
          updateFields.push("low_temp = :low_temp");
          bindParams.low_temp = low_temp;
        }
        if (low_voltage) {
          updateFields.push("low_voltage = :low_voltage");
          bindParams.low_voltage = low_voltage;
        }
        if (product_application) {
          updateFields.push("product_application = :product_application");
          bindParams.product_application = product_application;
        }
        if (seo_description) {
          updateFields.push("seo_description = :seo_description");
          bindParams.seo_description = seo_description;
        }

        if (updateFields.length > 0) {
          const result = connection.execute(
            `UPDATE PRODUCT SET ${updateFields.join(
              ", ",
            )} WHERE oracle_id = :oracle_id`,
            bindParams,
          );
          allPromises.push(result);
          productCount++;
        }
      } else {
        // 如果產品不存在，進行插入
        const result = connection.execute(
          `INSERT INTO PRODUCT (oracle_id, product_id, brand, description, inventory, 
              vendor_lead_time, price, unit_weight, fixed_lot_multiplier, package_method, 
              image_url, is_published, high_temp, high_voltage, low_temp, low_voltage, 
              product_application, seo_description) 
             VALUES (:oracle_id, :product_id, :brand, :description, :inventory, 
              :vendor_lead_time, :price, :unit_weight, :fixed_lot_multiplier, :package_method, 
              :image_url, :is_published, :high_temp, :high_voltage, :low_temp, :low_voltage, 
              :product_application, :seo_description)`,
          [
            oracle_id,
            product_id || null,
            brand || null,
            description || null,
            inventory || 0,
            vendor_lead_time || 0,
            price || 0,
            unit_weight || 0,
            fixed_lot_multiplier || 0,
            package_method || null,
            image_url || null,
            is_published || 0,
            high_temp || null,
            high_voltage || null,
            low_temp || null,
            low_voltage || null,
            product_application || null,
            seo_description || null,
          ],
        );
        allPromises.push(result);
        productCount++;
      }
    }

    // 2. 處理圖片資料
    for (const image of images) {
      const { oracle_id, image_url, image_type } = image;

      // 驗證必要欄位
      if (!oracle_id || !image_url) {
        console.log(`跳過無效圖片資料: ${JSON.stringify(image)}`);
        continue;
      }

      // 檢查產品是否存在
      const checkProductResult = await connection.execute(
        `SELECT COUNT(*) FROM PRODUCT WHERE oracle_id = :oracle_id`,
        [oracle_id],
      );
      const checkResultRows = checkProductResult.rows as any[];

      const productExists =
        checkProductResult.rows &&
        checkProductResult.rows[0] &&
        Number(checkResultRows[0][0]) > 0;

      if (!productExists) {
        console.log(`跳過圖片: 產品 ${oracle_id} 不存在`);
        continue;
      }

      // 檢查圖片是否已存在
      const checkImageResult = await connection.execute(
        `SELECT COUNT(*) FROM PRODUCT_IMAGES WHERE oracle_id = :oracle_id AND image_url = :image_url AND image_type = :image_type`,
        [oracle_id, image_url, image_type],
      );
      const checkImageResultRows = checkImageResult.rows as any[];

      const imageExists =
        checkImageResult.rows &&
        checkImageResult.rows[0] &&
        Number(checkImageResultRows[0][0]) > 0;

      if (!imageExists) {
        const result = connection.execute(
          `INSERT INTO PRODUCT_IMAGES (oracle_id, image_url, image_type) VALUES (:oracle_id, :image_url, :image_type)`,
          [oracle_id, image_url, image_type],
        );
        allPromises.push(result);
        imageCount++;
      }
    }

    // 3. 處理價格資料
    for (const price of prices) {
      const { oracle_id, min, max, price: priceValue, currency, unit } = price;

      // 驗證必要欄位
      if (!oracle_id || priceValue === undefined) {
        console.log(`跳過無效價格資料: ${JSON.stringify(price)}`);
        continue;
      }

      // 檢查產品是否存在
      const checkProductResult = await connection.execute(
        `SELECT COUNT(*) FROM PRODUCT WHERE oracle_id = :oracle_id`,
        [oracle_id],
      );
      const checkProductResultRows = checkProductResult.rows as any[];
      const productExists =
        checkProductResult.rows &&
        checkProductResult.rows[0] &&
        Number(checkProductResultRows[0][0]) > 0;

      if (!productExists) {
        console.log(`跳過價格: 產品 ${oracle_id} 不存在`);
        continue;
      }

      // 檢查價格是否已存在
      const checkPriceResult = await connection.execute(
        `SELECT COUNT(*) FROM PRODUCT_PRICES WHERE oracle_id = :oracle_id AND min = :min AND max = :max`,
        [oracle_id, min || 0, max || 0],
      );
      const checkPriceResultRows = checkPriceResult.rows as any[];
      const priceExists =
        checkPriceResult.rows &&
        checkPriceResult.rows[0] &&
        Number(checkPriceResultRows[0][0]) > 0;

      if (priceExists) {
        // 更新價格
        const result = connection.execute(
          `UPDATE PRODUCT_PRICES SET price = :price, currency = :currency, unit = :unit 
           WHERE oracle_id = :oracle_id AND min = :min AND max = :max`,
          [
            priceValue,
            currency || "NTD",
            unit || "",
            oracle_id,
            min || 0,
            max || 0,
          ],
        );
        allPromises.push(result);
        priceCount++;
      } else {
        // 插入價格
        const result = connection.execute(
          `INSERT INTO PRODUCT_PRICES (oracle_id, min, max, price, currency, unit) 
           VALUES (:oracle_id, :min, :max, :price, :currency, :unit)`,
          [
            oracle_id,
            min || 0,
            max || 0,
            priceValue,
            currency || "NTD",
            unit || "",
          ],
        );
        allPromises.push(result);
        priceCount++;
      }
    }
    const checkTagOracleid: string[] = [];
    // 4. 處理標籤資料
    for (const tag of tags) {
      const { oracle_id, tag_id } = tag;

      // 驗證必要欄位
      if (!oracle_id || !tag_id) {
        console.log(`跳過無效標籤資料: ${JSON.stringify(tag)}`);
        continue;
      }

      // 檢查產品是否存在
      const checkProductResult = await connection.execute(
        `SELECT COUNT(*) FROM PRODUCT WHERE oracle_id = :oracle_id`,
        [oracle_id],
      );
      const checkProductResultRows = checkProductResult.rows as any[];
      const productExists =
        checkProductResult.rows &&
        checkProductResult.rows[0] &&
        Number(checkProductResultRows[0][0]) > 0;

      if (!productExists) {
        console.log(`跳過標籤: 產品 ${oracle_id} 不存在`);
        continue;
      }

      // 檢查標籤是否存在
      const checkTagResult = await connection.execute(
        `SELECT COUNT(*) FROM TAGS WHERE tag_id = :tag_id`,
        [tag_id],
      );
      const checkTagResultRows = checkTagResult.rows as any[];
      const tagExists =
        checkTagResult.rows &&
        checkTagResult.rows[0] &&
        Number(checkTagResultRows[0][0]) > 0;

      if (!tagExists) {
        console.log(`跳過標籤: 標籤 ${tag_id} 不存在`);
        continue;
      }

      if (!checkTagOracleid.includes(oracle_id)) {
        const deleteTagResult = connection.execute(
          `DELETE FROM TAG_PRODUCT_RELATION WHERE oracle_id = :oracle_id`,
          [oracle_id],
        );
        allPromises.push(deleteTagResult);
        checkTagOracleid.push(oracle_id);
      }

      // 檢查關聯是否已存在
      const checkRelationResult = await connection.execute(
        `SELECT COUNT(*) FROM TAG_PRODUCT_RELATION WHERE oracle_id = :oracle_id AND tag_id = :tag_id`,
        [oracle_id, tag_id],
      );
      const checkRelationResultRows = checkRelationResult.rows as any[];
      const relationExists =
        checkRelationResult.rows &&
        checkRelationResult.rows[0] &&
        Number(checkRelationResultRows[0][0]) > 0;

      if (!relationExists) {
        const result = connection.execute(
          `INSERT INTO TAG_PRODUCT_RELATION (oracle_id, tag_id) VALUES (:oracle_id, :tag_id)`,
          [oracle_id, tag_id],
        );
        allPromises.push(result);
        tagCount++;
      }
    }
    const checkOracleid: string[] = [];
    // 5. 處理分類資料
    for (const category of categories) {
      const { oracle_id, category_id } = category;

      // 驗證必要欄位
      if (!oracle_id || !category_id) {
        console.log(`跳過無效分類資料: ${JSON.stringify(category)}`);
        continue;
      }

      // 檢查產品是否存在
      const checkProductResult = await connection.execute(
        `SELECT COUNT(*) FROM PRODUCT WHERE oracle_id = :oracle_id`,
        [oracle_id],
      );
      const checkProductResultRows = checkProductResult.rows as any[];
      const productExists =
        checkProductResult.rows &&
        checkProductResult.rows[0] &&
        Number(checkProductResultRows[0][0]) > 0;

      if (!productExists) {
        console.log(`跳過分類: 產品 ${oracle_id} 不存在`);
        continue;
      }

      // 檢查分類是否存在
      const checkCategoryResult = await connection.execute(
        `SELECT COUNT(*) FROM PRODUCT_CATEGORY WHERE category_id = :category_id`,
        [category_id],
      );
      const checkCategoryResultRows = checkCategoryResult.rows as any[];
      const categoryExists =
        checkCategoryResult.rows &&
        checkCategoryResult.rows[0] &&
        Number(checkCategoryResultRows[0][0]) > 0;

      if (!categoryExists) {
        console.log(`跳過分類: 分類 ${category_id} 不存在`);
        continue;
      }
      // 判斷oracle_id是否已檢查
      if (!checkOracleid.includes(oracle_id)) {
        const deleteCategoryResult = connection.execute(
          `DELETE FROM TEST_PRODUCT_CATEGORY_RELATION WHERE oracle_id = :oracle_id`,
          [oracle_id],
        );
        allPromises.push(deleteCategoryResult);
        checkOracleid.push(oracle_id);
      }

      // 檢查關聯是否已存在
      const checkRelationResult = await connection.execute(
        `SELECT COUNT(*) FROM TEST_PRODUCT_CATEGORY_RELATION WHERE oracle_id = :oracle_id AND category_id = :category_id`,
        [oracle_id, category_id],
      );
      const checkRelationResultRows = checkRelationResult.rows as any[];
      const relationExists =
        checkRelationResult.rows &&
        checkRelationResult.rows[0] &&
        Number(checkRelationResultRows[0][0]) > 0;

      if (!relationExists) {
        const result = connection.execute(
          `INSERT INTO TEST_PRODUCT_CATEGORY_RELATION (oracle_id, category_id) VALUES (:oracle_id, :category_id)`,
          [oracle_id, category_id],
        );
        allPromises.push(result);
        categoryCount++;
      }
    }

    // 等待所有操作完成
    await Promise.all(allPromises);

    // 提交事務
    await connection.commit();
    await clearProductCache();
    return {
      success: true,
      message: "商品資料匯入成功",
      productCount,
      imageCount,
      priceCount,
      tagCount,
      categoryCount,
    };
  } catch (error) {
    console.log("匯入商品資料時出錯:", error);
    await connection?.rollback();
    return {
      success: false,
      message: "商品資料匯入失敗",
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

// 清除redis快取
async function clearProductCache() {
  try {
    // 清除所有產品相關的快取
    const patterns = [
      // 精準鍵（無參數）
      "product:GET:/api/main/product/hotProducts",
      "product:GET:/api/main/product/newProducts",
      "product:GET:/api/main/product/saleProducts",
      "product:GET:/api/main/product/productList",
      "product:GET:/api/main/product/category",
      "product:GET:/api/main/product/category2",
      "product:GET:/api/admin/product/category",
      "product:GET:/api/admin/product/category2",
      "product:GET:/api/admin/product/",
      "product:GET:/api/admin/product/productCategory",
      "product:GET:/api/admin/product/manufactureCategory",

      // 參數化鍵（多種樣式，確保都能命中）
      "product:GET:/api/main/product/productsByCategory:*",
      "product:GET:/api/main/product/productsByCategory/*",
      "product:*productsByCategory*",

      "product:GET:/api/main/product/categoryCount:*",
      "product:GET:/api/main/product/categoryCount/*",
      "product:*categoryCount*",

      "product:GET:/api/main/product/categoryCounts/batch",
      "product:GET:/api/main/product/categoryCounts/batch/*",
      "product:*categoryCounts*",
    ];

    for (const pattern of patterns) {
      await redisCacheService.delPattern(pattern);
      console.log(`已清除快取模式: ${pattern}`);
    }
  } catch (error) {
    console.error("清除快取失敗:", error);
    // 不拋出錯誤，讓主要更新操作繼續
  }
}
