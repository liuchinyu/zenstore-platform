// 前台訂單API
import { getConnection } from "../../../config/database";
import type { Connection } from "oracledb";
import oracledb from "oracledb";

// 創建訂單
export async function createOrder(
  shippingInfo: any,
  paymentInfo: any,
  items: any,
  totalAmount: number,
  member_id: string,
  shipping_fee: number,
) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();

    // 禁用自動提交，以便使用事務
    await connection.execute(`SET TRANSACTION NAME 'create_order'`);

    const Id = await connection.execute(
      `SELECT SEQ_ORDER_ID.NEXTVAL FROM DUAL`,
    );
    const orderIdNumber = String(Id.rows?.[0]).padStart(4, "0");
    const orderId = "ZEN" + orderIdNumber;
    const {
      name,
      landline_phone,
      mobile_phone,
      email,
      postal_code,
      region,
      district,
      address,
      note,
      deliveryTime,
      deliveryMethod,
    } = shippingInfo;

    const {
      paymentMethod,
      atmLastFiveDigits,
      invoiceType,
      isPersonInvoice,
      invoiceHandling,
      carrierNumber,
    } = paymentInfo;

    // 插入訂單主檔
    const order_master = await connection.execute(
      `INSERT INTO ORDERS (ORDER_ID,
      MEMBER_ID,
      ORDER_STATUS,
      PAYMENT_STATUS,
      SHIPPING_STATUS,
      ORDER_DATE,
      LAST_UPDATED,
      TOTAL_AMOUNT,
      SHIPPING_FEE,
      DISCOUNT_AMOUNT,
      FINAL_AMOUNT,
      RECEIVER_NAME,
      RECEIVER_LANDING_PHONE,
      RECEIVER_PHONE,
      RECEIVER_EMAIL,
      POSTAL_CODE,
      REGION,
      DISTRICT,
      ADDRESS,
      DELIVERY_TIME,
      DELIVERY_METHOD,
      NOTES,
      PAYMENT_DUE_DATE,
      INVOICE_TYPE) 
      VALUES (:order_id, :member_id, :order_status, :payment_status, :shipping_status, :order_date, :last_updated, :total_amount, :shipping_fee, :discount_amount, 
      :final_amount, :receiver_name, :receiver_landing_phone, :receiver_phone, :receiver_email, :postal_code, :region, :district, :address, :delivery_time, :delivery_method, :notes, :payment_due_date, :invoiceType)`,
      {
        order_id: orderId,
        member_id: member_id,
        order_status: "PROCESSING",
        payment_status: "UNPAID",
        shipping_status: "UNSHIPPED",
        order_date: new Date().toISOString().split("T")[0],
        last_updated: new Date().toISOString().split("T")[0],
        total_amount: totalAmount,
        shipping_fee: shipping_fee,
        discount_amount: 0,
        final_amount: totalAmount + shipping_fee,
        receiver_name: name,
        receiver_landing_phone: landline_phone,
        receiver_phone: mobile_phone,
        receiver_email: email,
        postal_code: postal_code,
        region: region,
        district: district,
        address: address,
        delivery_time: deliveryTime,
        delivery_method: deliveryMethod,
        notes: note,
        payment_due_date: new Date().toISOString().split("T")[0],
        invoiceType: invoiceType,
      },
    );

    // 檢查主檔是否成功插入
    if (!order_master.rowsAffected || order_master.rowsAffected <= 0) {
      throw new Error("訂單主檔插入失敗");
    }
    const payments_result = await connection.execute(
      `INSERT INTO ORDER_PAYMENTS (ORDER_ID,
      PAYMENT_METHOD,
      PAYMENT_AMOUNT,
      PAYMENT_DATE,
      PAYMENT_STATUS,
      PAYMENT_NOTE,
      ATM_LAST_FIVE_DIGITS,
      CARD_TRANSACTION_ID) 
      VALUES (:order_id, :payment_method, :payment_amount, :payment_date, :payment_status, :payment_note, :atm_last_five_digits, :card_transaction_id)`,
      {
        order_id: orderId,
        payment_method: paymentMethod,
        payment_amount: totalAmount,
        payment_date: new Date().toISOString().split("T")[0],
        payment_status: "UNPAID",
        payment_note: "",
        atm_last_five_digits: atmLastFiveDigits,
        card_transaction_id: "",
      },
    );

    if (!payments_result.rowsAffected || payments_result.rowsAffected <= 0) {
      console.log("訂單付款資訊插入失敗");
      throw new Error("訂單付款資訊插入失敗");
    }

    // 使用 Promise.all 等待所有明細插入完成
    const detailPromises = items.map(async (item: any, index: number) => {
      if (!connection) return;
      const { ORACLE_ID, PRODUCT_ID, QUANTITY, PRICE } = item;

      // 1. 先查詢產品當前資訊和版本號
      const productInfo = await connection.execute(
        `SELECT INVENTORY, VERSION, IS_PUBLISHED 
         FROM PRODUCT 
         WHERE ORACLE_ID = :ORACLE_ID`,
        { ORACLE_ID: ORACLE_ID },
      );

      if (!productInfo.rows || productInfo.rows.length === 0) {
        throw new Error(`產品 ${ORACLE_ID} 不存在`);
      }

      const [currentInventory, currentVersion, isPublished] = productInfo
        .rows[0] as [number, number, number, number, number];

      // 2. 檢查產品是否上架
      if (Number(isPublished) !== 1) {
        throw new Error(`產品 ${ORACLE_ID} 已下架，請重新加入購物車`);
      }

      // 3. 檢查庫存是否足夠
      if (currentInventory < QUANTITY) {
        throw new Error(
          `產品 ${ORACLE_ID} 庫存不足，請調整數量後重新加入購物車`,
        );
      }

      // 4. 使用進階樂觀鎖更新庫存（同時檢查版本號）
      const inventoryUpdateResult = await connection.execute(
        `UPDATE PRODUCT 
         SET INVENTORY = INVENTORY - :quantity_change,
             VERSION = VERSION + 1,
             LAST_UPDATED = :last_updated
        WHERE ORACLE_ID = :oracle_id 
          AND VERSION = :current_version
          AND INVENTORY >= :quantity_change`,
        {
          quantity_change: QUANTITY,
          oracle_id: ORACLE_ID,
          current_version: currentVersion,
          last_updated: new Date().toISOString().split("T")[0],
        },
      );

      // 5. 檢查更新是否成功（樂觀鎖檢查）
      if (
        !inventoryUpdateResult.rowsAffected ||
        inventoryUpdateResult.rowsAffected <= 0
      ) {
        throw new Error(`產品 ${ORACLE_ID} 資料已更新，請重新加入購物車`);
      }

      const order_detail = await connection.execute(
        `INSERT INTO ORDERS_DETAIL (ITEM_ID, ORDER_ID, ORACLE_ID, PRODUCT_ID, QUANTITY, UNIT_PRICE, SUBTOTAL, CREATED_AT) 
         VALUES (:item_id, :order_id, :oracle_id, :product_id, :quantity, :unit_price, :subtotal, :created_at)`,
        {
          item_id: orderId + "-" + (index + 1),
          order_id: orderId,
          oracle_id: ORACLE_ID,
          product_id: PRODUCT_ID,
          quantity: QUANTITY,
          unit_price: PRICE,
          subtotal: PRICE * QUANTITY,
          created_at: new Date().toISOString().split("T")[0],
        },
      );
      // 檢查明細是否成功插入
      if (!order_detail.rowsAffected || order_detail.rowsAffected <= 0) {
        console.log(`訂單明細 ${index + 1} 插入失敗`);
        throw new Error(`訂單明細 ${index + 1} 插入失敗`);
      }

      return order_detail;
    });

    // 等待所有明細插入完成
    await Promise.all(detailPromises);

    // 全部成功後提交事務
    await connection.commit();

    return {
      success: true,
      order_id: orderId,
      message: "訂單創建成功",
    };
  } catch (error) {
    console.log("訂單創建錯誤", error);

    // 發生錯誤時回滾事務
    if (connection) {
      try {
        await connection.rollback();
        console.log("已回滾事務");
      } catch (rollbackErr) {
        console.log("回滾事務失敗", rollbackErr);
      }
    }

    return {
      success: false,
      message: `訂單創建失敗: ${
        error instanceof Error ? error.message : "未知錯誤"
      }`,
    };
  } finally {
    // 關閉資料庫連接
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉資料庫連接失敗", error);
      }
    }
  }
}

// 讀取訂單主檔
export async function getOrder(member_id: string, filters: any) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    let order_master_integrate: any[] = [];

    // 動態建構where條件
    const buildWhereConditions = (filters: any) => {
      const conditions: string[] = [];
      const bindParams: any = { member_id };

      // 基本條件：會員 ID
      conditions.push("MEMBER_ID = :member_id");

      // 日期範圍條件
      if (filters?.startDate) {
        conditions.push("ORDER_DATE >= :start_date");
        bindParams.start_date = filters.startDate;
      }

      if (filters?.endDate) {
        conditions.push("ORDER_DATE <= :end_date");
        bindParams.end_date = filters.endDate;
      }

      // 狀態條件
      if (filters?.status) {
        conditions.push("ORDER_STATUS = :order_status");
        bindParams.order_status = filters.status;
      }

      return {
        whereClause:
          conditions.length > 1 ? conditions.join(" AND ") : conditions[0],
        bindParams,
      };
    };

    const { whereClause, bindParams } = buildWhereConditions(filters);

    const order_master = await connection.execute(
      `SELECT ORDER_ID, ORDER_STATUS, PAYMENT_STATUS, SHIPPING_STATUS, ORDER_DATE, TOTAL_AMOUNT, SHIPPING_FEE, FINAL_AMOUNT,
       RECEIVER_NAME, RECEIVER_LANDING_PHONE, RECEIVER_PHONE, RECEIVER_EMAIL, POSTAL_CODE, REGION, DISTRICT, ADDRESS, DELIVERY_TIME, DELIVERY_METHOD, NOTES, INVOICE_TYPE
       FROM ORDERS WHERE ${whereClause}
       ORDER BY ORDER_ID DESC`,
      bindParams,
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (!order_master || !order_master.rows || order_master.rows.length === 0) {
      return {
        success: true,
        order_master_integrate: [],
        message: "查無符合條件的訂單",
      };
    }

    const orderPromises = order_master.rows.map(async (order: any) => {
      if (!connection) return;
      const payment_info = await connection.execute(
        `SELECT PAYMENT_ID, PAYMENT_METHOD, PAYMENT_DATE, PAYMENT_NOTE, ATM_LAST_FIVE_DIGITS, CARD_TRANSACTION_ID 
        FROM ORDER_PAYMENTS WHERE ORDER_ID = :order_id`,
        {
          order_id: order.ORDER_ID,
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
      if (
        !payment_info ||
        !payment_info.rows ||
        payment_info.rows.length === 0
      ) {
        throw new Error(order.ORDER_ID + "訂單付款資訊不存在");
      }
      const payment_info_rows = payment_info.rows[0] as {
        PAYMENT_ID: string;
        PAYMENT_METHOD: string;
        PAYMENT_DATE: Date;
        PAYMENT_NOTE: string;
        ATM_LAST_FIVE_DIGITS: string;
        CARD_TRANSACTION_ID: string;
      };

      return {
        order_id: order.ORDER_ID,
        order_status: order.ORDER_STATUS,
        payment_status: order.PAYMENT_STATUS,
        shipping_status: order.SHIPPING_STATUS,
        order_date: order.ORDER_DATE,
        total_amount: order.TOTAL_AMOUNT,
        shipping_fee: order.SHIPPING_FEE,
        final_amount: order.FINAL_AMOUNT,
        payment_id: payment_info_rows.PAYMENT_ID,
        payment_method: payment_info_rows.PAYMENT_METHOD,
        payment_date: payment_info_rows.PAYMENT_DATE,
        payment_note: payment_info_rows.PAYMENT_NOTE,
        atm_last_five_digits: payment_info_rows.ATM_LAST_FIVE_DIGITS,
        card_transaction_id: payment_info_rows.CARD_TRANSACTION_ID,
        receiver_name: order.RECEIVER_NAME,
        receiver_landing_phone: order.RECEIVER_LANDING_PHONE,
        receiver_phone: order.RECEIVER_PHONE,
        receiver_email: order.RECEIVER_EMAIL,
        postal_code: order.POSTAL_CODE,
        region: order.REGION,
        district: order.DISTRICT,
        address: order.ADDRESS,
        delivery_time: order.DELIVERY_TIME,
        delivery_method: order.DELIVERY_METHOD,
        notes: order.NOTES,
        invoice_type: order.INVOICE_TYPE,
      };
    });
    order_master_integrate = await Promise.all(orderPromises);
    return {
      success: true,
      order_master_integrate: order_master_integrate,
    };
  } catch (error) {
    console.log("訂單讀取錯誤", error);
    return {
      success: false,
      message: `訂單讀取失敗: ${
        error instanceof Error ? error.message : "未知錯誤"
      }`,
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

// 讀取訂單明細
export async function getOrderDetail(order_id: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const order_detail = await connection.execute(
      `SELECT O.ORDER_ID,OD.ITEM_ID, O.ORDER_STATUS, O.PAYMENT_STATUS, O.SHIPPING_STATUS, O.ORDER_DATE, OP.PAYMENT_METHOD, OP.ATM_LAST_FIVE_DIGITS, O.DELIVERY_METHOD, O.NOTES, O.INVOICE_TYPE, OD.ORACLE_ID, OD.PRODUCT_ID, P.IMAGE_URL, P.DESCRIPTION, P.BRAND, 
              OD.QUANTITY, OD.UNIT_PRICE, OD.SUBTOTAL, O.TOTAL_AMOUNT, O.SHIPPING_FEE, O.FINAL_AMOUNT, O.RECEIVER_NAME, O.POSTAL_CODE, O.REGION, O.DISTRICT, O.ADDRESS, O.RECEIVER_EMAIL, O.RECEIVER_PHONE, O.RECEIVER_LANDING_PHONE, O.DELIVERY_TIME 
       FROM ORDERS O
       JOIN ORDERS_DETAIL OD ON O.ORDER_ID = OD.ORDER_ID
       JOIN ORDER_PAYMENTS OP ON O.ORDER_ID = OP.ORDER_ID
       JOIN PRODUCT P ON P.ORACLE_ID = OD.ORACLE_ID
       WHERE O.ORDER_ID = :order_id`,
      {
        order_id: order_id,
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    if (!order_detail || !order_detail.rows || order_detail.rows.length === 0) {
      throw new Error("訂單明細不存在");
    }

    return {
      success: true,
      order_detail: order_detail.rows,
    };
  } catch (error) {
    console.log("訂單明細讀取錯誤", error);
    return {
      success: false,
      message: `訂單明細讀取失敗: ${
        error instanceof Error ? error.message : "未知錯誤"
      }`,
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
