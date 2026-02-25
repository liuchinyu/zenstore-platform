// src/components/Forms/Person/PersonProfileForm.tsx
// 個人會員表單資料
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import AuthService from "@/services/authService";
import { setUser } from "@/store/authSlice";
import { taiwanRegions, citiesByRegion } from "@/utils/area";
import dynamic from "next/dynamic";
import { selectUser } from "@/store/selectors/authSelectors";
import { validatePersonForm } from "@/utils/formValidation";
import { formatDateToString, getChangedFields } from "@/utils/formHelpers";
import { useToast } from "@/hooks/useToast";

// 動態導入 DatePicker
const DatePickerWrapper = dynamic(
  () => import("@/components/DatePicker/DatePickerWrapper"),
  {
    ssr: false,
    loading: () => <div className="form-control">載入中...</div>,
  }
);

// 定義表單資料介面
interface FormData {
  name: string;
  mobilePhone: string;
  email: string;
  gender: string;
  birthday: Date | null;
  region: string;
  phone: string;
  city: string;
  address: string;
}

// 定義表單狀態介面
interface FormState {
  loading: boolean;
  isInitialLoad: boolean;
  availableCities: string[];
}

// 定義表單錯誤介面
interface FormErrors {
  [key: string]: string;
}

const PersonProfileForm = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const { showToast } = useToast();

  // 統一表單資料狀態
  const [formData, setFormData] = useState<FormData>({
    name: "",
    mobilePhone: "",
    email: "",
    gender: "",
    birthday: null,
    region: "",
    phone: "",
    city: "",
    address: "",
  });

  // 統一表單狀態管理
  const [formState, setFormState] = useState<FormState>({
    loading: false,
    isInitialLoad: true,
    availableCities: [],
  });

  // 表單錯誤狀態
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // 使用 ref 來追蹤是否已經載入過資料
  const hasLoadedRef = useRef(false);

  // 優化：使用 useMemo 計算可用城市，避免不必要的重新計算
  const memoizedAvailableCities = useMemo(() => {
    return formData.region ? citiesByRegion[formData.region] || [] : [];
  }, [formData.region]);

  // 優化：載入用戶資料 - 只在必要時載入
  useEffect(() => {
    const fetchUserData = async () => {
      // 如果已經載入過或沒有 MEMBER_ID，則跳過
      if (hasLoadedRef.current || !user?.MEMBER_ID) {
        return;
      }

      // 檢查 Redux 中是否已經有完整的用戶資料
      const hasCompleteUserData =
        user?.USER_NAME && user?.MOBILE_PHONE && user?.EMAIL;

      if (hasCompleteUserData) {
        // 如果 Redux 中已有完整資料，直接使用
        hasLoadedRef.current = true;
        setFormState((prev) => ({
          ...prev,
          isInitialLoad: false,
        }));
        return;
      }

      try {
        const response = await AuthService.getUserData(user?.MEMBER_ID);

        if (response.success) {
          dispatch(setUser(response.data));
          hasLoadedRef.current = true;
          setFormState((prev) => ({
            ...prev,
          }));

          // 延遲一點時間讓用戶看到完成狀態
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

  // 優化：更新表單值 - 使用 useCallback 避免不必要的重新渲染
  const updateFormValues = useCallback(() => {
    if (user?.MEMBER_ID && hasLoadedRef.current) {
      setFormData({
        name: user?.USER_NAME || "",
        mobilePhone: user?.MOBILE_PHONE || "",
        email: user?.EMAIL || "",
        gender: user?.GENDER || "",
        birthday: user?.BIRTHDAY ? new Date(user?.BIRTHDAY) : null,
        region: user?.REGION || "",
        phone: user?.PHONE || "",
        city: user?.CITY || "",
        address: user?.ADDRESS || "",
      });
    }
  }, [user]);

  useEffect(() => {
    updateFormValues();
  }, [updateFormValues]);

  // 優化：處理表單變更 - 使用統一的狀態更新邏輯
  const handleChange = useCallback(
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLSelectElement>
    ) => {
      const { name, id, value } = e.target;
      const fieldName = name || id;

      // 清除該欄位的錯誤訊息
      if (formErrors[fieldName]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }

      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    },
    [formErrors]
  );

  // 優化：處理生日變更
  const handleBirthdayChange = useCallback((date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      birthday: date,
    }));
  }, []);

  // 優化：處理表單提交 - 使用統一的狀態比較邏輯
  const handleUpdate = useCallback(async () => {
    if (!user?.MEMBER_ID) return;

    // 1. 表單驗證
    const validation = validatePersonForm({
      name: formData.name,
      mobilePhone: formData.mobilePhone,
      email: formData.email,
      phone: formData.phone,
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      showToast("請檢查表單欄位是否填寫正確", "error");
      return;
    }

    setFormState((prev) => ({ ...prev, loading: true }));
    setFormErrors({});

    try {
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

      // 使用 formHelpers 簡化用戶資料比對
      const changedFields = getChangedFields(
        { ...formData, birthday: formattedBirthday },
        { ...user, birthday: user?.BIRTHDAY || "" },
        { ...userFieldMap, birthday: "BIRTHDAY" }
      );

      // 如果有任何字段變更，則調用 API
      if (Object.keys(changedFields).length > 0) {
        const response = await AuthService.updateUser(
          user?.MEMBER_ID,
          changedFields
        );

        if (response.success) {
          // 優化：直接更新 Redux 狀態，不需要重新載入
          const updatedUser = { ...user, ...changedFields };
          dispatch(setUser(updatedUser));
          showToast("會員資料更新成功", "success");
        }
      } else {
        showToast("沒有資料需要更新", "info");
      }
    } catch (error) {
      console.error("更新用戶資料時發生錯誤:", error);
      showToast(
        error instanceof Error ? error.message : "更新失敗，請稍後再試",
        "error"
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

    // 如果切換地區後，原城市不在新的城市列表中，則清空城市選擇
    if (formData.region && !memoizedAvailableCities.includes(formData.city)) {
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  }, [formData.region, formData.city, memoizedAvailableCities]);

  // 優化：載入狀態處理 - 提供更好的載入體驗
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
          <h5 className="text-muted mb-3">載入會員資料中...</h5>
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
            <div className="col-md-6">
              <label htmlFor="phone" className="form-label">
                市話
              </label>
              <input
                type="text"
                className={`form-control ${
                  formErrors.phone ? "is-invalid" : ""
                }`}
                id="phone"
                name="phone"
                onChange={handleChange}
                value={formData.phone}
                disabled={formState.loading}
              />
              {formErrors.phone && (
                <div className="invalid-feedback d-block">
                  {formErrors.phone}
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
                className={`form-control ${
                  formErrors.email ? "is-invalid" : ""
                }`}
                onChange={handleChange}
                value={formData.email}
                id="email"
                name="email"
                disabled
              />
              {formErrors.email && (
                <div className="invalid-feedback d-block">
                  {formErrors.email}
                </div>
              )}
            </div>
            <div className="col-md-6">
              <label htmlFor="birthday" className="form-label d-block">
                生日
              </label>
              <DatePickerWrapper
                selected={formData.birthday}
                onChange={handleBirthdayChange}
                id="birthday"
                name="birthday"
                // disabled={formState.loading}
              />
            </div>
          </div>
          <div className="row mb-3">
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
          </div>
          <div className="row mb-4">
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
            <div className="col-md-6"></div> {/* Empty column for alignment */}
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

export default PersonProfileForm;
