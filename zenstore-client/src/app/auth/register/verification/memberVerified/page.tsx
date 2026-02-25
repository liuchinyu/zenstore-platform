"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthService from "@/services/authService";

export default function MemberVerified() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 從 URL 參數中取得值
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const userName = searchParams.get("userName") || "";

  // 驗證狀態
  const [tokenStatus, setTokenStatus] = useState<
    "validating" | "valid" | "invalid" | null
  >(null);
  const [resendStatus, setResendStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  useEffect(() => {
    if (!email || !token) {
      setTokenStatus("invalid");
      return;
    }

    // 驗證token有效性
    const validateToken = async () => {
      setTokenStatus("validating");
      try {
        const result = await AuthService.validateVerificationToken(
          email,
          token,
          userName
        );

        if (result.success) {
          const isVerified = await AuthService.memberVerified(email);
          if (isVerified) {
            setTokenStatus("valid");
          }
        } else {
          setTokenStatus("invalid");
        }
      } catch (error) {
        console.error("Token驗證錯誤:", error);
        setTokenStatus("invalid");
      }
    };

    validateToken();
  }, [email, token, userName]);

  // 如果token無效，導回註冊頁面；成功就跳轉登入頁面
  useEffect(() => {
    if (tokenStatus === "invalid") {
      // 設定延遲，先顯示錯誤信息再跳轉
      const timer = setTimeout(() => {
        router.push("/auth/register");
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (tokenStatus === "valid") {
      const timer = setTimeout(() => {
        router.push("/auth/login");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [tokenStatus, router]);

  if (tokenStatus === "invalid") {
    return (
      <>
        <div className="auth_registerContainer">
          <div className="container text-center p-5">
            <div className="alert alert-danger">
              <i className="fa-solid fa-exclamation-triangle me-2"></i>
              無效的驗證連結，正在返回註冊頁面...
            </div>
          </div>
        </div>
      </>
    );
  }

  if (tokenStatus === "validating" || tokenStatus === null) {
    return (
      <>
        <div className="auth_registerContainer">
          <div className="container text-center p-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">正在驗證...</span>
            </div>
            <p className="mt-3">正在驗證您的身份...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="auth_successContainer">
        <div className="container" style={{ fontSize: "18px" }}>
          <div className="container text-center p-5 ">
            <div>
              <h2 className="h5">
                <i className="fa-solid fa-check-circle me-2"></i>
                驗證成功，即將跳轉登入頁面
              </h2>
              <div className="h6 mt-3">
                請稍後...若尚未完成跳轉，請點擊下方連結
              </div>
              <a href="/auth/login" className="btn btn-primary mt-3">
                登入頁面
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
