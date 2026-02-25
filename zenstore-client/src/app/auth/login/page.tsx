"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { login, setIsAuthenticated } from "@/store/authSlice";
import AuthService from "@/services/authService";
import { useToast } from "@/hooks/useToast";

// 定義 Toast 類型
type ToastType = "success" | "error" | "warning" | "info";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  // ✅ 從 Redux 讀取持久化的登入狀態
  const { showToast } = useToast();

  // ✅ 檢查登入狀態（使用 Redux 持久化資料，無需 API 請求）
  useEffect(() => {
    const checkAuthStatus = async () => {
      const response = await AuthService.getCurrentUser();
      if (response.success) {
        showToast("您已經完成登入，將為您導向至平台首頁！", "success");
        dispatch(setIsAuthenticated(true));
        setTimeout(() => {
          router.replace("/");
        }, 3000);
      }
    };
    checkAuthStatus();
  }, []);

  // 處理 URL 參數中的 Toast 訊息
  useEffect(() => {
    const toastMessage = searchParams.get("toast");
    const toastType = (searchParams.get("toastType") || "info") as ToastType;

    if (toastMessage) {
      showToast(toastMessage, toastType);
    }
  }, [searchParams]);

  // 處理登入表單提交
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 驗證必填欄位
    if (!email || !password) {
      showToast("請填寫所有必填欄位", "error");
      return;
    }

    setLoading(true);

    try {
      const result = await dispatch(login({ email, password })).unwrap();

      // 處理登入成功（完全驗證）
      if (result.data?.success === true) {
        showToast("登入成功！" + result.message, "success");
        router.replace("/");
        return;
      }
      // 處理登入成功但未驗證信箱
      else if (result.data?.success === "almost") {
        showToast("登入成功，尚未驗證信箱，即將跳轉至驗證頁面", "warning");
        setTimeout(() => {
          router.push(
            `/auth/register/verification?email=${email}&verificationToken=${result.data.token}&userName=${result.data.userName}`,
          );
        }, 3000);
        return;
      }
      // 處理登入失敗
      else {
        showToast(
          result.message || "登入失敗，請檢查您的 Email 和密碼",
          "error",
        );
      }
    } catch (error) {
      // 處理錯誤
      const errorMessage =
        error instanceof Error
          ? error.message
          : "登入失敗，請檢查您的郵箱和密碼";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth_registerContainer">
      <div className="container text-center">
        <div className="row mt-4">
          <div className="col-12">
            <h1 className="mt-4">登入 ZTStore</h1>
            <form
              onSubmit={handleSubmit}
              className="d-flex flex-column align-items-center"
            >
              {/* Email 欄位 */}
              <div className="form-group mt-4 w-50">
                <label htmlFor="email" className="visually-hidden">
                  電子郵件
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="電子郵件"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  aria-label="電子郵件"
                />
              </div>

              {/* 密碼欄位 */}
              <div className="form-group mt-4 w-50">
                <label htmlFor="password" className="visually-hidden">
                  密碼
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  aria-label="密碼"
                />
              </div>

              {/* 登入按鈕 */}
              <div className="form-group mt-4 w-50">
                <button
                  className="btn btn-danger d-block w-100"
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? "登入中..." : "登入"}
                </button>
              </div>

              {/* 忘記密碼連結 */}
              <div className="form-group mt-4 w-50">
                <Link
                  href="/auth/forgot-password"
                  className="fw-bold text-decoration-none"
                >
                  忘記密碼
                </Link>
              </div>

              <hr className="w-50 border-2" />

              {/* 註冊連結 */}
              <div className="form-group mt-4 w-50 mb-4">
                <p>沒有帳戶?</p>
                <Link href="/auth/register" className="btn btn-warning w-100">
                  立即註冊
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
