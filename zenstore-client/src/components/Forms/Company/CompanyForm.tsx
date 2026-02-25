"use client";
// for 公司註冊表單
import { useForm, SubmitHandler } from "react-hook-form";
import { useEffect, useState } from "react";
import LoadingLink from "@/components/LoadingLink/LoadingLink";
import AuthService from "@/services/authService";
import FormModal from "@/components/FormModal/FormModal";

interface CompanyFormData {
  MEMBER_TYPE: string;
  USER_NAME: string;
  MOBILE_PHONE: string;
  EMAIL: string;
  PASSWORD_HASH: string;
  confirmPassword: string;
  agreeTerms: boolean;
  COMPANY_NAME: string;
  TAX_ID: string;
  JOB_TITLE: string;
  INDUSTRY_TYPE: string;
  OTHER_INDUSTRY_NAME?: string;
  VERIFICATION_TOKEN: string;
}

export default function CompanyForm() {
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
  } = useForm<CompanyFormData>({
    mode: "onBlur",
  });

  const password = watch("PASSWORD_HASH");

  const handleModalClose = () => {
    setModalMessage(""); // 清空 modalMessage，這樣下次才能觸發相同的消息
  };

  const handleErrorMessageClose = () => {
    setFormError(null);
  };

  const onSubmit: SubmitHandler<CompanyFormData> = async (data) => {
    setFormError(null);
    setLoading(true);

    try {
      data.MEMBER_TYPE = "企業會員";
      // 在這裡添加 API 提交邏輯

      if (Array.isArray(data.INDUSTRY_TYPE)) {
        data.INDUSTRY_TYPE = data.INDUSTRY_TYPE.join(",");
      }
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
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group mt-2 w-100 d-flex justify-content-between">
          <div className="companyForm">
            <label
              htmlFor="name"
              className="form-label"
              style={{ fontSize: "14px" }}
            >
              姓名 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control w-100 ${
                errors.USER_NAME ? "is-invalid" : ""
              }`}
              style={{ marginTop: "-5px" }}
              id="name"
              {...register("USER_NAME", { required: "姓名為必填欄位" })}
            />
            {errors.USER_NAME && (
              <div className="invalid-feedback">{errors.USER_NAME.message}</div>
            )}
          </div>
          <div className="companyForm">
            <label
              htmlFor="COMPANY_NAME"
              className="form-label"
              style={{ fontSize: "14px" }}
            >
              公司抬頭 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${
                errors.COMPANY_NAME ? "is-invalid" : ""
              }`}
              style={{ marginTop: "-5px" }}
              id="COMPANY_NAME"
              {...register("COMPANY_NAME", {
                required: "公司抬頭為必填欄位",
              })}
            />
            {errors.COMPANY_NAME && (
              <div className="invalid-feedback">
                {errors.COMPANY_NAME.message}
              </div>
            )}
          </div>
        </div>

        <div className="form-group mt-2 w-100 d-flex justify-content-between">
          <div className="companyForm">
            <label
              htmlFor="phone"
              className="form-label"
              style={{ fontSize: "14px" }}
            >
              行動電話 <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              className={`form-control w-100 ${
                errors.MOBILE_PHONE ? "is-invalid" : ""
              }`}
              style={{ marginTop: "-5px" }}
              id="MOBILE_PHONE"
              {...register("MOBILE_PHONE", {
                required: "行動電話為必填欄位",
                pattern: {
                  value: /^09\d{8}$/,
                  message: "請輸入有效的台灣行動電話號碼",
                },
              })}
            />
            {errors.MOBILE_PHONE && (
              <div className="invalid-feedback">
                {errors.MOBILE_PHONE.message}
              </div>
            )}
          </div>
          <div className="companyForm">
            <label
              htmlFor="TAX_ID"
              className="form-label"
              style={{ fontSize: "14px" }}
            >
              統一編號 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.TAX_ID ? "is-invalid" : ""}`}
              style={{ marginTop: "-5px" }}
              id="TAX_ID"
              maxLength={8}
              {...register("TAX_ID", {
                required: "統一編號為必填欄位",
                pattern: {
                  value: /^\d{8}$/,
                  message: "請輸入 8 位數字的統一編號",
                },
              })}
            />
            {errors.TAX_ID && (
              <div className="invalid-feedback">{errors.TAX_ID.message}</div>
            )}
          </div>
        </div>

        <div className="form-group mt-2 w-100 d-flex justify-content-between">
          <div className="companyForm">
            <label
              htmlFor="EMAIL"
              className="form-label"
              style={{ fontSize: "14px" }}
            >
              電子信箱 <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className={`form-control w-100 ${
                errors.EMAIL ? "is-invalid" : ""
              }`}
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

            <label
              htmlFor="PASSWORD_HASH"
              className="form-label"
              style={{ fontSize: "14px" }}
            >
              密碼 <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              className={`form-control w-100 ${
                errors.PASSWORD_HASH ? "is-invalid" : ""
              }`}
              style={{ marginTop: "-5px" }}
              id="PASSWORD_HASH"
              {...register("PASSWORD_HASH", {
                required: "密碼為必填欄位",
                minLength: {
                  value: 8,
                  message: "密碼長度至少需要 8 個字元",
                },
                validate: {
                  containsLetter: (value) =>
                    /[A-Za-z]/.test(value) || "密碼必須包含至少一個英文字母",
                  containsNumber: (value) =>
                    /[0-9]/.test(value) || "密碼必須包含一個數字",
                },
              })}
            />
            {errors.PASSWORD_HASH && (
              <div className="invalid-feedback">
                {errors.PASSWORD_HASH.message}
              </div>
            )}
          </div>
          <div className="companyForm">
            <label
              htmlFor="INDUSTRY_TYPE"
              className="form-label"
              style={{ fontSize: "14px" }}
            >
              公司行業別 <span className="text-danger">*</span>
            </label>
            <div
              className="checkbox-group d-flex flex-wrap"
              style={{ fontSize: "14px" }}
            >
              {["同行", "貿易商", "製造商", "研發/設計"].map((type) => (
                <label key={type} className="me-2">
                  <input
                    type="checkbox"
                    className={`form-check-input ${
                      errors.INDUSTRY_TYPE ? "is-invalid" : ""
                    }`}
                    value={type}
                    {...register("INDUSTRY_TYPE", {
                      required: "請至少選擇一個公司行業別",
                    })}
                  />
                  {type}
                </label>
              ))}
              <label>
                <input
                  type="checkbox"
                  className={`form-check-input ${
                    errors.INDUSTRY_TYPE ? "is-invalid" : ""
                  }`}
                  value="其他"
                  {...register("INDUSTRY_TYPE")}
                />
                其他:
                <input
                  type="text"
                  className="form-control"
                  style={{ height: "1.75rem" }}
                  {...register("OTHER_INDUSTRY_NAME")}
                />
              </label>
            </div>
            {errors.INDUSTRY_TYPE && (
              <div className="text-danger" style={{ fontSize: "0.875em" }}>
                {errors.INDUSTRY_TYPE.message}
              </div>
            )}
          </div>
        </div>

        <div className="form-group mt-2 w-100 d-flex justify-content-between mb-2">
          <div className="companyForm">
            <label
              htmlFor="confirmPassword"
              className="form-label"
              style={{ fontSize: "14px" }}
            >
              確認密碼 <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              className={`form-control w-100 ${
                errors.confirmPassword ? "is-invalid" : ""
              }`}
              style={{ marginTop: "-5px" }}
              id="confirmPassword"
              {...register("confirmPassword", {
                required: "確認密碼為必填欄位",
                validate: (value) =>
                  value === password || "兩次輸入的密碼不一致",
              })}
            />
            {errors.confirmPassword && (
              <div className="invalid-feedback">
                {errors.confirmPassword.message}
              </div>
            )}
          </div>
          <div className="companyForm">
            <label
              htmlFor="JOB_TITLE"
              className="form-label"
              style={{ fontSize: "14px" }}
            >
              職稱 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.JOB_TITLE ? "is-invalid" : ""}`}
              style={{ marginTop: "-5px" }}
              id="JOB_TITLE"
              {...register("JOB_TITLE", { required: "職稱為必填欄位" })}
            />
            {errors.JOB_TITLE && (
              <div className="invalid-feedback">{errors.JOB_TITLE.message}</div>
            )}
          </div>
        </div>

        {/* 同意條款 Checkbox */}
        <div className="form-check mb-3 ms-1">
          <input
            type="checkbox"
            className={`form-check-input ${
              errors.agreeTerms ? "is-invalid" : ""
            }`}
            id="agreeTermsCompany"
            {...register("agreeTerms", {
              required: "您必須同意會員條款及隱私權政策",
            })}
          />
          <label
            htmlFor="agreeTermsCompany"
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
            </LoadingLink>{" "}
            及{" "}
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

        {/* 註冊按鈕 */}
        <div className="d-flex justify-content-center mb-3">
          <button
            className="btn text-white text-center w-50"
            style={{ backgroundColor: "#ff9900" }}
            type="submit"
          >
            註冊企業會員
          </button>
        </div>
      </form>
      {formError &&
        formError.length > 0 &&
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
