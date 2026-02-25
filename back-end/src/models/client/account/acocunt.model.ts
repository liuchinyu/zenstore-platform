import { getConnection } from "../../../config/database";
import oracledb from "oracledb";
import type { Connection } from "oracledb";

// 新增收貨地址
export async function creareShippingAddress(member_id: string, data: any) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `INSERT INTO SHIPPING_ADDRESS (MEMBER_ID, NAME, MOBILE_PHONE, LANDLINE_PHONE, EMAIL, REGION, DISTRICT, ADDRESS, POSTAL_CODE)
        VALUES (:member_id, :name, :mobile_phone, :landline_phone, :email, :region, :district, :address, :postal_code)`,
      [
        member_id,
        data.NAME,
        data.MOBILE_PHONE,
        data.LANDLINE_PHONE,
        data.EMAIL,
        data.REGION,
        data.DISTRICT,
        data.ADDRESS,
        data.POSTAL_CODE,
      ],
      { autoCommit: true },
    );
    if (result && result.rowsAffected && result.rowsAffected > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
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

// 取得收貨地址
export async function getShippingAddress(member_id: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID, NAME, MOBILE_PHONE, LANDLINE_PHONE, EMAIL, REGION, DISTRICT, ADDRESS, POSTAL_CODE FROM SHIPPING_ADDRESS WHERE MEMBER_ID = :member_id`,
      [member_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    if (result && result.rows && result.rows.length > 0) {
      return {
        success: true,
        shippingData: result.rows,
      };
    } else {
      return {
        success: true,
        shippingData: [],
      };
    }
  } catch (error) {
    console.log("error", error);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉連接錯誤", error);
      }
    }
  }
}

// 更新收貨地址
export async function updateShippingAddress(data: any) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    if (Object.keys(data).length < 0) {
      return {
        success: false,
        message: "沒有資料更新",
      };
    }
    const setClause = Object.keys(data)
      .map((field) => `${field.toUpperCase()} = :${field}`)
      .join(", ");
    const bindParams = { ...data };
    const id = data.id;
    const result = await connection.execute(
      `UPDATE SHIPPING_ADDRESS SET ${setClause} WHERE ID = :id`,
      bindParams,
      { autoCommit: true },
    );
    if (result && result.rowsAffected && result.rowsAffected > 0) {
      return {
        success: true,
        message: "更新成功",
      };
    } else {
      return {
        success: false,
        message: "更新失敗",
      };
    }
  } catch (error) {
    console.log("error", error);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉連接錯誤", error);
      }
    }
  }
}

// 刪除收貨地址
export async function deleteShippingAddress(id: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `DELETE FROM SHIPPING_ADDRESS WHERE ID = :id`,
      [id],
      { autoCommit: true },
    );
    if (result && result.rowsAffected && result.rowsAffected > 0) {
      return {
        success: true,
        message: "刪除成功",
      };
    } else {
      return {
        success: false,
        message: "刪除失敗",
      };
    }
  } catch (error) {
    console.log("error", error);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉連接錯誤", error);
      }
    }
  }
}

async function getWishlistData(connection: any, member_id: string) {
  try {
    const result = await connection.execute(
      `SELECT WISHLIST_ID, MEMBER_ID, W.ORACLE_ID, PRODUCT_ID, BRAND, DESCRIPTION, INVENTORY, PRICE, IMAGE_URL, FIXED_LOT_MULTIPLIER  
      FROM WISHLIST W LEFT JOIN PRODUCT P ON W.ORACLE_ID = P.ORACLE_ID 
      WHERE MEMBER_ID = :member_id`,
      [member_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    if (result && result.rows && result.rows.length > 0) {
      return {
        success: true,
        wishlistData: result.rows,
      };
    } else {
      return {
        success: true,
        wishlistData: [],
      };
    }
  } catch (error) {
    console.log("error", error);
    throw error;
  }
}

// 新增收藏清單
export async function addToWishlist(member_id: string, oracle_id: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `INSERT INTO WISHLIST (MEMBER_ID, ORACLE_ID) VALUES (:member_id, :oracle_id)`,
      [member_id, oracle_id],
      { autoCommit: true },
    );
    if (result && result.rowsAffected && result.rowsAffected > 0) {
      const { success, wishlistData } = await getWishlistData(
        connection,
        member_id,
      );

      if (success && wishlistData && wishlistData.length > 0) {
        return {
          success: true,
          message: "收藏清單新增成功",
          data: wishlistData,
        };
      }
    } else {
      return {
        success: false,
        message: "收藏清單新增失敗",
      };
    }
  } catch (error) {
    console.log("error", error);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉連接錯誤", error);
      }
    }
  }
}

// 取得收藏清單
export async function getWishlist(member_id: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();

    const { success, wishlistData } = await getWishlistData(
      connection,
      member_id,
    );

    if (success) {
      return {
        success: true,
        message: "收藏清單取得成功",
        data: wishlistData || [],
      };
    } else {
      return {
        success: false,
        message: "收藏清單取得失敗",
      };
    }
  } catch (error) {
    console.log("error", error);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉連接錯誤", error);
      }
    }
  }
}

// 刪除收藏清單
export async function removeFromWishlist(
  wishlist_id: string,
  member_id: string,
) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `DELETE FROM WISHLIST WHERE WISHLIST_ID = :wishlist_id`,
      [wishlist_id],
      { autoCommit: true },
    );
    if (result && result.rowsAffected && result.rowsAffected > 0) {
      const { success, wishlistData } = await getWishlistData(
        connection,
        member_id,
      );
      if (success) {
        return {
          success: true,
          message: "收藏清單刪除成功",
          data: wishlistData,
        };
      }
    } else {
      return {
        success: false,
        message: "收藏清單刪除失敗",
      };
    }
  } catch (error) {
    console.log("error", error);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉連接錯誤", error);
      }
    }
  }
}

/*
購物車區段
*/
async function checkCartQuantity(
  oracle_id: string,
  quantity: number,
  connection: any,
) {
  try {
    const get_FIXED_LOT_MULTIPLIER = await connection.execute(
      `SELECT FIXED_LOT_MULTIPLIER FROM PRODUCT WHERE ORACLE_ID = :oracle_id`,
      [oracle_id],
    );
    const rows = get_FIXED_LOT_MULTIPLIER.rows as any[];
    const fixed_lot_multiplier = rows[0][0]; //取得最小包裝量

    if (quantity % fixed_lot_multiplier === 0)
      return quantity; //若能整除表輸入正確
    else {
      // 取得調整數量後最小包裝的最大公倍數
      const base =
        Math.floor(quantity / fixed_lot_multiplier) * fixed_lot_multiplier;
      return Math.max(fixed_lot_multiplier, base);
    }
  } catch (error) {
    console.log("error", error);
    return 0;
  }
}

async function getCartData(
  connection: any,
  member_id?: string,
  quantity?: any,
  oracle_id?: string,
) {
  if (member_id) {
    const cart = await connection.execute(
      `select
          MEMBER_ID,
          ORACLE_ID,
          PRODUCT_ID,
          QUANTITY,
          PRICE,
          FIXED_LOT_MULTIPLIER,
          BRAND,
          IMAGE_URL
       FROM (
          select
              CART.MEMBER_ID,
              P.ORACLE_ID,
              P.PRODUCT_ID,
              CART.QUANTITY,
              PR.PRICE,
              P.FIXED_LOT_MULTIPLIER,
              P.BRAND,
              P.IMAGE_URL,
              ROW_NUMBER() OVER (
                  PARTITION BY CART.MEMBER_ID, CART.ORACLE_ID
                  ORDER BY
                      CASE
                          WHEN CART.QUANTITY BETWEEN PR.MIN AND PR.MAX THEN 1   -- 區間內
                          WHEN CART.QUANTITY > PR.MAX THEN 2                    -- 超過最大 → 套最大價
                          ELSE 3                                                -- 低於最小（可視情況 fallback）
                      END,
                      PR.MAX DESC
              ) AS RN
          FROM CART
          JOIN PRODUCT P
              ON CART.ORACLE_ID = P.ORACLE_ID
          JOIN PRODUCT_PRICES PR
              ON P.ORACLE_ID = PR.ORACLE_ID
      )
      WHERE RN = 1
      AND MEMBER_ID = :member_id`,
      [member_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return cart?.rows;
  }
  const cart = await connection.execute(
    `
        select 
          ORACLE_ID,
          PRODUCT_ID,
          QUANTITY,
          PRICE,
          FIXED_LOT_MULTIPLIER,
          BRAND,
          IMAGE_URL
       FROM (
          select 
              P.ORACLE_ID,
              P.PRODUCT_ID,
              :quantity AS QUANTITY,
              PR.PRICE,
              P.FIXED_LOT_MULTIPLIER,
              P.BRAND,
              P.IMAGE_URL,
              ROW_NUMBER() OVER (
                  PARTITION BY P.ORACLE_ID
                  ORDER BY 
                      CASE 
                          WHEN :quantity BETWEEN PR.MIN AND PR.MAX THEN 1   -- 區間內
                          WHEN :quantity > PR.MAX THEN 2                    -- 超過最大 → 套最大價
                          ELSE 3                                                -- 低於最小（可視情況 fallback）
                      END,
                      PR.MAX DESC
              ) AS RN
          FROM PRODUCT P 
          JOIN PRODUCT_PRICES PR 
              ON P.ORACLE_ID = PR.ORACLE_ID
          WHERE P.ORACLE_ID = :oracle_id  -- 在內層就過濾
      )
      WHERE RN = 1`,
    {
      quantity: quantity, //改成物件形式(因多次呼叫quantity)
      oracle_id: oracle_id,
    },
    { outFormat: oracledb.OUT_FORMAT_OBJECT },
  );

  return cart?.rows;
}

// 取得商品必要比對資訊
async function getProductInfo(connection: any, oracle_id: string) {
  const result = await connection.execute(
    `SELECT PRODUCT_ID, INVENTORY, FIXED_LOT_MULTIPLIER FROM PRODUCT WHERE ORACLE_ID = :oracle_id`,
    [oracle_id],
    { outFormat: oracledb.OUT_FORMAT_OBJECT },
  );
  const productRows = result.rows as any[];
  const inventory = productRows[0].INVENTORY;
  const product_id = productRows[0].PRODUCT_ID;
  const fixed_lot_multiplier = productRows[0].FIXED_LOT_MULTIPLIER;
  return {
    inventory,
    product_id,
    fixed_lot_multiplier,
  };
}

// 用戶新增購物車
export async function addToCart(
  member_id: string,
  oracle_id: string,
  original_quantity: number, //會先合併用戶登入及未登入時已加入的購物車數量
  new_quantity?: number, //本次調整的數量
) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();

    // 計算最終數量
    let final_quantity = new_quantity
      ? original_quantity + new_quantity
      : original_quantity;

    // 判斷並取得符合商品最小包裝量的購買數量
    let correct_quantity = Number(
      await checkCartQuantity(oracle_id, final_quantity, connection),
    );

    // 取得品項必要資訊
    const { inventory, product_id, fixed_lot_multiplier } =
      await getProductInfo(connection, oracle_id);
    // 檢查購物車是否已存在該商品
    const checkCart = await connection.execute(
      `SELECT QUANTITY FROM CART WHERE MEMBER_ID = :member_id AND ORACLE_ID = :oracle_id`,
      [member_id, oracle_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const rows = checkCart.rows as any[];
    const cartExists = checkCart && checkCart.rows && rows.length > 0;

    let operationResult: any = null; // 宣告是否要Insert或Update

    // 若庫存小於購買數量，表示用戶原先已有加入購物車，則跳出比對
    if (inventory < correct_quantity) {
      const returnQuantity =
        Math.floor(inventory / fixed_lot_multiplier) * fixed_lot_multiplier;

      if (cartExists) {
        operationResult = await connection.execute(
          `UPDATE CART SET QUANTITY = :quantity 
           WHERE MEMBER_ID = :member_id AND ORACLE_ID = :oracle_id`,
          [returnQuantity, member_id, oracle_id],
          { autoCommit: true },
        );
      } else {
        operationResult = await connection.execute(
          `INSERT INTO CART (MEMBER_ID, ORACLE_ID, QUANTITY) VALUES (:member_id, :oracle_id, :quantity)`,
          [member_id, oracle_id, returnQuantity],
          { autoCommit: true },
        );
      }
      if (
        operationResult &&
        operationResult.rowsAffected &&
        operationResult.rowsAffected > 0
      ) {
        const result = await getCartData(connection, member_id);
        return {
          //錯誤訊息也要return data，待處理
          success: true,
          overValueMessage: `由於品項:${product_id}目前庫存不足，您的購物車數量已降至最小包裝量:${returnQuantity}`,
          data: result,
        };
      } else {
        return {
          success: false,
          message: "購物車操作失敗",
        };
      }
    }

    if (cartExists) {
      // 如果購物車已有該商品，使用驗證後的正確數量更新
      operationResult = await connection.execute(
        `UPDATE CART SET QUANTITY = :quantity 
         WHERE MEMBER_ID = :member_id AND ORACLE_ID = :oracle_id`,
        [correct_quantity, member_id, oracle_id],
        { autoCommit: true },
      );
    } else {
      // 新增商品到購物車，使用驗證後的正確數量
      operationResult = await connection.execute(
        `INSERT INTO CART (MEMBER_ID, ORACLE_ID, QUANTITY) VALUES (:member_id, :oracle_id, :quantity)`,
        [member_id, oracle_id, correct_quantity],
        { autoCommit: true },
      );
    }

    if (
      operationResult &&
      operationResult.rowsAffected &&
      operationResult.rowsAffected > 0
    ) {
      const result = await getCartData(connection, member_id);
      return {
        success: true,
        message: "購物車更新成功",
        data: result,
        adjustedQuantity: correct_quantity !== final_quantity, // 標記數量是否被調整
        originalInput: final_quantity, // 原始輸入的數量
        finalQuantity: correct_quantity, // 最終使用的數量
      };
    } else {
      return {
        success: false,
        message: "購物車操作失敗",
      };
    }
  } catch (error) {
    console.log("error", error);
    return {
      success: false,
      message: "資料庫操作發生錯誤",
      error: error,
    };
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉連接錯誤", error);
      }
    }
  }
}

//訪客返回購物車資訊
export async function guestAddToCart(
  oracle_id: string,
  original_quantity: number,
  new_quantity?: number,
) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    // 計算最終數量
    let final_quantity = new_quantity
      ? original_quantity + new_quantity
      : original_quantity;

    // 判斷並取得符合商品最小包裝量的購買數量
    let correct_quantity = Number(
      await checkCartQuantity(oracle_id, final_quantity, connection),
    );
    const { inventory, product_id, fixed_lot_multiplier } =
      await getProductInfo(connection, oracle_id);
    if (inventory < correct_quantity) {
      const returnQuantity =
        Math.floor(inventory / fixed_lot_multiplier) * fixed_lot_multiplier;
      const result = await getCartData(
        connection,
        "",
        returnQuantity,
        oracle_id,
      );

      return {
        success: false,
        overValueMessage: `由於品項:${product_id}目前庫存不足，您的購物車數量已降至最小包裝量:${returnQuantity}`,
        data: result,
      };
    }

    // 若計算正確數量有error 直接return
    const result = await getCartData(
      connection,
      "",
      correct_quantity,
      oracle_id,
    );

    return {
      success: true,
      message: "購物車資料返回成功",
      data: result,
    };
  } catch (error) {
    console.log("error", error);
    return {
      success: false,
      message: "資料庫操作發生錯誤",
      error: error,
    };
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉連接錯誤", error);
      }
    }
  }
}

// 取得購物車
export async function getCart(member_id: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await getCartData(connection, member_id);
    if (result && result.length > 0) {
      const overValueMessages: string[] = [];
      // 檢查庫存是否足夠
      for (const item of result) {
        const { inventory, product_id, fixed_lot_multiplier } =
          await getProductInfo(connection, item.ORACLE_ID);
        if (inventory < item.QUANTITY) {
          try {
            const returnQuantity =
              Math.floor(inventory / fixed_lot_multiplier) *
              fixed_lot_multiplier;
            item.QUANTITY = returnQuantity;
            overValueMessages.push(
              `由於品項:${product_id}目前庫存不足，您的購物車數量已降至最小包裝量:${returnQuantity}`,
            );
            await connection?.execute(
              `UPDATE CART SET QUANTITY = :quantity 
               WHERE MEMBER_ID = :member_id AND ORACLE_ID = :oracle_id`,
              [returnQuantity, member_id, item.ORACLE_ID],
              { autoCommit: true },
            );
          } catch (error) {
            console.log("error", error);
            return {
              success: false,
              message: "資料庫操作發生錯誤",
              error: error,
            };
          }
        }
      }
      return {
        success: true,
        overValueMessage:
          overValueMessages.length > 0 ? overValueMessages.join("\n") : "",
        message: "購物車取得成功",
        data: result,
      };
    } else {
      return {
        success: true,
        message: "目前尚無購物車資料",
        data: [],
        overValueMessage: "",
      };
    }
  } catch (error) {
    console.log("error", error);
    return {
      success: false,
      message: "資料庫操作發生錯誤",
      error: error,
    };
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉連接錯誤", error);
      }
    }
  }
}

// 確認購物車是否存在指定料號
export async function checkCart(member_id: string, oracle_id: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT 1 FROM CART WHERE MEMBER_ID = :member_id AND ORACLE_ID = :oracle_id`,
      [member_id, oracle_id],
    );
    if (result && result.rows && result.rows.length > 0) {
      return true;
    } else return false;
  } catch (error) {
    console.log("error");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉連接錯誤", error);
      }
    }
  }
}

// 更新購物車
export async function updateCart(member_id: string, item: any) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const oracle_id = item[0].oracle_id;
    const unit_price = item[0].unit_price;
    const quantity = item[0].quantity;
    const totalPrice = unit_price * quantity;
    const result = await connection.execute(
      `UPDATE CART SET UNIT_PRICE = :unit_price, QUANTITY = :quantity, TOTAL_PRICE = :totalPrice WHERE MEMBER_ID = :member_id AND ORACLE_ID = :oracle_id`,
      [unit_price, quantity, totalPrice, member_id, oracle_id],
      { autoCommit: true },
    );
    if (result && result.rowsAffected && result.rowsAffected > 0) {
      return {
        success: true,
        message: "更新成功",
      };
    } else {
      return {
        success: false,
        message: "更新失敗",
      };
    }
  } catch (error) {
    console.log("update error", error);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉連接錯誤", error);
      }
    }
  }
}

//刪除購物車
export async function deleteCart(member_id: string, oracle_id?: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    let result;
    if (oracle_id) {
      result = await connection.execute(
        `DELETE FROM CART WHERE MEMBER_ID = :member_id AND ORACLE_ID = :oracle_id`,
        [member_id, oracle_id],
        { autoCommit: true },
      );
    } else {
      result = await connection.execute(
        `DELETE FROM CART WHERE MEMBER_ID = :member_id`,
        [member_id],
        { autoCommit: true },
      );
    }
    if (result && result.rowsAffected && result.rowsAffected > 0) {
      return {
        success: true,
        message: "刪除成功",
      };
    } else {
      return {
        success: false,
        message: "刪除失敗",
      };
    }
  } catch (error) {
    console.log("error", error);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉連接錯誤", error);
      }
    }
  }
}
