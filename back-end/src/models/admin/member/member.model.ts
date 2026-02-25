import { getConnection } from "../../../config/database";
import oracledb from "oracledb";
import type { BlockMember } from "../../../types/admin/member";

// 取得所有會員
export async function getMember(page: number, pageSize: number, filters: any) {
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
          case "registrationDateStart":
            conditions.push("M.CREATED_AT >= :registrationDateStart");
            bindParams.registrationDateStart = value;
            break;
          case "registrationDateEnd":
            conditions.push("M.CREATED_AT <= :registrationDateEnd");
            bindParams.registrationDateEnd = value;
            break;
          case "memberType":
            conditions.push("M.MEMBER_TYPE = :memberType");
            bindParams.memberType = value;
            break;
          case "verificationStatus":
            conditions.push("M.ISVERIFIED = :isVerified");
            bindParams.isVerified = value;
            break;
          case "accountStatus":
            conditions.push("M.IS_BLOCKLIST = :isBlocklist");
            bindParams.isBlocklist = value;
            break;
          case "memberGroup":
            conditions.push("MG_LIST.GROUP_NAMES = :groupNames");
            bindParams.groupNames = value;
            break;

          case "keyword": //處裡搜尋欄位:會員姓名、電話、信箱、會員類型、會員群組
            conditions.push(
              "(UPPER(M.USER_NAME) like UPPER(:keyword) OR M.MOBILE_PHONE like:keyword OR UPPER(M.EMAIL) like UPPER(:keyword) OR M.MEMBER_TYPE like:keyword OR MG_LIST.GROUP_NAMES like:keyword)",
            );
            bindParams.keyword = `%${value.toString().toUpperCase()}%`;
            break;
        }
      });
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const offset = (page - 1) * pageSize;

    // 計算總數量
    const countResult = await connection.execute(
      `SELECT COUNT(*) as total_count
            FROM MEMBERS M
            LEFT JOIN ( SELECT O.MEMBER_ID, SUM(O.FINAL_AMOUNT) AS TOTAL_AMOUNT FROM ORDERS O WHERE O.ORDER_STATUS NOT IN('CANCELLED', 'VOIDED') GROUP BY O.MEMBER_ID) O_SUM 
            ON M.MEMBER_ID = O_SUM.MEMBER_ID
            LEFT JOIN (SELECT MGR.MEMBER_ID, LISTAGG(MG.GROUP_NAME, '/') WITHIN GROUP (ORDER BY MG.GROUP_NAME) AS GROUP_NAMES 
            FROM MEMBER_GROUP_RELATION MGR JOIN MEMBER_GROUP MG ON MGR.GROUP_ID = MG.GROUP_ID
            GROUP BY MGR.MEMBER_ID) MG_LIST 
            ON M.MEMBER_ID = MG_LIST.MEMBER_ID
       ${whereClause}`,
      bindParams,
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const countRows = countResult.rows as any[];
    const totalCount = countRows[0].TOTAL_COUNT;

    const result = await connection.execute(
      `
      SELECT M.MEMBER_ID, M.MEMBER_TYPE, M.USER_NAME,M.MOBILE_PHONE,M.EMAIL, M.STATUS,M.REGION,M.CITY,M.ADDRESS,M.GENDER,M.PHONE,M.BIRTHDAY,
      M.UPDATED_AT,M.LAST_LOGIN_AT,M.ISVERIFIED,M.CREATED_AT,M.IS_BLOCKLIST,M.BLOCK_REASON,M.BLOCK_DATE, COALESCE(O_SUM.TOTAL_AMOUNT, 0) AS TOTAL_AMOUNT, 
      MG_LIST.GROUP_NAMES AS GROUP_NAME 
      FROM MEMBERS M 
      LEFT JOIN ( SELECT O.MEMBER_ID, SUM(O.FINAL_AMOUNT) AS TOTAL_AMOUNT FROM ORDERS O WHERE O.ORDER_STATUS NOT IN('CANCELLED', 'VOIDED') GROUP BY O.MEMBER_ID) O_SUM 
      ON M.MEMBER_ID = O_SUM.MEMBER_ID
      LEFT JOIN (SELECT MGR.MEMBER_ID, LISTAGG(MG.GROUP_NAME, '/') WITHIN GROUP (ORDER BY MG.GROUP_NAME) AS GROUP_NAMES 
      FROM MEMBER_GROUP_RELATION MGR JOIN MEMBER_GROUP MG ON MGR.GROUP_ID = MG.GROUP_ID
      GROUP BY MGR.MEMBER_ID) MG_LIST 
      ON M.MEMBER_ID = MG_LIST.MEMBER_ID
       ${whereClause}
      ORDER BY M.MEMBER_ID
      OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
      {
        ...bindParams,
        offset,
        pageSize,
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );
    return { data: result.rows, totalCount };
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

// 查詢指定會員
export async function getMemberById(member_id: string) {
  let connection;
  try {
    connection = await getConnection();
    const allPromises = [];
    const memberResult = await connection.execute(
      `SELECT
        M.MEMBER_ID, 
        M.MEMBER_TYPE,
        M.USER_NAME,
        M.MOBILE_PHONE,
        M.EMAIL,
        M.STATUS,
        M.REGION,
        M.CITY,
        M.ADDRESS,
        M.GENDER,
        M.PHONE,
        M.BIRTHDAY,
        M.UPDATED_AT,
        M.LAST_LOGIN_AT,
        M.ISVERIFIED,
        M.CREATED_AT,
        M.IS_BLOCKLIST,
        M.BLOCK_REASON,
        M.BLOCK_DATE,
        COALESCE(O_SUM.TOTAL_AMOUNT, 0) AS TOTAL_AMOUNT,
        COALESCE(O_SUM.ORDER_COUNT, 0) AS ORDER_COUNT,
        MG_LIST.GROUP_NAMES AS GROUP_NAME,
        CIM.INDUSTRY_TYPE,
        CIM.OTHER_COMPANY_INDUSTRY,
        CIM.COMPANY_NAME,
        CIM.TAX_ID,
        CIM.JOB_TITLE,
        M.NOTES
    FROM
        MEMBERS M
        LEFT JOIN (
            SELECT
                O.MEMBER_ID,
                SUM(O.FINAL_AMOUNT) AS TOTAL_AMOUNT,
                COUNT(*) AS ORDER_COUNT
            FROM
                ORDERS O
            WHERE 
                O.ORDER_STATUS NOT IN('CANCELLED', 'VOIDED')
            GROUP BY
                O.MEMBER_ID
        ) O_SUM ON M.MEMBER_ID = O_SUM.MEMBER_ID
        LEFT JOIN (
            SELECT
                MGR.MEMBER_ID,
                LISTAGG(MG.GROUP_NAME, '/') WITHIN GROUP (
                    ORDER BY
                        MG.GROUP_NAME
                ) AS GROUP_NAMES
            FROM
                MEMBER_GROUP_RELATION MGR
                JOIN MEMBER_GROUP MG ON MGR.GROUP_ID = MG.GROUP_ID
            GROUP BY
                MGR.MEMBER_ID
        ) MG_LIST ON M.MEMBER_ID = MG_LIST.MEMBER_ID
        LEFT JOIN (
            SELECT CI.MEMBER_ID, CI.INDUSTRY_TYPE, CI.OTHER_COMPANY_INDUSTRY, CM.COMPANY_NAME, CM.TAX_ID, CM.JOB_TITLE
            FROM COMPANY_INDUSTRIES CI
            JOIN COMPANY_MEMBERS CM ON CI.MEMBER_ID = CM.MEMBER_ID
        )CIM ON M.MEMBER_ID = CIM.MEMBER_ID
          WHERE M.MEMBER_ID = :member_id`,
      [member_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const orders = await connection.execute(
      `SELECT * FROM ORDERS WHERE MEMBER_ID = :member_id ORDER BY ORDER_ID DESC`,
      [member_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    allPromises.push(memberResult);
    allPromises.push(orders);
    const results = await Promise.all(allPromises);
    return {
      success: true,
      message: "查詢指定會員成功",
      data: {
        member: results[0].rows,
        orders: results[1].rows,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "查詢指定會員失敗",
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

export async function updateMemberById(member_id: string, data: any) {
  let connection;
  try {
    connection = await getConnection();
    let allPromises = [];
    const key = Object.keys(data);
    // 一般會員資料
    const bindParams: { [key: string]: any } = {};
    const collumn = key
      .map((k) => {
        if (k !== "company_name" && k !== "tax_id" && k !== "industry_type") {
          bindParams[k] = data[k];
          return `${k} = :${k}`;
        }
        return null;
      })
      .filter(Boolean)
      .join(",");
    bindParams.member_id = member_id;
    if (collumn) {
      const result = await connection.execute(
        `UPDATE MEMBERS SET ${collumn} WHERE MEMBER_ID = :member_id`,
        bindParams,
      );
      allPromises.push(result);
    }

    // 企業資料
    const company_bindParams: { [key: string]: any } = {};
    const company_collumn = key
      .map((k) => {
        if (k === "company_name" || k === "tax_id") {
          company_bindParams[k] = data[k];
          return `${k} = :${k}`;
        }
        return null;
      })
      .filter(Boolean)
      .join(",");
    company_bindParams.member_id = member_id;
    if (company_collumn) {
      const company_result = await connection.execute(
        `UPDATE COMPANY_MEMBERS SET ${company_collumn} WHERE MEMBER_ID = :member_id`,
        company_bindParams,
      );
      allPromises.push(company_result);
    }

    // 企業產業資料
    const company_industry_bindParams: { [key: string]: any } = {};
    const company_industry_collumn = key
      .map((k) => {
        if (k === "industry_type") {
          company_industry_bindParams[k] = data[k];
          return `${k} = :${k}`;
        }
        return null;
      })
      .filter(Boolean)
      .join(",");
    company_industry_bindParams.member_id = member_id;
    if (company_industry_collumn) {
      const company_industry_result = await connection.execute(
        `UPDATE COMPANY_INDUSTRIES SET ${company_industry_collumn} WHERE MEMBER_ID = :member_id`,
        company_industry_bindParams,
      );
      allPromises.push(company_industry_result);
    }

    await Promise.all(allPromises);
    await connection.commit();

    return {
      success: true,
      message: "更新會員成功",
    };
  } catch (error) {
    console.log("error", error);
    return { success: false, message: "更新會員失敗" };
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

// 停權 or 解封會員
export async function memberOperation(blockMember: BlockMember) {
  let connection;
  try {
    connection = await getConnection();
    let { member_id, is_blocklist, block_reason, block_date } = blockMember;

    // 創建綁定參數物件
    const bindParams: { [key: string]: any } = {};

    // 為每個 member_id 創建參數
    const idPlaceholders = member_id
      .map((id, index) => {
        const paramName = `id${index}`;
        bindParams[paramName] = id;
        return `:${paramName}`;
      })
      .join(", ");

    if (is_blocklist === 1) {
      bindParams.block_reason = block_reason;
      bindParams.block_date = block_date;

      const result = await connection.execute(
        `UPDATE MEMBERS SET IS_BLOCKLIST = 1, BLOCK_REASON = :block_reason, BLOCK_DATE = :block_date
         WHERE MEMBER_ID IN (${idPlaceholders})`,
        bindParams,
        { autoCommit: true },
      );
      if (result.rowsAffected && result.rowsAffected > 0) {
        return { success: true, message: "成功把會員加入黑名單" };
      }
    } else {
      const result = await connection.execute(
        `UPDATE MEMBERS SET IS_BLOCKLIST = 0, BLOCK_REASON = '', BLOCK_DATE = ''
         WHERE MEMBER_ID IN (${idPlaceholders})`,
        bindParams,
        { autoCommit: true },
      );
      if (result.rowsAffected && result.rowsAffected > 0) {
        return { success: true, message: "成功把會員從黑名單中移除" };
      }
    }
  } catch (error) {
    console.log("error", error);
    return { success: false, message: "操作失敗" };
  }
}

export async function addGroup(groupName: string) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `INSERT INTO MEMBER_GROUP (GROUP_NAME) VALUES (:groupName)`,
      { groupName },
      { autoCommit: true },
    );
    return { success: true, message: "新增群組成功" };
  } catch (error) {
    console.log("error", error);
    return { success: false, message: "新增群組失敗" };
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

export async function getGroup() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT GROUP_ID, GROUP_NAME, GROUP_COUNT FROM MEMBER_GROUP`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return result.rows;
  } catch (error) {
    console.log("error", error);
    return { success: false, message: "取得群組失敗" };
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
// 會員套用群組
export async function applyGroup(payload: any) {
  let connection;
  try {
    connection = await getConnection();
    const { memberIds, groupIds } = payload;

    const allPromises = [];
    for (const member_id of memberIds) {
      const checkResult = await connection.execute(
        `SELECT COUNT(*) FROM MEMBER_GROUP_RELATION WHERE MEMBER_ID = :member_id`,
        [member_id],
      );
      const checkGroupExist =
        checkResult && checkResult.rows && checkResult.rows.length > 0;
      if (checkGroupExist) {
        const deletePromise = connection.execute(
          `DELETE FROM MEMBER_GROUP_RELATION WHERE MEMBER_ID = :member_id`,
          [member_id],
        );
        allPromises.push(deletePromise);
      }
      for (const group_id of groupIds) {
        const insertPromise = connection.execute(
          `INSERT INTO MEMBER_GROUP_RELATION (MEMBER_ID, GROUP_ID) VALUES(:member_id, :group_id)`,
          [member_id, group_id],
        );
        allPromises.push(insertPromise);
      }
    }
    await Promise.all(allPromises);
    await connection.commit();

    const group = await connection.execute(
      `SELECT GROUP_ID, GROUP_NAME, GROUP_COUNT FROM MEMBER_GROUP`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const group_relation = await connection.execute(
      `SELECT * FROM MEMBER_GROUP_RELATION`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    return {
      success: true,
      message: "群組套用成功",
      data: {
        group: group.rows,
        group_relation: group_relation.rows,
      },
    };
  } catch (error) {
    console.log("error", error);
    return { success: false, message: "群組套用失敗" };
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
// 會員群組關聯
export async function getGroupRelation() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM MEMBER_GROUP_RELATION`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return result.rows;
  } catch (error) {
    console.log("error", error);
    return { success: false, message: "取得群組關聯失敗" };
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

// 更新群數會員數量
export async function updateGroupCount() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `UPDATE MEMBER_GROUP SET GROUP_COUNT = (SELECT COUNT(*) FROM MEMBER_GROUP_RELATION WHERE GROUP_ID = MEMBER_GROUP.GROUP_ID)`,
      {},
      { autoCommit: true },
    );
    return { success: true, message: "更新群組數量成功" };
  } catch (error) {
    console.log("error", error);
    return { success: false, message: "更新群組數量失敗" };
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
