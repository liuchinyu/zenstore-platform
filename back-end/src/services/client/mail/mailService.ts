import { transporter } from "../../../config/mail";

interface MailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export async function sendMail(options: MailOptions) {
  try {
    const mailOptions = {
      from: options.from || process.env.MAIL_FROM || "no-reply@example.com",
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("郵件已發送:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("郵件發送失敗:", error);
    throw error;
  }
}

export async function sendVerificationEmail(
  email: string,
  userName: string,
  token: string,
) {
  const verificationUrl = `${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/auth/register/verification/memberVerified?email=${email}&token=${token}&userName=${userName}`;

  return sendMail({
    from: "jerry839_liu@zenitron.com.tw",
    to: email,
    subject: "請驗證您的電子郵件",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>您好，${userName}！</h2>
      <p>感謝您註冊成為 ZenStore 的會員。</p>
      <p>請點擊下方按鈕驗證您的電子郵件地址，以啟用您的帳號：</p>
      <div style="text-align: center; margin: 20px 0;">
      <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
         驗證我的帳號
      </a>
      </div>
      <p>如果您無法點擊上方按鈕，請複製以下連結到瀏覽器地址欄中：</p>
      <p style="word-break: break-all; color: #0066cc;">${verificationUrl}</p>
      <p>此連結將在 24 小時後失效。</p>
      <p>若您未曾註冊 ZenStore 帳號，請忽略此郵件。</p>
      <p>ZenStore 團隊</p>
    </div>
      `,
  });
}

export async function sendResetPasswordEmail(
  email: string,
  userName: string,
  token: string,
) {
  const verificationUrl = `${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/auth/forgot-password/resetPassword?email=${email}&token=${token}&userName=${userName}`;

  return sendMail({
    from: "jerry839_liu@zenitron.com.tw",
    to: email,
    subject: "請重設您的密碼",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>您好，${userName}！</h2>
      <p>請點擊下方按鈕重設您的密碼：</p>
      <div style="text-align: center; margin: 20px 0;">
      <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
         重設我的密碼
      </a>
      </div>
      <p>如果您無法點擊上方按鈕，請複製以下連結到瀏覽器地址欄中：</p>
      <p style="word-break: break-all; color: #0066cc;">${verificationUrl}</p>
      <p>此連結將在 24 小時後失效。</p>
      <p>若您未曾要求重設密碼，請忽略此郵件。</p>
      <p>ZenStore 團隊</p>
    </div>
      `,
  });
}

// sendVerificationEmail("jerry839_liu@zenitron.com.tw", "劉先生", "123456");
