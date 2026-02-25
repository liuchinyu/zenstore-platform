"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/useToast";
import AuthService from "@/services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [reciptEmail, setReciptEmail] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [userName, setUserName] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const { showToast } = useToast();

  // 表單送出處理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !mobilePhone) {
      showToast("請填寫所有必填欄位", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.forgotPassword(email, mobilePhone);
      if (response.success) {
        showToast(
          response.message || "重設密碼郵件已發送，請檢查您的信箱",
          "success"
        );
        setEmail("");
        setMobilePhone("");
        setUserName(response.userData.USER_NAME);
        setVerificationToken(response.userData.VERIFICATION_TOKEN);
        setValidated(true);
      } else {
        showToast(response.message || "輸入的電子郵件或行動電話錯誤", "error");
      }
    } catch (error) {
      showToast("系統錯誤，請稍後再試", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sendResetPasswordEmail = async () => {
      if (validated) {
        try {
          const sendResetPasswordEmailResponse =
            await AuthService.sendResetPasswordEmail(
              reciptEmail,
              userName,
              verificationToken
            );
        } catch (error) {
          console.log("重發驗證郵件失敗:", error);
        }
      }
    };
    sendResetPasswordEmail();
  }, [validated]);

  return (
    <>
      <div className="auth_registerContainer">
        <div className="container text-center">
          <h1 className="pt-3 d-block">重設密碼</h1>
          <div className="row">
            <div className="col">
              <span className="fw-bold">
                在下方輸入您註冊時的電子郵件及行動電話
              </span>
              <br />
              <span className="fw-bold">即可收到更改密碼的電子郵件</span>
              <form
                action=""
                className="form d-flex flex-column align-items-center mt-3"
                onSubmit={handleSubmit}
                // onReset={handleReset}
                aria-label="重設密碼表單"
              >
                <input
                  type="email"
                  placeholder="電子郵件"
                  className="form-control w-50"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setReciptEmail(e.target.value);
                  }}
                  value={email}
                  required
                  aria-label="電子郵件"
                  tabIndex={0}
                />
                <input
                  type="tel"
                  placeholder="行動電話"
                  className="form-control w-50 mt-3"
                  onChange={(e) => setMobilePhone(e.target.value)}
                  value={mobilePhone}
                  required
                  aria-label="行動電話"
                  tabIndex={0}
                />
                <button
                  className="btn btn-danger mt-3 w-50"
                  type="submit"
                  disabled={loading}
                  aria-label="送出"
                  tabIndex={0}
                >
                  {loading ? "送出中..." : "送出"}
                </button>
                <button
                  className="btn btn-primary mt-3 w-50 mb-3"
                  type="reset"
                  aria-label="取消"
                  disabled={loading}
                  tabIndex={0}
                >
                  取消
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
