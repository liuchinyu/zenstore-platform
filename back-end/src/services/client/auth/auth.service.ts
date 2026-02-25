import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { getConnection } from "../../../config/database";
import type { Connection } from "oracledb";
import type { MemberData } from "../../../types/auth";
import { generateVerificationToken } from "../../../utils/token";
import { generateToken } from "../../../utils/jwt.utils";

import {
  isEmailExist,
  isMobilePhoneExist,
  isTaxIdExist,
  register,
  login,
} from "../../../models/client/auth/auth.model";

interface ConnectResult {
  success: boolean | string;
  message: string;
  memberId?: string;
  errors?: string[];
  verificationToken?: string;
  userData?: USER_DATA_TYPE;
  token?: string;
}

interface USER_DATA_TYPE {
  MEMBER_ID: string;
  EMAIL: string;
  MEMBER_TYPE: string;
  ISVERIFIED: number;
  STATUS: string;
  USER_NAME: string;
  VERIFICATION_TOKEN: string;
}

/**
 * 註冊服務
 * @param params 註冊參數
 * @returns 註冊結果
 *
 */

let connection: Connection;
async function initialize() {
  connection = await getConnection();
}

export async function registerService(
  params: MemberData,
): Promise<ConnectResult> {
  try {
    await initialize();
    const errors: string[] = [];

    // 檢查電子郵件是否已存在
    if (await isEmailExist(params.EMAIL)) {
      errors.push("此電子郵件已被註冊");
    }

    // 檢查手機號碼是否已存在
    if (await isMobilePhoneExist(params.MOBILE_PHONE)) {
      errors.push("此行動電話已被註冊");
    }

    // 檢查企業會員統一編號
    if (params.MEMBER_TYPE === "企業會員" && params.TAX_ID) {
      if (await isTaxIdExist(params.TAX_ID)) {
        errors.push("此統一編號已被註冊");
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: "註冊失敗",
        errors: errors,
      };
    }

    // 生成會員ID
    const memberId = uuidv4();

    // 密碼加密
    const salt = 10;
    const passwordHash = await bcrypt.hash(params.PASSWORD_HASH, salt);

    // 生成驗證令牌
    const verificationToken = generateVerificationToken();

    // 創建會員
    if (params.MEMBER_TYPE === "個人會員") {
      await register({
        MEMBER_ID: memberId,
        MEMBER_TYPE: params.MEMBER_TYPE,
        USER_NAME: params.USER_NAME,
        MOBILE_PHONE: params.MOBILE_PHONE,
        EMAIL: params.EMAIL,
        PASSWORD_HASH: passwordHash,
        VERIFICATION_TOKEN: verificationToken,
      });
    }

    // 處理企業會員特有資料
    if (params.MEMBER_TYPE === "企業會員") {
      await register({
        MEMBER_ID: memberId,
        MEMBER_TYPE: params.MEMBER_TYPE,
        USER_NAME: params.USER_NAME,
        MOBILE_PHONE: params.MOBILE_PHONE,
        EMAIL: params.EMAIL,
        PASSWORD_HASH: passwordHash,
        COMPANY_NAME: params.COMPANY_NAME || "",
        TAX_ID: params.TAX_ID || "",
        JOB_TITLE: params.JOB_TITLE || "",
        INDUSTRY_TYPE: params.INDUSTRY_TYPE,
        OTHER_COMPANY_INDUSTRY: params.OTHER_COMPANY_INDUSTRY || "",
        VERIFICATION_TOKEN: verificationToken,
      });
    }

    return {
      success: true,
      message: "註冊成功",
      memberId,
      verificationToken,
    };
  } catch (error) {
    if (connection) {
      await connection.execute(`ROLLBACK`);
    }
    console.error("註冊服務錯誤:", error);
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

export async function loginService(
  email: string,
  password: string,
): Promise<ConnectResult> {
  try {
    const result = await login(email, password);
    if (result.success) {
      if (result.userData?.ISVERIFIED === 0 || !result.userData?.ISVERIFIED) {
        return {
          success: "almost",
          message: "您尚未驗證您的電子郵件",
          userData: result.userData,
        };
      }

      const token = generateToken(result.userData as any);
      return {
        success: true,
        message: "登入成功",
        userData: result.userData,
        token: token,
      };
    } else {
      return {
        success: false,
        message: result.message || "登入失敗",
      };
    }
  } catch (error) {
    throw error;
  }
}
