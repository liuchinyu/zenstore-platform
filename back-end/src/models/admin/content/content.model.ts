import { getConnection } from "../../../config/database";
import oracledb from "oracledb";
import redisCacheService from "../../../services/redis.service";

// 取得公告
export async function getAnnouncements() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ANNOUNCEMENTS_ID, TITLE, CATEGORY, CONTENT, STATUS, PUBLISH_DATE, END_DATE FROM ANNOUNCEMENTS ORDER BY PUBLISH_DATE DESC`,
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

// 建立公告
export async function createAnnouncement(data: any) {
  let connection;
  try {
    connection = await getConnection();
    const { TITLE, CATEGORY, CONTENT, STATUS, PUBLISH_DATE, END_DATE } = data;
    const result = await connection.execute(
      `INSERT INTO ANNOUNCEMENTS (TITLE, CATEGORY, CONTENT, STATUS, PUBLISH_DATE, END_DATE) 
       VALUES (:TITLE, :CATEGORY, :CONTENT, :STATUS, :PUBLISH_DATE, :END_DATE)`,
      { TITLE, CATEGORY, CONTENT, STATUS, PUBLISH_DATE, END_DATE },
      { autoCommit: true },
    );
    await clearContentsCache("announcements");
    return result;
  } catch (error) {
    console.error("新增公告失敗:", error);
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

// 更新公告
export async function updateAnnouncement(id: string, data: any) {
  let connection;
  try {
    connection = await getConnection();
    // 開始事務

    const { TITLE, CATEGORY, CONTENT, STATUS, PUBLISH_DATE } = data;

    // 第一個SQL - 更新公告基本信息
    await connection.execute(
      `UPDATE ANNOUNCEMENTS 
       SET TITLE = :TITLE, CATEGORY = :CATEGORY, CONTENT = :CONTENT, 
           STATUS = :STATUS, PUBLISH_DATE = :PUBLISH_DATE, END_DATE = ''
       WHERE ANNOUNCEMENTS_ID = :ID`,
      { TITLE, CATEGORY, CONTENT, STATUS, PUBLISH_DATE, ID: id },
      { autoCommit: false },
    );

    // 如果狀態為0，則更新END_DATE
    if (Number(STATUS) === 0) {
      const currentEndDate = new Date().toISOString().split("T")[0];
      await connection.execute(
        `UPDATE ANNOUNCEMENTS 
         SET END_DATE = :END_DATE 
         WHERE ANNOUNCEMENTS_ID = :ID`,
        { END_DATE: currentEndDate, ID: id },
        { autoCommit: false },
      );
    }

    // 提交事務
    await connection.commit();
    await clearContentsCache("announcements");
    return { message: "更新公告成功", success: true };
  } catch (error) {
    console.error("更新公告失敗:", error);
    // 發生錯誤時回滾事務
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("回滾事務失敗:", rollbackError);
      }
    }
    return { message: "更新公告失敗", success: false };
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

// 刪除公告
export async function deleteAnnouncement(id: string) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `DELETE FROM ANNOUNCEMENTS WHERE ANNOUNCEMENTS_ID = :ID`,
      { ID: id },
      { autoCommit: true },
    );
    await clearContentsCache("announcements");
    return result;
  } catch (error) {
    console.error("刪除公告失敗:", error);
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

// 新增輪播資料
export async function addCarousel(data: any) {
  let connection;
  try {
    connection = await getConnection();

    const title = data.TITLE;
    const description = data.DESCRIPTION;
    const image_url = data.IMAGE_URL;
    const button_text = data.BUTTON_TEXT;
    const button_link = data.BUTTON_LINK;
    const text_color = data.TEXT_COLOR;
    const background_color = data.BACKGROUND_COLOR;
    const position = data.POSITION;
    const display_Order = data.DISPLAY_ORDER;
    const created_at = new Date().toISOString().split("T")[0];
    const result = await connection.execute(
      `INSERT INTO CAROUSEL_ITEMS (TITLE, DESCRIPTION, IMAGE_URL, BUTTON_TEXT, BUTTON_LINK, TEXT_COLOR, BACKGROUND_COLOR, POSITION, DISPLAY_ORDER, CREATED_AT) VALUES (:TITLE, :DESCRIPTION, :IMAGE_URL, :BUTTON_TEXT, :BUTTON_LINK, :TEXT_COLOR, :BACKGROUND_COLOR, :POSITION, :DISPLAY_ORDER, :CREATED_AT)`,
      {
        TITLE: title,
        DESCRIPTION: description,
        IMAGE_URL: image_url,
        BUTTON_TEXT: button_text,
        BUTTON_LINK: button_link,
        TEXT_COLOR: text_color,
        BACKGROUND_COLOR: background_color,
        POSITION: position,
        DISPLAY_ORDER: display_Order,
        CREATED_AT: created_at,
      },
      { autoCommit: true },
    );
    await clearContentsCache("carousel");
    if (result.rowsAffected && result.rowsAffected > 0) {
      return { success: true, message: "輪播資料新增成功" };
    } else {
      return { success: false, message: "輪播資料新增失敗" };
    }
  } catch (error) {
    console.error("新增輪播資料失敗:", error);
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

// 更新輪播資料
export async function updateCarousel(data: any) {
  let connection;
  try {
    connection = await getConnection();
    const id = data.ID;
    const title = data.TITLE;
    const description = data.DESCRIPTION;
    const image_url = data.IMAGE_URL;
    const button_text = data.BUTTON_TEXT;
    const button_link = data.BUTTON_LINK;
    const text_color = data.TEXT_COLOR;
    const background_color = data.BACKGROUND_COLOR;
    const position = data.POSITION;
    const display_Order = data.DISPLAY_ORDER;
    const created_at = new Date().toISOString().split("T")[0];
    const result = await connection.execute(
      `UPDATE CAROUSEL_ITEMS SET TITLE = :title, DESCRIPTION = :description, IMAGE_URL = :image_url , BUTTON_TEXT = :button_text, BUTTON_LINK = :button_link, 
      TEXT_COLOR = :text_color, BACKGROUND_COLOR = :background_color, POSITION = :position, DISPLAY_ORDER = :display_Order, CREATED_AT = :created_at WHERE ID = :id`,
      {
        title: title,
        description: description,
        image_url: image_url,
        button_text: button_text,
        button_link: button_link,
        text_color: text_color,
        background_color: background_color,
        position: position,
        display_Order: display_Order,
        created_at: created_at,
        id: id,
      },
      { autoCommit: true },
    );
    await clearContentsCache("carousel");
    if (result.rowsAffected && result.rowsAffected > 0) {
      return { success: true, message: "輪播資料更新成功" };
    } else {
      return { success: false, message: "輪播資料更新失敗" };
    }
  } catch (error) {
    console.error("更新輪播資料失敗:", error);
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

// 更新輪播順序
export async function updateCarouselOrder(
  id: number,
  display_order: number,
  change: number,
) {
  let connection;
  try {
    connection = await getConnection();
    let allPromises = [];
    // 順位往後，原先在後面順位的要往前一階
    if (change > 0) {
      const changedResult = connection.execute(
        `UPDATE CAROUSEL_ITEMS SET DISPLAY_ORDER = :display_order - 1 WHERE DISPLAY_ORDER = :display_order`,
        { display_order: display_order },
      );
      allPromises.push(changedResult);
    } else {
      // 順位往前，原先在前面順位的要往後一階
      const changedResult = connection.execute(
        `UPDATE CAROUSEL_ITEMS SET DISPLAY_ORDER = :display_order + 1 WHERE DISPLAY_ORDER = :display_order `,
        { display_order: display_order },
      );
      allPromises.push(changedResult);
    }
    const changeResult = connection.execute(
      `UPDATE CAROUSEL_ITEMS SET DISPLAY_ORDER = :display_order WHERE ID = :id`,
      { id: id, display_order: display_order },
    );
    allPromises.push(changeResult);

    await Promise.all(allPromises);
    await connection.commit();
    await clearContentsCache("carousel");
    return { success: true, message: "輪播順序更新成功" };
  } catch (error) {
    console.error("更新輪播順序失敗:", error);
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

// 刪除輪播資料
export async function deleteCarousel(id: number, index: number) {
  let connection;
  try {
    connection = await getConnection();
    let allPromises = [];
    const deleteResult = connection.execute(
      `DELETE FROM CAROUSEL_ITEMS WHERE ID = :id`,
      { id: id },
    );
    allPromises.push(deleteResult);
    const updateResult = connection.execute(
      `UPDATE CAROUSEL_ITEMS SET DISPLAY_ORDER = DISPLAY_ORDER - 1 WHERE DISPLAY_ORDER > :displayOrder`,
      { displayOrder: index },
    );
    allPromises.push(updateResult);
    await Promise.all(allPromises);
    await connection.commit();
    await clearContentsCache("carousel");
    return { success: true, message: "輪播資料刪除成功" };
  } catch (error) {
    console.error("刪除輪播資料失敗:", error);
    return { success: false, message: "輪播資料刪除失敗" };
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

// 取得跑馬燈清單
export async function getMarquees() {
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

// 建立跑馬燈
export async function createMarquee(data: any) {
  let connection: oracledb.Connection | undefined;
  try {
    connection = await getConnection();
    const {
      TEXT,
      SPEED_MS,
      TEXT_COLOR = null,
      BACKGROUND_COLOR = null,
      IS_ACTIVE = 0,
      PUBLISH_DATE = null,
      END_DATE = null,
    } = data;

    const result = await connection.execute(
      `INSERT INTO MARQUEE_ITEMS 
        (TEXT, SPEED_MS, TEXT_COLOR, BACKGROUND_COLOR, IS_ACTIVE, PUBLISH_DATE, END_DATE)
       VALUES 
        (:TEXT, :SPEED_MS, :TEXT_COLOR, :BACKGROUND_COLOR, :IS_ACTIVE, :PUBLISH_DATE, :END_DATE)
       RETURNING ID INTO :out_id`,
      {
        TEXT,
        SPEED_MS,
        TEXT_COLOR,
        BACKGROUND_COLOR,
        IS_ACTIVE,
        PUBLISH_DATE,
        END_DATE,
        out_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true },
    );

    await clearContentsCache("marquee");

    const insertedId = (result.outBinds as any)?.out_id?.[0] ?? null;
    return { success: true, message: "created", id: insertedId };
  } catch (error) {
    console.error("新增跑馬燈失敗:", error);
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

// 更新跑馬燈
export async function updateMarqueePartial(id: string, data: any) {
  let connection: oracledb.Connection | undefined;
  try {
    connection = await getConnection();

    const fields: string[] = [];
    const binds: Record<string, any> = { ID: id };

    const allowed = [
      "TEXT",
      "SPEED_MS",
      "TEXT_COLOR",
      "BACKGROUND_COLOR",
      "IS_ACTIVE",
      "PUBLISH_DATE",
      "END_DATE",
    ];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        fields.push(`${key} = :${key}`);
        binds[key] = data[key];
      }
    }

    if (fields.length === 0) {
      return { success: true, message: "no changes" };
    }

    const sql = `UPDATE MARQUEE_ITEMS SET ${fields.join(", ")} WHERE ID = :ID`;
    await connection.execute(sql, binds, { autoCommit: true });

    await clearContentsCache("marquee");
    return { success: true, message: "updated" };
  } catch (error) {
    console.error("更新跑馬燈失敗:", error);
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

// 刪除跑馬燈
export async function deleteMarquee(id: string) {
  let connection: oracledb.Connection | undefined;
  try {
    connection = await getConnection();
    await connection.execute(
      `DELETE FROM MARQUEE_ITEMS WHERE ID = :ID`,
      { ID: id },
      { autoCommit: true },
    );
    await clearContentsCache("marquee");
    return { success: true, message: "deleted" };
  } catch (error) {
    console.error("刪除跑馬燈失敗:", error);
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

// 啟用（保證單一啟用）
export async function activateMarquee(id: string) {
  let connection: oracledb.Connection | undefined;
  try {
    const today = new Date().toISOString().split("T")[0];
    connection = await getConnection();
    // 先將所有跑馬燈停用，並設定結束日期為今天
    await connection.execute(
      `UPDATE MARQUEE_ITEMS SET IS_ACTIVE = 0, END_DATE = :END_DATE`,
      { END_DATE: today },
      { autoCommit: false },
    );
    // 再將指定跑馬燈啟用，並設定結束日期為空
    await connection.execute(
      `UPDATE MARQUEE_ITEMS SET IS_ACTIVE = 1, END_DATE = '' WHERE ID = :ID`,
      { ID: id },
      { autoCommit: false },
    );
    await connection.commit();
    await clearContentsCache("marquee");
    return { success: true, message: "activated" };
  } catch (error) {
    console.error("啟用跑馬燈失敗:", error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("回滾事務失敗:", rollbackError);
      }
    }
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

// 停用
export async function deactivateMarquee(id: string) {
  let connection: oracledb.Connection | undefined;
  try {
    connection = await getConnection();
    await connection.execute(
      `UPDATE MARQUEE_ITEMS SET IS_ACTIVE = 0 WHERE ID = :ID`,
      { ID: id },
      { autoCommit: true },
    );
    await clearContentsCache("marquee");
    return { success: true, message: "deactivated" };
  } catch (error) {
    console.error("停用跑馬燈失敗:", error);
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

// 建立技術資源
export async function createNews(data: any) {
  let connection;
  try {
    connection = await getConnection();
    const { TITLE, CATEGORY, URL, UPLOAD_DATE, DESCRIPTION } = data;
    const result = await connection.execute(
      `INSERT INTO NEWS (TITLE, CATEGORY, URL, UPLOAD_DATE, DESCRIPTION) VALUES (:TITLE, :CATEGORY, :URL, :UPLOAD_DATE, :DESCRIPTION)`,
      { TITLE, CATEGORY, URL, UPLOAD_DATE, DESCRIPTION },
      { autoCommit: true },
    );
    await clearContentsCache("news");
    return result;
  } catch (error) {
    console.error("新增技術資源失敗:", error);
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

// 更新技術資源
export async function updateNews(id: string, data: any) {
  let connection;
  try {
    connection = await getConnection();
    const { TITLE, CATEGORY, URL, UPLOAD_DATE, DESCRIPTION } = data;
    const result = await connection.execute(
      `UPDATE NEWS SET TITLE = :TITLE, CATEGORY = :CATEGORY, URL = :URL, UPLOAD_DATE = :UPLOAD_DATE, DESCRIPTION = :DESCRIPTION WHERE NEWS_ID = :ID`,
      { TITLE, CATEGORY, URL, UPLOAD_DATE, DESCRIPTION, ID: id },
      { autoCommit: true },
    );
    await clearContentsCache("news");
    return result;
  } catch (error) {
    console.error("更新技術資源失敗:", error);
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

export async function deleteNews(id: string) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `DELETE FROM NEWS WHERE NEWS_ID = :ID`,
      { ID: id },
      { autoCommit: true },
    );
    await clearContentsCache("news");
    return result;
  } catch (error) {
    console.error("刪除技術資源失敗:", error);
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

export async function getStoreInfo() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM STORE_INFO`,
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

// 建立商店資訊
export async function createStoreInfo(data: any) {
  let connection;
  try {
    console.log("data...", data);
    connection = await getConnection();
    const {
      TITLE,
      CONTENT,
      TITLE_COLOR,
      CONTENT_COLOR = null,
      TITLE_FONT_SIZE,
      CONTENT_FONT_SIZE,
      IMAGE_URL,
      IS_ACTIVE = 0,
      CREATED_AT = null,
      UPDATED_AT = null,
    } = data;

    const result = await connection.execute(
      `INSERT INTO STORE_INFO 
          (TITLE, CONTENT, TITLE_COLOR, CONTENT_COLOR, TITLE_FONT_SIZE, CONTENT_FONT_SIZE, IMAGE_URL, IS_ACTIVE, CREATED_AT, UPDATED_AT)
         VALUES 
          (:TITLE, :CONTENT, :TITLE_COLOR, :CONTENT_COLOR, :TITLE_FONT_SIZE, :CONTENT_FONT_SIZE, :IMAGE_URL, :IS_ACTIVE, :CREATED_AT, :UPDATED_AT)
         RETURNING ID INTO :out_id`,
      {
        TITLE,
        CONTENT,
        TITLE_COLOR,
        CONTENT_COLOR,
        TITLE_FONT_SIZE,
        CONTENT_FONT_SIZE,
        IMAGE_URL,
        IS_ACTIVE,
        CREATED_AT,
        UPDATED_AT,
        out_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true },
    );

    await clearContentsCache("store-info");

    const insertedId = (result.outBinds as any)?.out_id?.[0] ?? null;
    return { success: true, message: "created", id: insertedId };
  } catch (error) {
    console.error("新增跑馬燈失敗:", error);
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

// 刪除商店資訊
export async function deleteStoreInfo(id: string) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `DELETE FROM STORE_INFO WHERE ID = :ID`,
      { ID: id },
      { autoCommit: true },
    );
    await clearContentsCache("store-info");
    return result;
  } catch (error) {
    console.error("刪除商店資訊失敗:", error);
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

// 修改商店資訊
export async function updateStoreInfo(id: string, data: any) {
  let connection;
  try {
    connection = await getConnection();
    const fields: string[] = [];
    const binds: Record<string, any> = { ID: id };

    const allowed = [
      "TITLE",
      "TITLE_FONT_SIZE",
      "CONTENT",
      "CONTENT_FONT_SIZE",
      "TITLE_COLOR",
      "CONTENT_COLOR",
      "IMAGE_URL",
      "IS_ACTIVE",
    ];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        fields.push(`${key} = :${key}`);
        binds[key] = data[key];
      }
    }

    if (fields.length === 0) {
      return { success: true, message: "no changes" };
    }

    const sql = `UPDATE STORE_INFO SET ${fields.join(", ")} WHERE ID = :ID`;
    await connection.execute(sql, binds, { autoCommit: true });
    await clearContentsCache("store-info");
    return { success: true, message: "updated" };
  } catch (error) {
    console.error("修改商店資訊失敗:", error);
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

// 啟用（保證單一啟用）
export async function activateStoreInfo(id: string) {
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `UPDATE STORE_INFO SET IS_ACTIVE = 0`,
      {},
      { autoCommit: false },
    );
    await connection.execute(
      `UPDATE STORE_INFO SET IS_ACTIVE = 1 WHERE ID = :ID`,
      { ID: id },
      { autoCommit: false },
    );
    await connection.commit();
    await clearContentsCache("store-info");
    return { success: true, message: "activated" };
  } catch (error) {
    console.error("啟用商場資訊失敗:", error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("回滾事務失敗:", rollbackError);
      }
    }
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

// 停用
export async function deactivateStoreInfo(id: string) {
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `UPDATE STORE_INFO SET IS_ACTIVE = 0 WHERE ID = :ID`,
      { ID: id },
      { autoCommit: true },
    );
    await clearContentsCache("store-info");
    return { success: true, message: "deactivated" };
  } catch (error) {
    console.error("停用商場資訊失敗:", error);
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

// 建立技術資源
export async function createTechResource(data: any) {
  let connection;
  try {
    connection = await getConnection();
    const { TITLE, CATEGORY, URL, UPLOAD_DATE, DESCRIPTION } = data;
    const result = await connection.execute(
      `INSERT INTO Technical_Resource (TITLE, CATEGORY, URL, UPLOAD_DATE, DESCRIPTION) VALUES (:TITLE, :CATEGORY, :URL, :UPLOAD_DATE, :DESCRIPTION)`,
      { TITLE, CATEGORY, URL, UPLOAD_DATE, DESCRIPTION },
      { autoCommit: true },
    );
    await clearContentsCache("tech-resources");
    return result;
  } catch (error) {
    console.error("新增技術資源失敗:", error);
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

// 更新技術資源
export async function updateTechResource(id: string, data: any) {
  let connection;
  try {
    connection = await getConnection();
    const { TITLE, CATEGORY, URL, UPLOAD_DATE, DESCRIPTION } = data;
    const result = await connection.execute(
      `UPDATE Technical_Resource SET TITLE = :TITLE, CATEGORY = :CATEGORY, URL = :URL, UPLOAD_DATE = :UPLOAD_DATE, DESCRIPTION = :DESCRIPTION WHERE TECH_ID = :ID`,
      { TITLE, CATEGORY, URL, UPLOAD_DATE, DESCRIPTION, ID: id },
      { autoCommit: true },
    );
    await clearContentsCache("tech-resources");
    return result;
  } catch (error) {
    console.error("更新技術資源失敗:", error);
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

export async function deleteTechResource(id: string) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `DELETE FROM Technical_Resource WHERE TECH_ID = :ID`,
      { ID: id },
      { autoCommit: true },
    );
    await clearContentsCache("tech-resources");
    return result;
  } catch (error) {
    console.error("刪除技術資源失敗:", error);
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

// 清除快取
async function clearContentsCache(type: string) {
  try {
    // 清除對應content的快取
    const patterns = [
      `content:GET:/api/client/content/${type}`,
      `content:GET:/api/client/content/${type}/active`,
      `content:GET:/api/admin/content/${type}`,
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
