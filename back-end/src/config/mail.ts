import * as dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

export const mailConfig = {
  host: process.env.MAIL_HOST || "smtp.example.com",
  port: parseInt(process.env.MAIL_PORT || "25", 10),
  secure: false,
  tls: {
    rejectUnauthorized: false, // 停用憑證驗證
  },
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
};

export const transporter = nodemailer.createTransport(mailConfig);

export async function verifyMailConnection() {
  try {
    const verification = await transporter.verify();
    console.log("郵件服務連接成功");
    return verification;
  } catch (e) {
    console.log("伺服器連接失敗", e);
    throw e;
  }
}
