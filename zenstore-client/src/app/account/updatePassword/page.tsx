"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { useAppSelector } from "@/hooks/redux";
import AuthService from "@/services/authService";
import { useToast } from "@/hooks/useToast";

export default function UpdatePassword() {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<{
    originPassword: string;
    password: string;
    confirmPassword: string;
  }>({
    mode: "onBlur",
  });

  const [loading, setLoading] = useState(false);
  const email = useAppSelector((state) => state.auth?.user?.EMAIL); // 只訂閱 EMAIL
  const { showToast } = useToast();

  const onSubmit: SubmitHandler<{
    originPassword: string;
    password: string;
    confirmPassword: string;
  }> = async (data) => {
    if (loading) return;
    setLoading(true);
    try {
      const checkResult = await AuthService.checkPassword(
        email,
        data.originPassword
      );
      if (!checkResult.success) {
        showToast(
          checkResult.message || "原密碼錯誤，請確認輸入密碼是否正確",
          "error"
        );
        return;
      }
      const result = await AuthService.resetPassword(email, data.password);
      showToast(
        result.success
          ? "密碼已重設，請以修改後的密碼登入"
          : result.message || "密碼重設失敗，請稍後再試",
        result.success ? "success" : "error"
      );
    } catch (error) {
      console.error("重設密碼錯誤:", error);
      showToast("重設密碼失敗，請稍後再試", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth_registerContainer">
        <div className="container">
          <h1 className="text-center pt-3">重設密碼</h1>
          <div className="row">
            <div className="col-12 d-flex justify-content-center">
              <form
                className="auth_forgetForm"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <label
                  htmlFor="originPassword"
                  className="form-label text-start"
                >
                  原密碼 <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${
                    errors.originPassword ? "is-invalid" : ""
                  }`}
                  id="originPassword"
                  placeholder="請輸入原密碼"
                  {...register("originPassword", {
                    required: "密碼為必填欄位",
                  })}
                />

                <label
                  htmlFor="password"
                  className="form-label text-start mt-3"
                >
                  新密碼 <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  id="password"
                  placeholder="請輸入密碼"
                  {...register("password", {
                    required: "密碼為必填欄位",
                    minLength: {
                      value: 8,
                      message: "密碼長度至少需要 8 個字元",
                    },
                    validate: {
                      containsLetter: (v) =>
                        /[A-Za-z]/.test(v) || "密碼必須包含至少一個英文字母",
                      containsNumber: (v) =>
                        /[0-9]/.test(v) || "密碼必須包含至少一個數字",
                    },
                  })}
                />
                {errors.password && (
                  <div className="invalid-feedback w-100">
                    {errors.password.message}
                  </div>
                )}

                <label htmlFor="confirmPassword" className="form-label mt-3">
                  確認密碼 <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${
                    errors.confirmPassword ? "is-invalid" : ""
                  }`}
                  placeholder="確認密碼"
                  id="confirmPassword"
                  {...register("confirmPassword", {
                    required: "確認密碼為必填欄位",
                    validate: (value) =>
                      value === getValues("password") || "兩次輸入的密碼不一致",
                  })}
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">
                    {errors.confirmPassword.message}
                  </div>
                )}

                <button
                  className="btn btn-primary my-3 w-100 mb-4"
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
