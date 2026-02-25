"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { useToast } from "@/hooks/useToast";
import AuthService from "@/services/authService";

export default function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const params = use(searchParams) as {
    email: string;
    userName: string;
    token: string;
  };

  const email = params.email || "";
  const token = params.token || "";
  const userName = params.userName || "";

  const [loading, setLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<
    "validating" | "valid" | "invalid" | null
  >(null);

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
          setTokenStatus("valid");
        } else {
          setTokenStatus("invalid");
          showToast(result.message || "驗證失敗，請稍後再試", "error");
        }
      } catch (error) {
        console.error("Token驗證錯誤:", error);
        setTokenStatus("invalid");
      }
    };

    validateToken();
  }, [email, token]);

  // 驗證失敗導回登入頁面
  useEffect(() => {
    if (tokenStatus === "invalid") {
      // 設定延遲，先顯示錯誤信息再跳轉
      const timer = setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [tokenStatus, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{
    password: string;
    confirmPassword: string;
  }>({
    mode: "onBlur",
  });

  const password_check = watch("password");

  // 表單提交處理函數
  const onSubmit: SubmitHandler<{
    password: string;
    confirmPassword: string;
  }> = async (data) => {
    setLoading(true);
    try {
      // 在這裡添加 API 提交邏輯
      const result = await AuthService.resetPassword(email, data.password);
      if (result.success) {
        showToast(
          result.message || "密碼已重設，請已修改後的密碼登入",
          "success"
        );
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        showToast(result.message || "密碼重設失敗，請稍後再試", "error");
      }
    } catch (error) {
      console.error("重設密碼錯誤:", error);
    } finally {
      setLoading(false);
    }
  };

  // 驗證失敗畫面
  if (tokenStatus === "invalid") {
    return (
      <>
        <div className="auth_registerContainer">
          <div className="container text-center p-5">
            <div className="alert alert-danger">
              <i className="fa-solid fa-exclamation-triangle me-2"></i>
              無效的驗證連結，正在返回登入頁面...
            </div>
          </div>
        </div>
      </>
    );
  }

  //驗證中畫面
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
      <div className="auth_registerContainer">
        <div className="container">
          <h1 className="text-center pt-3">重設密碼</h1>
          <div className="row">
            <div className="col-12 d-flex justify-content-center">
              <form className="w-50" onSubmit={handleSubmit(onSubmit)}>
                <label
                  htmlFor="password"
                  className="form-label text-start"
                  style={{ fontSize: "14px" }}
                >
                  密碼 <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  style={{ marginTop: "-5px" }}
                  id="password"
                  placeholder="請輸入密碼"
                  {...register("password", {
                    required: "密碼為必填欄位",
                    minLength: {
                      value: 8, // 密碼最小長度
                      message: "密碼長度至少需要 8 個字元",
                    },
                    validate: {
                      containsLetter: (value) =>
                        /[A-Za-z]/.test(value) ||
                        "密碼必須包含至少一個英文字母",
                      containsNumber: (value) =>
                        /[0-9]/.test(value) || "密碼必須包含至少一個數字",
                    },
                  })}
                />
                {errors.password && (
                  <div className="invalid-feedback w-100">
                    {errors.password.message}
                  </div>
                )}

                <label
                  htmlFor="confirmPassword"
                  className="form-label mt-3"
                  style={{ fontSize: "14px" }}
                >
                  確認密碼 <span className="text-danger">*</span>
                </label>

                <input
                  type="password"
                  className={`form-control ${
                    errors.confirmPassword ? "is-invalid" : ""
                  }`}
                  style={{ marginTop: "-5px" }}
                  placeholder="確認密碼"
                  id="confirmPassword"
                  {...register("confirmPassword", {
                    required: "確認密碼為必填欄位",
                    validate: (value) =>
                      value === password_check || "兩次輸入的密碼不一致", // 驗證密碼是否一致
                  })}
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">
                    {errors.confirmPassword.message}
                  </div>
                )}

                <button
                  className="btn btn-primary my-3 w-100"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    </>
                  ) : (
                    "重設密碼"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
