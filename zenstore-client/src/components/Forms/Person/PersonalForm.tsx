"use client";
// for 個人註冊表單
import { useForm, SubmitHandler } from "react-hook-form";
import { useEffect, useState } from "react";
import LoadingLink from "@/components/LoadingLink/LoadingLink";
import AuthService from "@/services/authService";
import FormModal from "@/components/FormModal/FormModal";

// 定義表單資料的型別
interface PersonalFormData {
  MEMBER_TYPE: string;
  USER_NAME: string;
  MOBILE_PHONE: string;
  EMAIL: string;
  PASSWORD_HASH: string;
  confirmPassword: string;
  agreeTerms: boolean;
  VERIFICATION_TOKEN: string;
}

export default function PersonalForm() {
  const [formError, setFormError] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [registerSuccess, setRegisterSuccess] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [verificationToken, setVerificationToken] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  // 設定錯誤訊息計時器
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (formError) {
      timer = setTimeout(() => {
        setFormError(null);
      }, 4000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [formError]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PersonalFormData>({
    mode: "onBlur", // 在欄位失去焦點時觸發驗證
  });

  // 監聽密碼欄位以進行確認密碼的比對
  const password = watch("PASSWORD_HASH");

  const handleModalClose = () => {
    setModalMessage(""); // 清空 modalMessage，這樣下次才能觸發相同的消息
  };

  const handleErrorMessageClose = () => {
    setFormError(null);
  };
  // 表單提交處理函數
  const onSubmit: SubmitHandler<PersonalFormData> = async (data) => {
    setFormError(null);
    setLoading(true);

    try {
      data.MEMBER_TYPE = "個人會員";
      // 在這裡添加 API 提交邏輯
      const result = await AuthService.register(data);

      // 使用類型保護來檢查返回類型
      // 成功的 Axios 響應
      if ("data" in result) {
        setRegisterSuccess(true);
        setModalMessage("註冊成功");
        setEmail(data.EMAIL);
        setVerificationToken(result.data.verificationToken);
        setUserName(data.USER_NAME);
      }

      // 錯誤返回
      else if ("message" in result) {
        setFormError(result.errors || "註冊失敗，請稍後再試");
        setModalMessage("註冊失敗");
      }
    } catch (error) {
      setFormError(["系統發生錯誤，請稍後再試"]);
      console.error("註冊處理錯誤:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    // 使用 react-hook-form 的 handleSubmit 來處理表單提交
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* --- 姓名 --- */}

        <div className="form-group mt-2">
          <label
            htmlFor="name"
            className="form-label"
            style={{ fontSize: "14px" }}
          >
            姓名 <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.USER_NAME ? "is-invalid" : ""}`}
            style={{ marginTop: "-5px" }}
            id="USER_NAME"
            // 使用 register 來註冊欄位，並添加驗證規則
            {...register("USER_NAME", { required: "姓名為必填欄位" })}
          />
          {/* 顯示驗證錯誤訊息 */}
          {errors.USER_NAME && (
            <div className="invalid-feedback">{errors.USER_NAME.message}</div>
          )}
        </div>

        {/* --- 行動電話 --- */}
        <div className="form-group mt-2">
          <label
            htmlFor="phone"
            className="form-label"
            style={{ fontSize: "14px" }}
          >
            行動電話 <span className="text-danger">*</span>
          </label>
          <input
            type="tel"
            className={`form-control ${
              errors.MOBILE_PHONE ? "is-invalid" : ""
            }`}
            style={{ marginTop: "-5px" }}
            id="MOBILE_PHONE"
            {...register("MOBILE_PHONE", {
              required: "行動電話為必填欄位",
              pattern: {
                value: /^09\d{8}$/, // 台灣手機號碼格式
                message: "請輸入有效的台灣行動電話號碼 (例如 09xxxxxxxx)",
              },
            })}
          />
          {errors.MOBILE_PHONE && (
            <div className="invalid-feedback">
              {errors.MOBILE_PHONE.message}
            </div>
          )}
        </div>

        {/* --- 電子信箱 --- */}
        <div className="form-group mt-2">
          <label
            htmlFor="email"
            className="form-label"
            style={{ fontSize: "14px" }}
          >
            電子信箱 <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            className={`form-control ${errors.EMAIL ? "is-invalid" : ""}`}
            style={{ marginTop: "-5px" }}
            id="EMAIL"
            {...register("EMAIL", {
              required: "電子信箱為必填欄位",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "請輸入有效的電子信箱格式",
              },
            })}
          />
          {errors.EMAIL && (
            <div className="invalid-feedback">{errors.EMAIL.message}</div>
          )}
        </div>

        {/* --- 密碼 --- */}
        <div className="form-group mt-2">
          <label
            htmlFor="password"
            className="form-label"
            style={{ fontSize: "14px" }}
          >
            密碼 <span className="text-danger">*</span>
          </label>
          <input
            type="password"
            className={`form-control ${
              errors.PASSWORD_HASH ? "is-invalid" : ""
            }`}
            style={{ marginTop: "-5px" }}
            id="PASSWORD_HASH"
            {...register("PASSWORD_HASH", {
              required: "密碼為必填欄位",
              minLength: {
                value: 8, // 密碼最小長度
                message: "密碼長度至少需要 8 個字元",
              },
              validate: {
                containsLetter: (value) =>
                  /[A-Za-z]/.test(value) || "密碼必須包含至少一個英文字母",
                containsNumber: (value) =>
                  /[0-9]/.test(value) || "密碼必須包含至少一個數字",
              },
            })}
          />
          {errors.PASSWORD_HASH && (
            <div className="invalid-feedback">
              {errors.PASSWORD_HASH.message}
            </div>
          )}
        </div>

        {/* --- 確認密碼 --- */}
        <div className="form-group mt-2 mb-2">
          <label
            htmlFor="confirmPassword"
            className="form-label"
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
            id="confirmPassword"
            {...register("confirmPassword", {
              required: "確認密碼為必填欄位",
              validate: (value) => value === password || "兩次輸入的密碼不一致", // 驗證密碼是否一致
            })}
          />
          {errors.confirmPassword && (
            <div className="invalid-feedback">
              {errors.confirmPassword.message}
            </div>
          )}
        </div>

        {/* --- 同意條款 Checkbox --- */}
        <div className="form-check mb-3 ms-1">
          <input
            type="checkbox"
            className={`form-check-input ${
              errors.agreeTerms ? "is-invalid" : ""
            }`}
            id="agreeTerms"
            {...register("agreeTerms", {
              required: "您必須同意會員條款及隱私權政策",
            })}
          />
          <label
            htmlFor="agreeTerms"
            className="form-check-label"
            style={{ fontSize: "14px" }}
          >
            我已閱讀並同意貴公司的{" "}
            <LoadingLink
              href="/terms"
              target="_blank"
              className="text-decoration-none text-primary"
            >
              會員條款
            </LoadingLink>
            及
            <LoadingLink
              href="/privacy"
              target="_blank"
              className="text-decoration-none text-primary"
            >
              隱私權政策
            </LoadingLink>
            <span className="text-danger"> *</span>
          </label>
          {errors.agreeTerms && (
            <div className="invalid-feedback d-block">
              {errors.agreeTerms.message}
            </div>
          )}
        </div>

        {/* --- 註冊按鈕 --- */}
        <div className="d-flex justify-content-center mb-3">
          <button
            className="btn text-white text-center w-50" // 稍微加寬按鈕
            style={{ backgroundColor: "#ff9900" }}
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
              "註冊個人會員"
            )}
          </button>
        </div>
      </form>
      {formError &&
        formError.map((error, index) => (
          <div
            className="alert alert-danger w-100 d-flex"
            role="alert"
            key={index}
          >
            {error}
            <button
              type="button"
              className="btn-close ms-auto"
              aria-label="Close"
              onClick={handleErrorMessageClose}
            ></button>
          </div>
        ))}
      {registerSuccess && (
        <>
          <div className="alert alert-success" role="alert">
            註冊成功！請前往您的電子郵件信箱進行驗證。
          </div>
          <FormModal
            title="註冊成功"
            message="註冊成功！請前往您的電子郵件信箱進行驗證。"
            email={email}
            verificationToken={verificationToken}
            userName={userName}
            onClose={handleModalClose}
          />
        </>
      )}
    </>
  );
}
