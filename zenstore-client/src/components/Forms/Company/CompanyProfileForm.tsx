// src/components/Forms/Company/CompanyProfileForm.tsx
// 企業會員表單資料
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import AuthService from "@/services/authService";
import { setCompanyData, setUser } from "@/store/authSlice";
import { taiwanRegions, citiesByRegion } from "@/utils/area";
import dynamic from "next/dynamic";
import { selectUser } from "@/store/selectors/authSelectors";
import { validateCompanyForm } from "@/utils/formValidation";
import {
  formatDateToString,
  getChangedFields,
  hasArrayChanged,
} from "@/utils/formHelpers";
import { useToast } from "@/hooks/useToast";

// 動態導入 DatePicker
const DatePickerWrapper = dynamic(
  () => import("@/components/DatePicker/DatePickerWrapper"),
  {
    ssr: false,
    loading: () => <div className="form-control">載入中...</div>,
  },
);

// 定義表單資料介面
interface CompanyFormData {
  // 個人基本資料
  name: string;
  mobilePhone: string;
  email: string;
  gender: string;
  birthday: Date | null;
  region: string;
  phone: string;
  city: string;
  address: string;
  // 公司基本資料
  companyName: string;
  taxid: string;
  jobTitle: string;
  companyIndustry: string[];
  otherCompanyIndustry: string;
}

// 定義表單狀態介面
interface CompanyFormState {
  loading: boolean;
  isInitialLoad: boolean;
  availableCities: string[];
}

// 定義表單錯誤介面
interface FormErrors {
  [key: string]: string;
}

const CompanyProfileForm = () => {
  const dispatch = useAppDispatch();

  // 使用 ref 儲存 companyData
  const companyDataRef = useRef<any>(null);
  const hasLoadedRef = useRef(false); // 用來標記是否已經載入過資料
  const user = useAppSelector(selectUser);
  const { showToast } = useToast();

  // 統一表單資料狀態
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    mobilePhone: "",
    email: "",
    gender: "",
    birthday: null,
    region: "",
    phone: "",
    city: "",
    address: "",
    companyName: "",
    taxid: "",
    jobTitle: "",
    companyIndustry: [],
    otherCompanyIndustry: "",
  });

  // 統一表單狀態管理
  const [formState, setFormState] = useState<CompanyFormState>({
    loading: false, //表單更新狀態
    isInitialLoad: true, //表單是否尚在載入中
    availableCities: [],
  });

  // 表單錯誤狀態
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // 優化：使用 useMemo 計算可用城市
  const memoizedAvailableCities = useMemo(() => {
    return formData.region ? citiesByRegion[formData.region] || [] : [];
  }, [formData.region]);

  // 載入用戶資料 - 只在必要時載入
  useEffect(() => {
    const fetchUserData = async () => {
      if (hasLoadedRef.current || !user?.MEMBER_ID) {
        return;
      }

      // 檢查 Redux 中是否已經有完整的用戶資料
      // const hasCompleteUserData =
      //   user?.USER_NAME && user?.MOBILE_PHONE && user?.EMAIL;

      // if (hasCompleteUserData) {
      hasLoadedRef.current = true;
      setFormState((prev) => ({
        ...prev,
        isInitialLoad: false,
      }));
      // return;
      // }

      try {
        const response = await AuthService.getUserData(user?.MEMBER_ID);
        console.log("user_response", response);

        if (response.success) {
          dispatch(setUser(response.data));
          hasLoadedRef.current = true;
          setFormState((prev) => ({
            ...prev,
          }));

          const timer = setTimeout(() => {
            setFormState((prev) => ({ ...prev, isInitialLoad: false }));
          }, 300);

          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error("載入用戶資料失敗:", error);
        showToast("載入用戶資料失敗", "error");
        setFormState((prev) => ({ ...prev, isInitialLoad: false }));
      }
    };

    fetchUserData();
  }, [user?.MEMBER_ID, dispatch]);

  // 優化：載入公司資料 - 使用 useCallback 和更好的錯誤處理
  const loadCompanyData = useCallback(async () => {
    if (!user?.MEMBER_ID || !hasLoadedRef.current) return;

    try {
      const companyData = await AuthService.getCompanyData(user?.MEMBER_ID);

      console.log("companyData", companyData);
      companyDataRef.current = companyData;

      if (
        companyData.success &&
        companyData.data.companyData.rows &&
        companyData.data.companyData.rows.length > 0
      ) {
        dispatch(setCompanyData(companyData.data.companyData.rows));

        // 設置表單值
        setFormData((prev) => ({
          ...prev,
          companyName: companyData.data.companyData.rows[0][0] || "",
          taxid: companyData.data.companyData.rows[0][1] || "",
          jobTitle: companyData.data.companyData.rows[0][2] || "",
        }));

        const industryString =
          companyData.data.companyIndustriesData.rows[0][0] || "";
        setFormData((prev) => ({
          ...prev,
          companyIndustry: industryString ? industryString.split(",") : [],
          otherCompanyIndustry:
            companyData.data.companyIndustriesData.rows[0][1] || "",
        }));
      }
    } catch (error) {
      console.error("載入公司資料失敗:", error);
      showToast("載入公司資料失敗", "error");
    }
  }, [user?.MEMBER_ID, dispatch]);

  console.log("formdata", formData);

  // 優化：更新表單值 - 使用 useCallback
  const updateFormValues = useCallback(() => {
    if (user?.MEMBER_ID && hasLoadedRef.current) {
      setFormData((prev) => ({
        ...prev,
        name: user?.USER_NAME || "",
        mobilePhone: user?.MOBILE_PHONE || "",
        email: user?.EMAIL || "",
        gender: user?.GENDER || "",
        birthday: user?.BIRTHDAY ? new Date(user?.BIRTHDAY) : null,
        jobTitle: user?.JOB_TITLE || "",
        region: user?.REGION || "",
        phone: user?.PHONE || "",
        city: user?.CITY || "",
        address: user?.ADDRESS || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    updateFormValues();
    loadCompanyData();
  }, [updateFormValues, loadCompanyData]);

  // 優化：處理表單變更 - 使用統一的狀態更新邏輯並清除錯誤
  const handleChange = useCallback(
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLSelectElement>,
    ) => {
      const { name, id, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;
      const fieldName = name || id;

      // 清除該欄位的錯誤訊息
      if (formErrors[fieldName]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }

      if (fieldName === "companyIndustry") {
        if (type === "checkbox") {
          setFormData((prev) => ({
            ...prev,
            companyIndustry: checked
              ? [...prev.companyIndustry, value]
              : prev.companyIndustry.filter((item) => item !== value),
          }));
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          [fieldName]: value,
        }));
      }
    },
    [formErrors],
  );

  // 優化：處理生日變更
  const handleBirthdayChange = useCallback((date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      birthday: date,
    }));
  }, []);

  // 優化：處理表單提交 - 整合驗證並使用 formHelpers 簡化邏輯
  const handleUpdate = useCallback(async () => {
    if (!user?.MEMBER_ID) return;

    // 1. 表單驗證
    const validation = validateCompanyForm({
      name: formData.name,
      mobilePhone: formData.mobilePhone,
      email: formData.email,
      companyName: formData.companyName,
      taxid: formData.taxid,
      jobTitle: formData.jobTitle,
      companyIndustry: formData.companyIndustry,
      otherCompanyIndustry: formData.otherCompanyIndustry,
      phone: formData.phone,
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      showToast("請檢查表單欄位是否填寫正確", "error");
      return;
    }

    // 清除所有錯誤
    setFormErrors({});
    setFormState((prev) => ({ ...prev, loading: true }));

    try {
      const originalCompanyData = companyDataRef.current;
      console.log("companyDataRef", companyDataRef);

      // 2. 使用 formHelpers 簡化用戶資料比對
      const formattedBirthday = formatDateToString(formData.birthday);

      const userFieldMap = {
        name: "USER_NAME",
        mobilePhone: "MOBILE_PHONE",
        gender: "GENDER",
        region: "REGION",
        phone: "PHONE",
        city: "CITY",
        address: "ADDRESS",
      };

      // 取得變動的欄位以及對應value
      const changedFields = getChangedFields(
        { ...formData, birthday: formattedBirthday },
        { ...user, birthday: user?.BIRTHDAY || "" },
        { ...userFieldMap, birthday: "BIRTHDAY" },
      );

      // 3. 簡化公司資料比對
      const changedCompanyData: any = {};
      const changedCompanyIndustries: any = {};

      if (
        companyDataRef.current?.success &&
        companyDataRef.current.data.companyData.rows &&
        companyDataRef.current.data.companyData.rows.length > 0
      ) {
        // 直接取得原始值
        const companyRow =
          originalCompanyData?.data?.companyData?.rows?.[0] || [];
        const industryRow =
          originalCompanyData?.data?.companyIndustriesData?.rows?.[0] || [];

        const originalCompanyName = companyRow[0] || "";
        const originalTaxId = companyRow[1] || "";
        const originalJobTitle = companyRow[2] || "";
        const originalIndustryString = industryRow[0] || "";
        const originalOtherIndustry = industryRow[1] || "";

        // 比對公司基本資料
        if (formData.companyName !== originalCompanyName) {
          changedCompanyData.COMPANY_NAME = formData.companyName;
        }
        if (formData.taxid !== originalTaxId) {
          changedCompanyData.TAX_ID = formData.taxid;
        }
        if (formData.jobTitle !== originalJobTitle) {
          changedCompanyData.JOB_TITLE = formData.jobTitle;
        }

        // 比對行業別
        if (hasArrayChanged(formData.companyIndustry, originalIndustryString)) {
          changedCompanyIndustries.INDUSTRY_TYPE =
            formData.companyIndustry.join(",");
        }

        if (
          formData.companyIndustry.includes("其他") &&
          formData.otherCompanyIndustry !== originalOtherIndustry
        ) {
          changedCompanyIndustries.OTHER_COMPANY_INDUSTRY =
            formData.otherCompanyIndustry;
        }
      }

      let isAnyFieldUpdated = false;
      const updatePromises: Promise<any>[] = [];

      // 並行處理所有更新
      if (Object.keys(changedFields).length > 0) {
        updatePromises.push(
          AuthService.updateUser(user?.MEMBER_ID, changedFields).then(
            (response) => {
              if (response.success) {
                isAnyFieldUpdated = true;
                return response;
              }
              throw new Error(response.message || "更新用戶資料失敗");
            },
          ),
        );
      }

      if (Object.keys(changedCompanyIndustries).length > 0) {
        updatePromises.push(
          AuthService.updateCompanyIndustries(
            user?.MEMBER_ID,
            changedCompanyIndustries,
          ).then((response) => {
            if (response.success) {
              isAnyFieldUpdated = true;
              return response;
            }
            throw new Error(response.message || "更新公司行業別失敗");
          }),
        );
      }

      if (Object.keys(changedCompanyData).length > 0) {
        updatePromises.push(
          AuthService.updateCompanyData(
            user?.MEMBER_ID,
            changedCompanyData,
          ).then((response) => {
            if (response.success) {
              isAnyFieldUpdated = true;
              return response;
            }
            throw new Error(response.message || "更新公司資料失敗");
          }),
        );
      }

      // 等待所有更新完成
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }

      if (isAnyFieldUpdated) {
        // 更新成功後重新載入資料
        const [userResponse, newCompanyData] = await Promise.all([
          AuthService.getUserData(user?.MEMBER_ID),
          AuthService.getCompanyData(user?.MEMBER_ID),
        ]);

        console.log("userResponse", userResponse);

        if (userResponse.success) {
          dispatch(setUser(userResponse.data));
        }
        if (newCompanyData.success) {
          companyDataRef.current = newCompanyData;
          if (
            newCompanyData.data.companyData.rows &&
            newCompanyData.data.companyData.rows.length > 0
          ) {
            dispatch(setCompanyData(newCompanyData.data.companyData.rows));
          }
        }

        showToast("會員資料更新成功", "success");
      } else {
        showToast("沒有資料需要更新", "info");
      }
    } catch (error) {
      console.error("更新資料時發生錯誤:", error);
      showToast(
        error instanceof Error ? error.message : "更新失敗，請稍後再試",
        "error",
      );
    } finally {
      setFormState((prev) => ({ ...prev, loading: false }));
    }
  }, [user, formData, dispatch]);

  // 優化：處理地區變更時更新可用城市列表
  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      availableCities: memoizedAvailableCities,
    }));

    if (formData.region && !memoizedAvailableCities.includes(formData.city)) {
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  }, [formData.region, formData.city, memoizedAvailableCities]);

  // 載入狀態處理
  if (formState.isInitialLoad) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "500px" }}
      >
        <div className="mb-4">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">載入中...</span>
          </div>
        </div>

        <div className="text-center">
          <h5 className="text-muted mb-3">載入企業會員資料中...</h5>
        </div>
      </div>
    );
  }

  return (
    <form className="auth_profileForm p-4">
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>個人基本資料</span>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="name" className="form-label">
                姓名<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  formErrors.name ? "is-invalid" : ""
                }`}
                onChange={handleChange}
                value={formData.name}
                id="name"
                name="name"
                required
                disabled={formState.loading}
              />
              {formErrors.name && (
                <div className="invalid-feedback d-block">
                  {formErrors.name}
                </div>
              )}
            </div>
            <div className="col-md-6">
              <label htmlFor="mobilePhone" className="form-label">
                行動電話<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  formErrors.mobilePhone ? "is-invalid" : ""
                }`}
                onChange={handleChange}
                value={formData.mobilePhone}
                id="mobilePhone"
                name="mobilePhone"
                required
                disabled={formState.loading}
              />
              {formErrors.mobilePhone && (
                <div className="invalid-feedback d-block">
                  {formErrors.mobilePhone}
                </div>
              )}
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="email" className="form-label">
                電子信箱<span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                onChange={handleChange}
                value={formData.email}
                id="email"
                name="email"
                disabled
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="gender" className="form-label">
                性別
              </label>
              <div className="d-flex">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="gender"
                    id="male"
                    onChange={handleChange}
                    value="男"
                    checked={formData.gender === "男"}
                    disabled={formState.loading}
                  />
                  <label className="form-check-label" htmlFor="male">
                    男
                  </label>
                </div>
                <div className="form-check ms-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="gender"
                    id="female"
                    onChange={handleChange}
                    value="女"
                    checked={formData.gender === "女"}
                    disabled={formState.loading}
                  />
                  <label className="form-check-label" htmlFor="female">
                    女
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="birthday" className="form-label d-block">
                生日
              </label>
              <DatePickerWrapper
                selected={formData.birthday}
                onChange={handleBirthdayChange}
                id="birthday"
                name="birthday"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="region" className="form-label">
                地區
              </label>
              <select
                className="form-select"
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                disabled={formState.loading}
              >
                <option value="">請選擇地區</option>
                {taiwanRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="city" className="form-label">
                城市
              </label>
              <select
                className="form-select"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!formData.region || formState.loading}
              >
                <option value="">請選擇城市</option>
                {formState.availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="address" className="form-label">
                收件地址
              </label>
              <input
                type="text"
                className="form-control"
                onChange={handleChange}
                value={formData.address}
                id="address"
                name="address"
                disabled={formState.loading}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>公司基本資料</span>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="companyName" className="form-label">
                公司抬頭<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  formErrors.companyName ? "is-invalid" : ""
                }`}
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                disabled={formState.loading}
              />
              {formErrors.companyName && (
                <div className="invalid-feedback d-block">
                  {formErrors.companyName}
                </div>
              )}
              <label htmlFor="taxid" className="form-label mt-2">
                統一編號<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  formErrors.taxid ? "is-invalid" : ""
                }`}
                id="taxid"
                name="taxid"
                onChange={handleChange}
                value={formData.taxid}
                required
                disabled={formState.loading}
              />
              {formErrors.taxid && (
                <div className="invalid-feedback d-block">
                  {formErrors.taxid}
                </div>
              )}
            </div>
            <div className="col-md-6">
              <label htmlFor="companyIndustry" className="form-label d-block">
                公司行業別<span className="text-danger">*</span>
              </label>
              <div className="checkbox-group d-flex flex-wrap">
                {["同行", "貿易商", "製造商", "研發/設計"].map((type) => (
                  <label key={type} className="me-3 mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input me-1"
                      value={type}
                      id="companyIndustry"
                      name="companyIndustry"
                      onChange={handleChange}
                      checked={formData.companyIndustry.includes(type)}
                      disabled={formState.loading}
                    />
                    {type}
                  </label>
                ))}
              </div>
              {formErrors.companyIndustry && (
                <div className="text-danger small mt-1">
                  {formErrors.companyIndustry}
                </div>
              )}
              <div className="mt-2">
                <label
                  htmlFor="otherCompanyIndustryInput"
                  className="form-label"
                >
                  <input
                    type="checkbox"
                    className="form-check-input me-1"
                    value="其他"
                    id="companyIndustryOther"
                    name="companyIndustry"
                    onChange={handleChange}
                    checked={formData.companyIndustry.includes("其他")}
                    disabled={formState.loading}
                  />
                  其他
                </label>
                <input
                  type="text"
                  className={`form-control mt-1 ${
                    formErrors.otherCompanyIndustry ? "is-invalid" : ""
                  }`}
                  onChange={handleChange}
                  value={formData.otherCompanyIndustry}
                  id="otherCompanyIndustry"
                  name="otherCompanyIndustry"
                  disabled={
                    !formData.companyIndustry.includes("其他") ||
                    formState.loading
                  }
                />
                {formErrors.otherCompanyIndustry && (
                  <div className="invalid-feedback d-block">
                    {formErrors.otherCompanyIndustry}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="phone" className="form-label">
                市話
              </label>
              <input
                type="text"
                className="form-control"
                id="phone"
                name="phone"
                onChange={handleChange}
                value={formData.phone}
                disabled={formState.loading}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="jobTitle" className="form-label">
                職稱<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  formErrors.jobTitle ? "is-invalid" : ""
                }`}
                onChange={handleChange}
                value={formData.jobTitle}
                id="jobTitle"
                name="jobTitle"
                required
                disabled={formState.loading}
              />
              {formErrors.jobTitle && (
                <div className="invalid-feedback d-block">
                  {formErrors.jobTitle}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 d-flex justify-content-center">
          <button
            className={`btn px-5 mt-3 ${
              formState.loading ? "btn-secondary" : "btn-warning"
            }`}
            type="button"
            onClick={handleUpdate}
            disabled={formState.loading}
          >
            {formState.loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                更新中...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                更新表單
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CompanyProfileForm;
