import { getConnection } from "../../../config/database";
import type { Connection } from "oracledb";
import type { MemberData } from "../../../types/auth";
import bcrypt from "bcrypt";
import { generateVerificationToken } from "../../../utils/token";

export async function isEmailExist(email: string): Promise<boolean> {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT 1 FROM MEMBERS WHERE EMAIL = :email`,
      [email],
    );
    return result.rows !== undefined && result.rows.length > 0;
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

export async function isMobilePhoneExist(
  mobilePhone: string,
): Promise<boolean> {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT 1 FROM MEMBERS WHERE MOBILE_PHONE = :mobilePhone`,
      [mobilePhone],
    );
    return result.rows !== undefined && result.rows.length > 0;
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

export async function isTaxIdExist(taxId: string): Promise<boolean> {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT 1 FROM COMPANY_MEMBERS WHERE TAX_ID = :taxId`,
      [taxId],
    );
    return result.rows !== undefined && result.rows.length > 0;
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉資料庫連結失敗", error);
      }
    }
  }
}

//會員註冊
export async function register(data: MemberData) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `INSERT INTO MEMBERS(MEMBER_ID, MEMBER_TYPE, USER_NAME, MOBILE_PHONE, EMAIL, PASSWORD_HASH, VERIFICATION_TOKEN)
      VALUES(:MEMBER_ID, :MEMBER_TYPE, :USER_NAME, :MOBILE_PHONE, :EMAIL, :PASSWORD_HASH, :VERIFICATION_TOKEN)`,
      [
        data.MEMBER_ID,
        data.MEMBER_TYPE,
        data.USER_NAME,
        data.MOBILE_PHONE,
        data.EMAIL,
        data.PASSWORD_HASH,
        data.VERIFICATION_TOKEN,
      ],
      { autoCommit: true },
    );

    if (data.MEMBER_TYPE === "企業會員") {
      const companyResult = await connection.execute(
        `INSERT INTO COMPANY_MEMBERS(MEMBER_ID, COMPANY_NAME, TAX_ID, JOB_TITLE)
      VALUES(:MEMBER_ID, :COMPANY_NAME, :TAX_ID, :JOB_TITLE)`,
        [data.MEMBER_ID, data.COMPANY_NAME, data.TAX_ID, data.JOB_TITLE],
        { autoCommit: true },
      );

      const companyIndustriesResult = await connection.execute(
        `INSERT INTO COMPANY_INDUSTRIES(MEMBER_ID, INDUSTRY_TYPE, OTHER_COMPANY_INDUSTRY)
         VALUES(:MEMBER_ID, :INDUSTRY_TYPE, :OTHER_COMPANY_INDUSTRY)
        `,
        [data.MEMBER_ID, data.INDUSTRY_TYPE, data.OTHER_COMPANY_INDUSTRY],
        { autoCommit: true },
      );
      return { result, companyResult, companyIndustriesResult };
    }

    return result;
  } catch (error) {
    console.log("註冊過程發生錯誤", error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.log("回滾事務失敗", rollbackErr);
      }
    }
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉資料庫連結失敗", error);
      }
    }
  }
}

export async function verifyToken(email: string, token: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT 1 FROM MEMBERS WHERE EMAIL = :email AND VERIFICATION_TOKEN = :token`,
      [email, token],
    );
    // console.log(result);
    // return result;
    return result.rows !== undefined && result.rows.length > 0;
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.log("回滾事務失敗", rollbackErr);
      }
    }
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉資料庫連結失敗", error);
      }
    }
  }
}

export async function verifyMember(email: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `
      UPDATE MEMBERS SET ISVERIFIED = 1 WHERE EMAIL = :email
      `,
      [email],
      { autoCommit: true },
    );
    if (result.rowsAffected && result.rowsAffected > 0) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.log("回滾事務失敗", rollbackErr);
      }
    }
    throw e;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.log("關閉資料庫連結失敗", e);
      }
    }
  }
}

// 會員登入
export async function login(email: string, password: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection?.execute(
      `SELECT MEMBER_ID, EMAIL, MEMBER_TYPE, ISVERIFIED, STATUS, USER_NAME, PASSWORD_HASH, VERIFICATION_TOKEN, MOBILE_PHONE, GENDER, BIRTHDAY, REGION, CITY, ADDRESS, PHONE
      FROM MEMBERS WHERE EMAIL = :email`,
      [email],
    );
    if (result.rows !== undefined && result.rows.length > 0) {
      const row = result.rows[0] as any;
      let passwordHash: string;
      if (Array.isArray(row)) {
        passwordHash = String(row[6]);
      } else {
        // 直接轉換為字符串
        passwordHash = String(row);
      }
      const isPasswordValid = await bcrypt.compare(password, passwordHash);
      if (isPasswordValid) {
        return {
          success: true,
          userData: {
            MEMBER_ID: row[0],
            EMAIL: row[1],
            MEMBER_TYPE: row[2],
            ISVERIFIED: row[3],
            STATUS: row[4],
            USER_NAME: row[5],
            VERIFICATION_TOKEN: row[7],
            MOBILE_PHONE: row[8],
            GENDER: row[9],
            BIRTHDAY: row[10],
            REGION: row[11],
            CITY: row[12],
            ADDRESS: row[13],
            PHONE: row[14],
          },
        };
      } else {
        return {
          success: false,
          message: "登入失敗，請確認輸入信箱密碼是否正確",
        };
      }
    }
    return {
      success: false,
      message: "登入失敗，請確認輸入信箱密碼是否正確",
    };
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.log("關閉資料庫連結失敗", e);
      }
    }
  }
}

// 更新會員資料
export async function updateMemberData(memberId: string, data: any) {
  let connection: Connection | undefined;

  try {
    connection = await getConnection();
    const keys = Object.keys(data);
    const values = Object.values(data);
    const updateQuery = keys.map((key, index) => `${key} = :${key}`).join(", ");
    const result = await connection?.execute(
      `UPDATE MEMBERS SET ${updateQuery} WHERE MEMBER_ID = :memberId`,
      [...values, memberId],
      { autoCommit: true },
    );
    return {
      success: true,
      message: "更新會員資料成功",
      status: 200,
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function updateCompanyData(memberId: string, data: any) {
  let connection: Connection | undefined;

  try {
    connection = await getConnection();
    const keys = Object.keys(data);
    const values = Object.values(data);
    const updateQuery = keys.map((key, index) => `${key} = :${key}`).join(", ");
    const result = await connection?.execute(
      `UPDATE company_members SET ${updateQuery} WHERE MEMBER_ID = :memberId`,
      [...values, memberId],
      { autoCommit: true },
    );
    return {
      success: true,
      message: "更新會員資料成功",
      status: 200,
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// 更新企業資料
export async function updateCompanyIndustries(memberId: string, data: any) {
  let connection: Connection | undefined;

  try {
    connection = await getConnection();
    const keys = Object.keys(data);
    const values = Object.values(data);
    const updateQuery = keys.map((key, index) => `${key} = :${key}`).join(", ");
    const result = await connection?.execute(
      `UPDATE company_industries SET ${updateQuery} WHERE MEMBER_ID = :memberId`,
      [...values, memberId],
      { autoCommit: true },
    );
    return {
      success: true,
      message: "更新會員資料成功",
      status: 200,
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// 取得members資料
export async function getUserData(memberId: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT MEMBER_ID, EMAIL, MEMBER_TYPE, ISVERIFIED, STATUS, USER_NAME, VERIFICATION_TOKEN, MOBILE_PHONE, GENDER, BIRTHDAY, REGION, CITY, ADDRESS, PHONE
      FROM MEMBERS WHERE MEMBER_ID = :memberId`,
      [memberId],
    );
    return result.rows;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// 取得公司資料
export async function getCompanyData(memberId: string) {
  let connection: Connection | undefined;
  let companyData: any = {};
  let companyIndustriesData: any = {};
  try {
    connection = await getConnection();
    companyData = await connection.execute(
      `SELECT COMPANY_NAME, TAX_ID, JOB_TITLE FROM COMPANY_MEMBERS WHERE MEMBER_ID = :memberId`,
      [memberId],
    );
    companyIndustriesData = await connection.execute(
      `SELECT INDUSTRY_TYPE, OTHER_COMPANY_INDUSTRY FROM COMPANY_INDUSTRIES WHERE MEMBER_ID = :memberId`,
      [memberId],
    );
    return { companyData, companyIndustriesData };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// 確認密碼
export async function checkPassword(email: string, password: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection?.execute(
      `SELECT PASSWORD_HASH FROM MEMBERS WHERE EMAIL = :email`,
      [email],
    );
    if (result.rows !== undefined && result.rows.length > 0) {
      const row = result.rows[0] as any;
      let passwordHash: string = String(row[0]);
      const isPasswordValid = await bcrypt.compare(password, passwordHash);
      if (isPasswordValid) {
        return {
          success: true,
          message: "密碼認證成功",
        };
      } else {
        return {
          success: false,
          message: "您輸入的密碼錯誤，請確認輸入的密碼是否正確",
        };
      }
    }
  } catch (error) {
    return {
      success: false,
      message: "系統出現錯誤，請通知相關處理人員",
    };
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.log("關閉資料庫連結失敗", error);
      }
    }
  }
}

// 忘記密碼
export async function forgotPassword(email: string, mobilePhone: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT USER_NAME, EMAIL, VERIFICATION_TOKEN FROM MEMBERS WHERE EMAIL = :email AND MOBILE_PHONE = :mobilePhone`,
      [email, mobilePhone],
    );
    if (result.rows !== undefined && result.rows.length > 0) {
      const row = result.rows[0] as any;
      return {
        success: true,
        message: "認證成功，請至信箱確認收件",
        userData: {
          USER_NAME: row[0],
          EMAIL: row[1],
          VERIFICATION_TOKEN: row[2],
        },
      };
    } else {
      return {
        success: false,
        message: "認證失敗，請確認輸入的郵件跟手機號碼是否正確",
      };
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// 重設密碼
export async function resetPassword(email: string, newPassword: string) {
  let connection: Connection | undefined;
  try {
    connection = await getConnection();
    const salt = 10;
    const passwordHash = await bcrypt.hash(newPassword, salt);
    const verificationToken = generateVerificationToken();
    const result = await connection.execute(
      `UPDATE MEMBERS SET PASSWORD_HASH = :passwordHash, VERIFICATION_TOKEN = :verificationToken WHERE EMAIL = :email`,
      [passwordHash, verificationToken, email],
      { autoCommit: true },
    );
    if (result.rowsAffected && result.rowsAffected > 0) {
      return {
        success: true,
        message: "密碼已重設，即將跳轉登入頁面，請以修改後的密碼登入",
      };
    } else {
      return {
        success: false,
        message: "重設密碼失敗，請稍後再試一次",
      };
    }
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.log("關閉資料庫連結失敗", e);
      }
    }
  }
}
