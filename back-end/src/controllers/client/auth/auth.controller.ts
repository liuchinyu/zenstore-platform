import { Request, Response, Router, RequestHandler } from "express";
import crypto from "crypto";
import { authenticateToken } from "../../../middlewares/authMiddleware";
import {
  registerService,
  loginService,
} from "../../../services/client/auth/auth.service";
import {
  verifyToken,
  verifyMember,
  forgotPassword,
  resetPassword,
  getCompanyData,
  updateMemberData,
  updateCompanyData,
  updateCompanyIndustries,
  getUserData,
  checkPassword,
} from "../../../models/client/auth/auth.model";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from "../../../services/client/mail/mailService";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ZEN_STORE_SECRET";

/**
 * 註冊新會員控制器
 * @param req - 請求對象
 * @param res - 響應對象
 */

const router = Router();

router.post("/register", (async (req: Request, res: Response) => {
  try {
    const {
      MEMBER_ID,
      MEMBER_TYPE,
      USER_NAME,
      MOBILE_PHONE,
      EMAIL,
      PASSWORD_HASH,
      REGION,
      CITY,
      ADDRESS,
      GENDER,
      PHONE,
      BIRTHDAY,
      COMPANY_NAME,
      TAX_ID,
      JOB_TITLE,
      INDUSTRY_TYPE,
      OTHER_COMPANY_INDUSTRY,
    } = req.body;

    const result = await registerService({
      MEMBER_ID: MEMBER_ID,
      MEMBER_TYPE: MEMBER_TYPE,
      USER_NAME: USER_NAME,
      MOBILE_PHONE: MOBILE_PHONE,
      EMAIL: EMAIL,
      PASSWORD_HASH: PASSWORD_HASH,
      REGION: REGION,
      CITY: CITY,
      ADDRESS: ADDRESS,
      GENDER: GENDER,
      PHONE: PHONE,
      BIRTHDAY: BIRTHDAY,
      COMPANY_NAME: COMPANY_NAME,
      TAX_ID: TAX_ID,
      JOB_TITLE: JOB_TITLE,
      INDUSTRY_TYPE: INDUSTRY_TYPE,
      OTHER_COMPANY_INDUSTRY: OTHER_COMPANY_INDUSTRY,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        status: 400,
        errors: result.errors,
      });
    }

    res.status(201).json({
      message: "註冊成功，請查收驗證郵件",
      memberId: result.memberId,
      verificationToken: result.verificationToken,
    });
  } catch (error) {
    console.error("註冊失敗:", error);
    res.status(500).json({
      message: "註冊處理時發生錯誤",
      error: error instanceof Error ? error.message : "未知錯誤",
    });
  }
}) as RequestHandler);

router.post("/validate-verification-token", (async (
  req: Request,
  res: Response,
) => {
  try {
    const { email, token, userName } = req.body;
    const isValid = await verifyToken(email, token);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "驗證失敗",
        status: 400,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "驗證成功",
        status: 200,
      });
      // 驗證成功後發送郵件
      // sendVerificationEmail(email, userName, token);
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "驗證過程發生錯誤",
      error: e instanceof Error ? e.message : "未知錯誤",
    });
  }
}) as RequestHandler);

//重新發送驗證郵件
router.post("/resend-verification-email", (async (
  req: Request,
  res: Response,
) => {
  try {
    const { email, userName, token } = req.body;
    sendVerificationEmail(email, userName, token);
    res.status(200).json({
      success: true,
      message: "重新發送驗證郵件成功",
      status: 200,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "重新發送驗證郵件發生錯誤",
      error: e instanceof Error ? e.message : "未知錯誤",
    });
  }
}) as RequestHandler);

router.post("/member-verified", (async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await verifyMember(email);

    if (result) {
      return res.status(200).json({
        success: true,
        message: "驗證成功",
        status: 200,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "驗證失敗",
        status: 400,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "驗證過程發生錯誤",
      error: e instanceof Error ? e.message : "未知錯誤",
    });
  }
}) as RequestHandler);

// 登入
router.post("/login", (async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await loginService(email, password);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        status: 400,
      });
    } else if (result.success == "almost") {
      return res.status(400).json({
        success: "almost",
        message: result.message,
        status: 400,
        email: result.userData?.EMAIL,
        userName: result.userData?.USER_NAME,
        token: result.userData?.VERIFICATION_TOKEN,
      });
    }

    // 設定 HTTP-only Cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 生產環境建議啟用
      sameSite: "strict", // 防止 CSRF
      maxAge: 24 * 60 * 60 * 1000, // 1天
    });

    res.status(200).json({
      success: true,
      message: "登入成功",
      status: 200,
      userData: result.userData,
      // token: result.token,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "登入過程發生錯誤",
      error: e instanceof Error ? e.message : "未知錯誤",
    });
  }
}) as RequestHandler);

router.get("/user-data", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { member_id } = req.query;
    const result = await getUserData(member_id as string);
    res.status(200).json({
      success: true,
      message: "取得會員資料成功",
      status: 200,
      userData: result,
    });
  } catch (e) {
    console.log(e);
  }
}) as RequestHandler);

router.get("/company-data", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { member_id } = req.query;
    const result = await getCompanyData(member_id as string);
    res.status(200).json({
      success: true,
      message: "取得公司資料成功",
      status: 200,
      companyData: result.companyData,
      companyIndustriesData: result.companyIndustriesData,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "取得公司資料失敗",
    });
  }
}) as RequestHandler);

router.post("/update-user", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { member_id, updateData } = req.body;
    await updateMemberData(member_id, updateData);
    res.status(200).json({
      success: true,
      message: "更新會員資料成功",
      status: 200,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "更新會員資料失敗",
    });
  }
}) as RequestHandler);

router.post("/update-company-data", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { member_id, updateData } = req.body;
    await updateCompanyData(member_id, updateData);
    res.status(200).json({
      success: true,
      message: "更新企業資料成功",
      status: 200,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "更新企業資料失敗",
    });
  }
}) as RequestHandler);

router.post("/update-company-industries", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { member_id, updateData } = req.body;
    await updateCompanyIndustries(member_id, updateData);
    res.status(200).json({
      success: true,
      message: "更新企業產業成功",
      status: 200,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "更新企業產業失敗",
    });
  }
}) as RequestHandler);

router.post("/logout", authenticateToken, (req: Request, res: Response) => {
  try {
    // 清除 token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "登出成功",
      status: 200,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "登出過程發生錯誤",
      error: e instanceof Error ? e.message : "未知錯誤",
    });
  }
});

// 取得狀態
router.get("/status", ((req: Request, res: Response) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({
      success: false,
      isLoggedIn: false,
      message: "未登入",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({
      success: true,
      isLoggedIn: true,
      userData: decoded,
    });
  } catch {
    res.status(401).json({
      success: false,
      isLoggedIn: false,
      message: "Token 已過期",
    });
  }
}) as RequestHandler);

router.get("/check-password", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { email, password } = req.query;
    const result = await checkPassword(email as string, password as string);
    if (result?.success) {
      return res.status(200).json({
        success: result?.success,
        message: result?.message,
      });
    } else {
      return res.status(400).json({
        success: result?.success,
        message: result?.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "系統錯誤，請聯絡相關人員",
    });
  }
}) as RequestHandler);

router.post("/forgot-password", (async (req: Request, res: Response) => {
  try {
    const { email, mobilePhone } = req.body;
    const result = await forgotPassword(email, mobilePhone);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }
    return res.status(200).json({
      success: true,
      message: result.message,
      userData: result.userData,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "系統發生錯誤",
      error: e instanceof Error ? e.message : "未知錯誤",
    });
  }
}) as RequestHandler);

router.post("/reset-password-email", (async (req: Request, res: Response) => {
  try {
    const { email, userName, token } = req.body;
    sendResetPasswordEmail(email, userName, token);
    res.status(200).json({
      success: true,
      message: "發送重設密碼郵件成功",
      status: 200,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "發送重設密碼郵件失敗",
      error: e instanceof Error ? e.message : "未知錯誤",
    });
  }
}) as RequestHandler);

router.post("/reset-password", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { email, password } = req.body;

    const result = await resetPassword(email, password);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "系統發生錯誤",
    });
  }
}) as RequestHandler);

// chatwoot身分驗證
router.post("/chatwoot-hmac", (async (req, res) => {
  const { userId } = req.body;
  const hmacKey = process.env.CHATWOOT_HMAC_KEY as string;

  // 使用 SHA256 算法生成 HMAC
  const hmac = crypto
    .createHmac("sha256", hmacKey)
    .update(userId)
    .digest("hex");

  res.json({ success: true, hmac });
}) as RequestHandler);

export default router;
