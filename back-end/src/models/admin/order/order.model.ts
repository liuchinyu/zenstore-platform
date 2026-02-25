// 後台訂單API
import oracledb from "oracledb";
import { getConnection } from "../../../config/database";

// 訂單資料(含會員姓名)
export async function getOrderList(
  page: number,
  pageSize: number,
  filters: any,
) {
  let connection;
  try {
    connection = await getConnection();
    const conditions: string[] = [];
    const bindParams: any = {};

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;

        if (Array.isArray(value) && value.length === 0) return;

        switch (key) {
          case "paymentStatus":
            if (Array.isArray(value)) {
              //[paymentStatus_0, paymentStatus_1, ...]
              const keys = value.map((_, i) => `paymentStatus_${i}`);
              // :paymentStatus_0,:paymentStatus_1,
              conditions.push(
                `o.PAYMENT_STATUS in (${keys.map((k) => `:${k}`).join(",")})`,
              );
              value.forEach((v, i) => (bindParams[`paymentStatus_${i}`] = v));
            } else {
              conditions.push("o.PAYMENT_STATUS in (:paymentStatus)");
              bindParams.paymentStatus = value;
            }
            break;
          case "shippingStatus":
            if (Array.isArray(value)) {
              const keys = value.map((_, i) => `shippingStatus_${i}`);
              conditions.push(
                `o.SHIPPING_STATUS in (${keys.map((k) => `:${k}`).join(",")})`,
              );
              value.forEach((v, i) => (bindParams[`shippingStatus_${i}`] = v));
            } else {
              conditions.push("o.SHIPPING_STATUS in (:shippingStatus)");
              bindParams.shippingStatus = value;
            }
            break;
          case "orderStatus":
            if (Array.isArray(value)) {
              const keys = value.map((_, i) => `orderStatus_${i}`);
              conditions.push(
                `o.ORDER_STATUS in (${keys.map((k) => `:${k}`).join(",")})`,
              );
              value.forEach((v, i) => (bindParams[`orderStatus_${i}`] = v));
            } else {
              conditions.push("o.ORDER_STATUS in (:orderStatus)");
              bindParams.orderStatus = value;
            }
            break;

          case "memberType":
            if (Array.isArray(value)) {
              const keys = value.map((_, i) => `memberType_${i}`);
              conditions.push(
                `m.MEMBER_TYPE in (${keys.map((k) => `:${k}`).join(",")})`,
              );
              value.forEach((v, i) => (bindParams[`memberType_${i}`] = v));
            } else {
              conditions.push("m.MEMBER_TYPE in (:memberType)");
              bindParams.memberType = value;
            }
            break;
          case "dateFrom":
            conditions.push("o.ORDER_DATE >= :dateFrom");
            bindParams.dateFrom = value;
            break;
          case "dateTo":
            conditions.push("o.ORDER_DATE <= :dateTo");
            bindParams.dateTo = value;
            break;

          case "customerName":
            conditions.push("(UPPER(m.USER_NAME) like UPPER(:customerName))");
            bindParams.customerName = `%${value.toString().toUpperCase()}%`;
            break;

          case "keyword": //處裡搜尋欄位:訂單編號、客戶姓名、備註
            conditions.push(
              "(UPPER(o.ORDER_ID) like UPPER(:keyword) OR UPPER(m.USER_NAME) like UPPER(:keyword) OR UPPER(o.NOTES) like UPPER(:keyword))",
            );
            bindParams.keyword = `%${value.toString().toUpperCase()}%`;
            break;
        }
      });
    }
    const whereClause =
      conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";

    const offset = (page - 1) * pageSize;

    // 計算總數量
    const countResult = await connection.execute(
      `SELECT COUNT(*) as total_count
        FROM orders o JOIN members m  ON o.member_id = m.member_id  
        WHERE o.cancel_verified <> 1 
        AND o.cancel_reason is null
        ${whereClause}`,
      bindParams,
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const countRows = countResult.rows as any[];
    const totalCount = countRows[0].TOTAL_COUNT;

    const result = await connection.execute(
      `SELECT order_id, m.member_id, m.user_name, m.member_type, o.order_date, order_status, payment_status, shipping_status, delivery_method, final_amount, o.notes
        FROM orders o JOIN members m  ON o.member_id = m.member_id  
        WHERE o.cancel_verified <> 1 
        AND o.cancel_reason is null
        ${whereClause}
        ORDER BY o.ORDER_DATE DESC, o.ORDER_ID DESC 
        OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
      { ...bindParams, offset, pageSize },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return { data: result.rows, totalCount };
  } catch (error) {
    console.log("error", error);
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

// 訂單資料(純訂單主檔for Excel匯出)
export async function getOrder(selectedOrders: string[] | null) {
  let connection;
  try {
    connection = await getConnection();
    let query = `SELECT o.order_id, m.user_name, o.order_status, o.payment_status, o.shipping_status, o.order_date, 
      o.last_updated, o.total_amount, o.shipping_fee, o.discount_amount, o.final_amount, o.receiver_name, o.receiver_landing_phone,
      o.receiver_phone, o.receiver_email, o.postal_code, o.region, o.district, o.address, o.delivery_time, o.delivery_method, o.notes
      FROM orders o JOIN members m 
      ON o.member_id = m.member_id`;
    if (selectedOrders && selectedOrders.length > 0) {
      let formattedOrders = selectedOrders.map((id) => `'${id}'`).join(",");
      query += ` WHERE ORDER_ID IN (${formattedOrders})`;
    }
    query += ` ORDER BY ORDER_ID`;
    const result = await connection.execute(query);
    return result.rows;
  } catch (error) {
    console.log("error", error);
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

// 訂單資料(取消待處理)
export async function getCancelOrder(
  page: number,
  pageSize: number,
  filters: any,
) {
  let connection;
  try {
    connection = await getConnection();
    const conditions: string[] = [];
    const bindParams: any = {};

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;

        if (Array.isArray(value) && value.length === 0) return;

        switch (key) {
          case "memberType":
            if (Array.isArray(value)) {
              const keys = value.map((_, i) => `memberType_${i}`);
              conditions.push(
                `m.MEMBER_TYPE in (${keys.map((k) => `:${k}`).join(",")})`,
              );
              value.forEach((v, i) => (bindParams[`memberType_${i}`] = v));
            } else {
              conditions.push("m.MEMBER_TYPE in (:memberType)");
              bindParams.memberType = value;
            }
            break;
          case "dateFrom":
            conditions.push("o.ORDER_DATE >= :dateFrom");
            bindParams.dateFrom = value;
            break;
          case "dateTo":
            conditions.push("o.ORDER_DATE <= :dateTo");
            bindParams.dateTo = value;
            break;

          case "customerName":
            conditions.push("(UPPER(m.USER_NAME) like UPPER(:customerName))");
            bindParams.customerName = `%${value.toString().toUpperCase()}%`;
            break;

          case "keyword": //處裡搜尋欄位:訂單編號、客戶姓名、備註
            conditions.push(
              "(UPPER(o.ORDER_ID) like UPPER(:keyword) OR UPPER(m.USER_NAME) like UPPER(:keyword) OR UPPER(o.NOTES) like UPPER(:keyword) OR UPPER(o.CANCEL_REASON) like UPPER(:keyword))",
            );
            bindParams.keyword = `%${value.toString().toUpperCase()}%`;
            break;
        }
      });
    }
    const whereClause =
      conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";

    const offset = (page - 1) * pageSize;

    // 計算總數量
    const countResult = await connection.execute(
      `SELECT COUNT(*) as total_count
        from orders o join members m  on o.member_id = m.member_id  
        where o.cancel_reason is not null
        and o.cancel_verified = 0
        ${whereClause}`,
      bindParams,
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const countRows = countResult.rows as any[];
    const totalCount = countRows[0].TOTAL_COUNT;

    const result = await connection.execute(
      `select o.order_id, m.member_id, m.user_name, m.member_type, o.order_date, o.order_status, o.payment_status, o.shipping_status, o.final_amount, o.notes, o.cancel_reason
        from orders o join members m  on o.member_id = m.member_id  
        where o.cancel_reason is not null
        and o.cancel_verified = 0
        ${whereClause}
        ORDER BY ORDER_ID DESC
        OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
      { ...bindParams, offset, pageSize },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return { data: result.rows, totalCount };
  } catch (error) {
    console.log("error", error);
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

// 訂單資料(取消已核准)
export async function getCancelPermitOrder(
  page: number,
  pageSize: number,
  filters: any,
) {
  let connection;
  try {
    connection = await getConnection();
    const conditions: string[] = [];
    const bindParams: any = {};

    console.log("filters", filters);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;

        if (Array.isArray(value) && value.length === 0) return;

        switch (key) {
          case "memberType":
            if (Array.isArray(value)) {
              const keys = value.map((_, i) => `memberType_${i}`);
              conditions.push(
                `m.MEMBER_TYPE in (${keys.map((k) => `:${k}`).join(",")})`,
              );
              value.forEach((v, i) => (bindParams[`memberType_${i}`] = v));
            } else {
              conditions.push("m.MEMBER_TYPE in (:memberType)");
              bindParams.memberType = value;
            }
            break;
          case "dateFrom":
            conditions.push("o.ORDER_DATE >= :dateFrom");
            bindParams.dateFrom = value;
            break;
          case "dateTo":
            conditions.push("o.ORDER_DATE <= :dateTo");
            bindParams.dateTo = value;
            break;

          case "customerName":
            conditions.push("(UPPER(m.USER_NAME) like UPPER(:customerName))");
            bindParams.customerName = `%${value.toString().toUpperCase()}%`;
            break;

          case "keyword": //處裡搜尋欄位:訂單編號、客戶姓名、備註
            conditions.push(
              "(UPPER(o.ORDER_ID) like UPPER(:keyword) OR UPPER(m.USER_NAME) like UPPER(:keyword) OR UPPER(o.NOTES) like UPPER(:keyword) OR UPPER(o.CANCEL_REASON) like UPPER(:keyword))",
            );
            bindParams.keyword = `%${value.toString().toUpperCase()}%`;
            break;
        }
      });
    }
    const whereClause =
      conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";

    const offset = (page - 1) * pageSize;

    // 計算總數量
    const countResult = await connection.execute(
      `SELECT COUNT(*) as total_count
        from orders o join members m  on o.member_id = m.member_id  
        where o.cancel_reason is not null
        and o.cancel_verified = 1
        ${whereClause}`,
      bindParams,
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const countRows = countResult.rows as any[];
    const totalCount = countRows[0].TOTAL_COUNT;

    const result = await connection.execute(
      `select o.order_id, m.member_id, m.user_name, m.member_type, o.order_date, o.order_status, o.payment_status, o.shipping_status, o.final_amount, o.notes, o.cancel_reason
        from orders o join members m  on o.member_id = m.member_id  
        where o.cancel_reason is not null
        and o.cancel_verified = 1
        ${whereClause}
        ORDER BY ORDER_ID DESC
        OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
      { ...bindParams, offset, pageSize },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return { data: result.rows, totalCount };
  } catch (error) {
    console.log("error", error);
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

//是否核准取消訂單
export async function orderCancelUpdatePermit(cancelUpdateStatus: any) {
  let connection;
  try {
    connection = await getConnection();
    let order_id = cancelUpdateStatus.order_id;
    let allPromises = [];
    let updateResult;
    let insertResult;
    // 建立參數佔位符

    // 取得訂單先前狀態
    const result = await connection.execute(
      `SELECT ORDER_STATUS, PAYMENT_STATUS, SHIPPING_STATUS FROM ORDERS WHERE ORDER_ID = :order_id`,
      [order_id],
    );
    let beforeRows = result.rows as any[];
    const order_status = beforeRows[0][0];
    console.log("order_status", order_status);

    const isPermit = cancelUpdateStatus.isPermit;
    // 核准要同步更新訂單、付款、出貨狀態
    if (isPermit === "1") {
      const logRows: Array<{
        order_id: string;
        status_type: string;
        old_status: string | null;
        new_status: string | null;
      }> = [];
      const columns = ["ORDER_STATUS", "PAYMENT_STATUS", "SHIPPING_STATUS"];
      const values = ["VOIDED", "REFUNDED", "RETURNED"];
      for (let i = 0; i <= 2; i++) {
        logRows.push({
          order_id,
          status_type: columns[i],
          old_status: beforeRows[0][i],
          new_status: values[i],
        });
      }
      const logInserts = logRows.map((r) => ({
        order_id: r.order_id,
        status_type: r.status_type,
        previous_value: r.old_status ?? null,
        new_value: r.new_status ?? null,
        changed_by: "ADMIN", // 不可為空
        // change_source: changeSource, // 預設 MANUAL
        // metadata,
        operation_id: 1,
      }));

      updateResult = connection.execute(
        `UPDATE ORDERS SET CANCEL_VERIFIED = 1, ORDER_STATUS = 'VOIDED', SHIPPING_STATUS = 'RETURNED', PAYMENT_STATUS = 'REFUNDED'  WHERE ORDER_ID = :order_id`,
        [order_id],
      );
      insertResult = connection.executeMany(
        `INSERT INTO ORDER_STATUS_CHANGE_LOG
          (ORDER_ID, STATUS_TYPE, PREVIOUS_VALUE, NEW_VALUE, CHANGED_BY,  CREATED_AT,  OPERATION_ID)
         VALUES
          (:order_id, :status_type, :previous_value, :new_value, :changed_by,  TO_CHAR(SYSTIMESTAMP,'YYYY-MM-DD HH24:MI:SS'),  :operation_id)`,
        logInserts,
      );
    } else {
      // 取得先前訂單狀態
      const result = await connection.execute(
        `SELECT PREVIOUS_VALUE FROM ORDER_STATUS_CHANGE_LOG WHERE ORDER_ID = :order_id AND NEW_VALUE = 'CANCELLED' 
         ORDER BY CREATED_AT DESC FETCH FIRST 1 ROWS ONLY`,
        [order_id],
      );

      beforeRows = result.rows as any[];
      let status_type = "ORDER_STATUS";
      let previous_value = "CANCELLED";
      let new_value = beforeRows[0][0];
      let changed_by = "ADMIN";
      let operation_id = 2;

      updateResult = connection.execute(
        `UPDATE ORDERS SET CANCEL_VERIFIED = 0, CANCEL_REASON = '', REFUND_METHOD = '', REFUND_BANK = '',  REFUND_ACCOUNT_NAME = '', REFUND_ACCOUNT = '', ORDER_STATUS = :new_value WHERE ORDER_ID = :order_id`,
        [new_value, order_id],
      );

      insertResult = connection.execute(
        `INSERT INTO ORDER_STATUS_CHANGE_LOG (ORDER_ID, STATUS_TYPE, PREVIOUS_VALUE, NEW_VALUE, CHANGED_BY, CREATED_AT, OPERATION_ID)
           VALUES
            (:order_id, :status_type, :previous_value, :new_value, :changed_by, TO_CHAR(SYSTIMESTAMP,'YYYY-MM-DD HH24:MI:SS'), :operation_id)`,
        [
          order_id,
          status_type,
          previous_value,
          new_value,
          changed_by,
          operation_id,
        ],
      );
    }
    const last_udpated = connection.execute(
      `UPDATE ORDERS SET LAST_UPDATED = TO_CHAR(SYSTIMESTAMP, 'YYYY-MM-DD') WHERE ORDER_ID = :order_id`,
      [order_id],
    );
    allPromises.push(updateResult);
    allPromises.push(insertResult);
    allPromises.push(last_udpated);
    await Promise.all(allPromises);
    await connection.commit();
    return { success: true, message: "更新狀態成功" };
  } catch (error) {
    console.log("error", error);
    return {
      success: false,
      message: "核准取消訂單失敗",
      error,
    };
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

// 訂單資料(純訂單明細for Excel匯出)
export async function getOrderDetail(selectedOrders: string[] | null) {
  let connection;
  try {
    connection = await getConnection();
    let query = `SELECT order_id, item_id, oracle_id, product_id, quantity, unit_price, subtotal, created_at
                 FROM orders_detail`;
    if (selectedOrders && selectedOrders.length > 0) {
      let formattedOrders = selectedOrders.map((id) => `'${id}'`).join(",");
      query += ` WHERE ORDER_ID IN (${formattedOrders})`;
    }
    query += ` ORDER BY ORDER_ID, ITEM_ID`;
    const result = await connection.execute(query);
    return result.rows;
  } catch (error) {
    console.log("error", error);
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

export async function getExcelExportData(selectedOrders: string[] | null) {
  const promises: Promise<any>[] = [];
  const result: any = {};

  // 訂單主檔資料
  promises.push(
    getOrder(selectedOrders).then((data) => {
      result.main_order = data;
    }),
  );
  promises.push(
    getOrderDetail(selectedOrders).then((data) => {
      result.detail_order = data;
    }),
  );
  await Promise.all(promises);
  return {
    success: true,
    message: "excel匯出成功",
    data: result,
  };
}

export async function getOrderById(order_id: string) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT O.order_id, O.member_id, O.order_status, O.payment_status, O.shipping_status, O.order_date, O.last_updated, O.total_amount, O.shipping_fee, 
       O.receiver_name, O.receiver_landing_phone, O.receiver_phone, O.receiver_email, O.postal_code, O.region, O.district, O.address, O.delivery_time, 
       O.delivery_method, O.notes, O.payment_due_date, O.cancel_reason, O.cancel_verified, O.refund_method, O.refund_bank, O.refund_account_name, O.refund_account, O.invoice_type,
       PD.item_id, PD.oracle_id, PD.product_id, PD.quantity, PD.unit_price, PD.subtotal, PD.brand, PD.image_url,
       OP.PAYMENT_METHOD, OP.ATM_LAST_FIVE_DIGITS
       FROM ORDERS O JOIN (SELECT OD.*, P.BRAND, P.IMAGE_URL FROM ORDERS_DETAIL OD JOIN PRODUCT P ON OD.ORACLE_ID = P.ORACLE_ID)PD 
       ON O.ORDER_ID = PD.ORDER_ID 
       JOIN ORDER_PAYMENTS OP
       ON O.ORDER_ID = OP.ORDER_ID
       WHERE O.ORDER_ID = :order_id`,
      { order_id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    if (!result.rows || result.rows.length === 0) return null;
    return result.rows;
  } catch (error) {
    console.log("error", error);
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

// 查詢訂單狀態流程
export async function getOrderLog(order_id: string) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM order_status_change_log WHERE order_id = :order_id ORDER BY created_at DESC`,
      { order_id },
    );
    return result.rows;
  } catch (error) {
    console.log("error", error);
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

// 更新訂單狀態
export async function updateOrderStatus(updateStatus: any) {
  /* 
  單一訂單更新:updateStatus =  { order_id: 'ZEN0004', cancel_reason: 'test1' }
  多筆訂單更新:updateStatus =  { order_id: [ 'ZEN0002', 'ZEN0001' ], order_status: 'PENDING' }
  */
  let connection: any;
  try {
    connection = await getConnection();
    let allPromises = [];
    let updateFields = ""; //記錄更新的欄位
    const key = Object.keys(updateStatus);

    const bindParams: { [key: string]: any } = {};
    const collumn = key
      .filter((k) => k !== "order_id")
      .map((k) => {
        bindParams[k] = updateStatus[k];
        return `${k} = :${k}`;
      })
      .join(", ");

    // 在函數開始時添加標準化邏輯，統一將資料轉換為array
    const orderIds = Array.isArray(updateStatus.order_id)
      ? updateStatus.order_id
      : [updateStatus.order_id];

    if (updateStatus.order_status) {
      updateFields += "order_status, "; //取得要記錄更新的欄位
    }
    if (updateStatus.shipping_status) {
      updateFields += "shipping_status, "; //取得要記錄更新的欄位
    }
    // 更新付款狀態
    if (updateStatus.payment_status) {
      updateFields += "payment_status, "; //取得要記錄更新的欄位

      const payment_result = connection.executeMany(
        `UPDATE ORDER_PAYMENTS SET PAYMENT_STATUS = :payment_status WHERE ORDER_ID = :order_id`,
        orderIds.map((id: any) => ({
          payment_status: updateStatus.payment_status,
          order_id: id,
        })),
      );
      allPromises.push(payment_result);
    }

    let beforeRows; //先前訂單狀態
    let fieldsForLog;
    updateFields = updateFields.slice(0, -2); //移除最後的','

    if (updateFields) {
      const orderResults = await Promise.all(
        orderIds.map((id: string) =>
          connection.execute(
            `SELECT ORDER_ID, ${updateFields} FROM ORDERS WHERE ORDER_ID = :order_id`,
            { order_id: id },
          ),
        ),
      );

      beforeRows = orderResults.flatMap((result) => result.rows || []);
      fieldsForLog = updateFields.split(",").map((field) => field.trim());

      if (beforeRows?.length > 0 && fieldsForLog?.length > 0) {
        const logRows: Array<{
          order_id: string;
          status_type: string;
          old_status: string | null;
          new_status: string | null;
        }> = [];

        for (const row of beforeRows) {
          const order_id = row[0];
          fieldsForLog.forEach((field, idx) => {
            const oldVal = row[idx + 1];
            const newVal = bindParams[field]; // 來自更新參數的新值
            if (newVal === undefined) return; // 無新值不記錄
            if (oldVal === newVal) return; // 未異動不記錄（可視需求移除）
            logRows.push({
              order_id,
              status_type: field.toUpperCase(), // 依欄位分類
              old_status: oldVal === undefined ? null : String(oldVal),
              new_status: newVal === undefined ? null : String(newVal),
            });
          });
        }

        if (logRows) {
          const logInserts = logRows.map((r) => ({
            order_id: r.order_id,
            status_type: r.status_type,
            previous_value: r.old_status ?? null,
            new_value: r.new_status ?? null,
            changed_by: "ADMIN", // 不可為空
            // change_source: changeSource, // 預設 MANUAL
            // metadata,
            operation_id: 1,
          }));
          const result = connection.executeMany(
            `INSERT INTO ORDER_STATUS_CHANGE_LOG
              (ORDER_ID, STATUS_TYPE, PREVIOUS_VALUE, NEW_VALUE, CHANGED_BY,  CREATED_AT,  OPERATION_ID)
             VALUES
              (:order_id, :status_type, :previous_value, :new_value, :changed_by,  TO_CHAR(SYSTIMESTAMP,'YYYY-MM-DD HH24:MI:SS'),  :operation_id)`,
            logInserts,
          );
          allPromises.push(result);
        }
      }
    }
    // 取得先前訂單狀態

    // 更新訂單狀態
    if (collumn) {
      const result = connection.executeMany(
        `UPDATE ORDERS SET ${collumn} WHERE ORDER_ID = :order_id`,
        orderIds.map((id: string) => ({
          ...bindParams,
          order_id: id,
        })),
      );
      allPromises.push(result);
    }

    const last_udpated = connection.executeMany(
      `UPDATE ORDERS SET LAST_UPDATED = TO_CHAR(SYSTIMESTAMP, 'YYYY-MM-DD') WHERE ORDER_ID = :order_id`,
      orderIds.map((id: any) => ({
        order_id: id,
      })),
    );
    allPromises.push(last_udpated);
    await Promise.all(allPromises);
    await connection.commit();
    return { success: true, message: "更新狀態成功" };
  } catch (error) {
    console.log("error", error);
    return { success: false, message: "更新狀態失敗", error };
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

// 取消訂單
export async function orderCancelUpdate(cancelUpdateStatus: any) {
  let connection;
  try {
    connection = await getConnection();
    const key = Object.keys(cancelUpdateStatus);
    const bindParams: { [key: string]: any } = {};
    let allPromises = [];

    const collumn = key
      // .filter((k) => k !== "order_id")
      .map((k) => {
        bindParams[k] = cancelUpdateStatus[k];
        return `${k} = :${k}`;
      })
      .join(", ");

    let order_id = cancelUpdateStatus.order_id;

    let beforeRows;
    // 取得先前訂單狀態
    const result = await connection.execute(
      `SELECT ORDER_ID, ORDER_STATUS FROM ORDERS WHERE ORDER_ID = :order_id`,
      [order_id],
    );
    if (result) {
    }
    beforeRows = result.rows as any[];
    if (beforeRows && beforeRows.length > 0) {
      let status_type = "ORDER_STATUS";
      let previous_value = beforeRows[0][1];
      let new_value = "CANCELLED";
      let changed_by = "ADMIN";
      let operation_id = 2;
      let metadata = cancelUpdateStatus.cancel_reason;

      const insertResult = connection.execute(
        `INSERT INTO ORDER_STATUS_CHANGE_LOG  (ORDER_ID, STATUS_TYPE, PREVIOUS_VALUE, NEW_VALUE, CHANGED_BY,  CREATED_AT,  OPERATION_ID, metadata)
           VALUES
            (:order_id, :status_type, :previous_value, :new_value, :changed_by, TO_CHAR(SYSTIMESTAMP,'YYYY-MM-DD HH24:MI:SS'), :operation_id, :metadata)`,
        [
          order_id,
          status_type,
          previous_value,
          new_value,
          changed_by,
          operation_id,
          metadata,
        ],
      );
      allPromises.push(insertResult);

      // 根據退款方式(ATM、信用卡)維護相應資訊
      const updateResult = connection.execute(
        `UPDATE ORDERS SET ORDER_STATUS = 'CANCELLED', ${collumn} WHERE ORDER_ID = :order_id`,
        bindParams,
      );
      const last_udpated = connection.execute(
        `UPDATE ORDERS SET LAST_UPDATED = TO_CHAR(SYSTIMESTAMP, 'YYYY-MM-DD') WHERE ORDER_ID = :order_id`,
        [order_id],
      );
      allPromises.push(updateResult);
      allPromises.push(last_udpated);
      await Promise.all(allPromises);
      await connection.commit();
      return { success: true, message: "取消訂單成功" };
    }
  } catch (error) {
    console.log("error", error);
    return { success: false, message: "取消訂單狀態失敗", error };
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
