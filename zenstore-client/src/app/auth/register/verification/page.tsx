"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthService from "@/services/authService";

export default function Verification() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 從 URL 參數中取得值
  const email = searchParams.get("email") || "";
  const verificationToken = searchParams.get("verificationToken") || "";
  const userName = searchParams.get("userName") || "";

  // 驗證狀態
  const [tokenStatus, setTokenStatus] = useState<
    "validating" | "valid" | "invalid" | null
  >(null);
  const [resendStatus, setResendStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const validationRef = useRef(false);

  // 在組件掛載時驗證token
  useEffect(() => {
    if (!email || !verificationToken) {
      setTokenStatus("invalid");
      return;
    }

    if (validationRef.current) {
      return;
    }
    validationRef.current = true;
    // 驗證token有效性
    const validateToken = async () => {
      setTokenStatus("validating");
      try {
        const result = await AuthService.validateVerificationToken(
          email,
          verificationToken,
          userName
        );

        if (result.success) {
          setTokenStatus("valid");
          await AuthService.resendVerificationEmail(
            email,
            userName,
            verificationToken
          );
        } else {
          setTokenStatus("invalid");
          validationRef.current = false;
        }
      } catch (error) {
        console.error("Token驗證錯誤:", error);
        setTokenStatus("invalid");
      }
    };

    validateToken();
  }, [email, verificationToken, userName]);

  // 如果token無效，導回註冊頁面
  useEffect(() => {
    if (tokenStatus === "invalid") {
      // 可以設定延遲，先顯示錯誤信息再跳轉
      const timer = setTimeout(() => {
        router.push("/auth/register");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [tokenStatus, router]);

  // 重新發送驗證郵件
  const handleResendEmail = async () => {
    if (!email) return;

    setResendStatus("sending");
    try {
      const result = await AuthService.resendVerificationEmail(
        email,
        userName,
        verificationToken
      );

      if (result.success) {
        setResendStatus("success");
      } else {
        setResendStatus("error");
      }
    } catch (error) {
      console.error("重發驗證郵件錯誤:", error);
      setResendStatus("error");
    }
  };

  // 將所有內容包裝成 content 變數，Header/Footer 只渲染一次
  let content = null;

  if (tokenStatus === "invalid") {
    content = (
      <div className="auth_registerContainer">
        <div className="container text-center p-5">
          <div className="alert alert-danger">
            <i className="fa-solid fa-exclamation-triangle me-2"></i>
            無效的驗證連結，正在返回註冊頁面...
          </div>
        </div>
      </div>
    );
  } else if (tokenStatus === "validating" || tokenStatus === null) {
    content = (
      <div className="auth_registerContainer">
        <div className="container text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">正在驗證...</span>
          </div>
          <p className="mt-3">正在驗證您的身份...</p>
        </div>
      </div>
    );
  } else if (resendStatus === "sending") {
    content = (
      <div className="auth_registerContainer">
        <div className="container text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">正在重新發送驗證郵件...</span>
          </div>
          <p className="mt-3">正在重新發送驗證郵件...</p>
        </div>
      </div>
    );
  } else if (resendStatus === "success") {
    content = (
      <div className="auth_successContainer">
        <div className="container text-center p-5">
          <div className="">
            <h2 className="h5">
              <i className="fa-solid fa-check-circle me-2"></i>
              郵件已重新發送成功
            </h2>
            <div className="h6 mt-3">若尚未收到驗證信，請點擊下方連結</div>
            <button
              onClick={handleResendEmail}
              className="btn btn-primary text-white mt-2 "
            >
              重新傳送驗證電郵
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="auth_registerContainer">
        <div className="container" style={{ fontSize: "18px" }}>
          <div className="row text-center">
            <div className="col-12 d-flex justify-content-center">
              <div className="d-flex justify-content-center align-items-center w-80">
                <i
                  className="fa-solid fa-exclamation fa-3x me-4"
                  style={{ color: "#da0b0b" }}
                ></i>
                <div className="text-start fw-bold mt-4 ">
                  <p>若要完成註冊，需於三天內進行驗證</p>
                  <p>請確認您的電郵信箱: {email}</p>
                </div>
              </div>
            </div>
            <div className="col-12 d-flex justify-content-center mt-3 fw-bold">
              <ul className="text-start">
                <li style={{ listStyle: "none" }}>貼心提醒</li>
                <li>請至信箱收取驗證信</li>
                <li>檢查您的垃圾郵件或垃圾文件夾以查看驗證信</li>
                <li>若要重新傳送電郵，請點擊下方連結</li>
                <button
                  onClick={handleResendEmail}
                  className="btn btn-primary text-white mt-2 "
                >
                  重新傳送驗證電郵
                </button>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{content}</>;
}
