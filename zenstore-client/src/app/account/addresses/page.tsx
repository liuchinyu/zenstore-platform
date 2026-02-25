"use client";

import React, {
  useState,
  FormEvent,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { taiwanRegions, citiesByRegion } from "@/utils/area";
import { getChangedFields } from "@/utils/formHelpers";
import {
  validateAddressForm,
  AddressFormValidationData,
} from "@/utils/formValidation";
import { useAppSelector } from "@/hooks/redux";
import AccountService from "@/services/accountService";
import { useToast } from "@/hooks/useToast";
import ConfirmModal, {
  ConfirmModalRef,
} from "@/components/ConfirmModal/ConfirmModal";
import { selectMemberId } from "@/store/selectors/authSelectors";
import { ShippingAddress } from "@/types";

// 1. 定義收貨地址資料結構

// 預設的表單初始值
const initialFormData: Omit<ShippingAddress, "ID"> = {
  NAME: "",
  MOBILE_PHONE: "",
  LANDLINE_PHONE: "",
  EMAIL: "",
  REGION: "",
  DISTRICT: "",
  ADDRESS: "",
  POSTAL_CODE: "",
};

export default function AddressPage() {
  const confirmModalRef = useRef<ConfirmModalRef>(null);
  const { showToast } = useToast();

  // 表單是否顯示
  const [showForm, setShowForm] = useState<boolean>(false);
  // 記錄當前的表單(正在編輯或新增)資料
  const [formState, setFormState] =
    useState<Omit<ShippingAddress, "ID">>(initialFormData);
  // 記錄欲編輯ID
  const [editAddressId, setEditAddressId] = useState<string | null>(null);
  // 記錄欲刪除ID
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);
  // shippingData記錄已經儲存的地址資料
  const [shippingData, setShippingData] = useState<ShippingAddress[]>([]);
  const [createAddress, setCreateAddress] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasLoadedRef = useRef(false);
  const member_id = useAppSelector(selectMemberId);

  // 初次載入取得資料
  useEffect(() => {
    const getShippingAddress = async () => {
      if (member_id && !hasLoadedRef.current) {
        hasLoadedRef.current = true;
        const result = await AccountService.getShippingAddress(member_id);
        if (result.success) {
          // 確保資料是陣列格式
          const addressArray = Array.isArray(result.shippingData)
            ? result.shippingData
            : Object.values(result.shippingData);
          setShippingData(addressArray);
        }
      }
    };
    getShippingAddress();
  }, [member_id, createAddress]);

  // 切換表單顯示
  const handleToggleForm = useCallback(() => {
    setShowForm(!showForm);
    if (!showForm) {
      resetForm();
    } else {
      setEditAddressId(null);
    }
  }, [showForm]);

  // 重置表單函數
  const resetForm = useCallback(() => {
    setFormState(initialFormData);
    setEditAddressId(null);
    setErrors({});
  }, []);

  // 編輯地址函數
  const handleEditAddress = (address: ShippingAddress) => {
    setEditAddressId(address.ID || "");
    setFormState({
      NAME: address.NAME,
      MOBILE_PHONE: address.MOBILE_PHONE,
      LANDLINE_PHONE: address.LANDLINE_PHONE,
      EMAIL: address.EMAIL,
      REGION: address.REGION,
      DISTRICT: address.DISTRICT,
      ADDRESS: address.ADDRESS,
      POSTAL_CODE: address.POSTAL_CODE,
    });
    setShowForm(true);
  };

  // 處理刪除按鈕點擊事件
  const handleDeleteAddress = (addressId: string) => {
    setDeleteAddressId(addressId);
    confirmModalRef.current?.open();
  };

  // 確認刪除後的處理函數
  const handleConfirmDelete = async () => {
    if (deleteAddressId) {
      const response =
        await AccountService.deleteShippingAddress(deleteAddressId);

      if (response.success) {
        setShippingData(
          shippingData.filter((addr) => addr.ID !== deleteAddressId),
        );
        showToast(response?.message || "地址已成功刪除", "success");
      } else {
        showToast(response?.message || "地址刪除失敗", "error");
      }
    }
  };

  // 記錄表單變更並儲存
  const handleChange = useCallback(
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLSelectElement>,
    ) => {
      const { name, id, value } = e.target;
      const fieldName = name || id;
      setFormState((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
      // 當使用者輸入時，清除該欄位的錯誤訊息
      if (errors[fieldName]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    },
    [errors],
  );

  // 使用 useMemo 優化城市列表計算
  const availableCities = useMemo(() => {
    return formState.REGION ? citiesByRegion[formState.REGION] || [] : [];
  }, [formState.REGION]);

  useEffect(() => {
    if (
      formState.DISTRICT &&
      formState.REGION &&
      !citiesByRegion[formState.REGION]?.includes(formState.DISTRICT)
    ) {
      setFormState((prev) => ({ ...prev, DISTRICT: "" }));
    }
  }, [formState.REGION]);

  // 表單提交函數
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 進行表單驗證
    const validationResult = validateAddressForm(
      formState as AddressFormValidationData,
    );

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      showToast("請檢查表單輸入是否正確", "error");
      return;
    }

    if (editAddressId) {
      // 編輯現有地址
      const newAddressData: ShippingAddress = {
        ID: editAddressId,
        ...formState,
      };

      // 取得對應地址
      const matchAddress = shippingData.find(
        (addr) => addr.ID === newAddressData.ID,
      );

      // 使用 getChangedFields 比對變更
      let changedField: Partial<ShippingAddress> = {};
      if (matchAddress) {
        // 定義表單欄位與資料庫欄位的對應
        const fieldMap: Record<string, string> = {
          name: "NAME",
          mobile_phone: "MOBILE_PHONE",
          landline_phone: "LANDLINE_PHONE",
          email: "EMAIL",
          region: "REGION",
          district: "DISTRICT",
          address: "ADDRESS",
          postal_code: "POSTAL_CODE",
        };

        changedField = getChangedFields<ShippingAddress>(
          newAddressData,
          matchAddress,
          fieldMap,
        );
      }

      if (Object.keys(changedField).length === 0) {
        showToast("沒有偵測到任何變更", "info");
        return;
      }

      changedField.ID = newAddressData.ID;

      const response = await AccountService.updateShippingAddress(changedField);

      if (response?.success) {
        setShippingData(
          shippingData.map((addr) =>
            addr.ID === editAddressId ? newAddressData : addr,
          ),
        );
        showToast(response?.message || "地址已成功更新", "success");
      } else {
        showToast(response?.message || "地址更新失敗", "error");
        return;
      }
    } else {
      // 創建新地址
      const newAddressData: ShippingAddress = {
        ...formState,
      };
      console.log("新增地址:", newAddressData);
      const response = await AccountService.createShippingAddress(
        member_id,
        newAddressData,
      );

      if (response.success) {
        hasLoadedRef.current = false; // 重置 loaded 狀態，允許 useEffect 重新抓取
        setCreateAddress(!createAddress);
        showToast(response?.message || "地址已成功新增", "success");
      } else {
        showToast(response?.message || "新增地址失敗", "error");
        return;
      }
    }
    // 重置表單並關閉
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>收貨地址管理</h2>
        {/* 3. 新增收貨人按鈕 */}
        <button className="btn btn-primary" onClick={handleToggleForm}>
          {showForm ? "取消" : "新增收貨人"}
        </button>
      </div>

      {/* 4. 條件渲染新增收貨人表單區域 */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            {editAddressId ? "編輯收貨人" : "新增收貨人"}
          </div>
          <div className="card-body">
            {/* 4. 新增收貨人表單 */}
            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* 左側欄位 */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="NAME" className="form-label">
                      收貨人姓名*
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.NAME ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formState.NAME}
                      id="NAME"
                      name="NAME"
                      // required // 移除 required 改用 JS 驗證
                      aria-label="收貨人姓名"
                    />
                    {errors.NAME && (
                      <div className="invalid-feedback">{errors.NAME}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="MOBILE_PHONE" className="form-label">
                      行動電話*
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${
                        errors.MOBILE_PHONE ? "is-invalid" : ""
                      }`}
                      id="MOBILE_PHONE"
                      name="MOBILE_PHONE"
                      value={formState.MOBILE_PHONE}
                      onChange={handleChange}
                      // pattern="[0-9]{10}" // 移除 pattern 改用 JS 驗證
                      // required
                      aria-label="行動電話"
                    />
                    {errors.MOBILE_PHONE && (
                      <div className="invalid-feedback">
                        {errors.MOBILE_PHONE}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="LANDLINE_PHONE" className="form-label">
                      室內電話*
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${
                        errors.LANDLINE_PHONE ? "is-invalid" : ""
                      }`}
                      id="LANDLINE_PHONE"
                      name="LANDLINE_PHONE"
                      value={formState.LANDLINE_PHONE}
                      onChange={handleChange}
                      // required
                      aria-label="室內電話"
                    />
                    {errors.LANDLINE_PHONE && (
                      <div className="invalid-feedback">
                        {errors.LANDLINE_PHONE}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="EMAIL" className="form-label">
                      電子信箱*
                    </label>
                    <input
                      type="email"
                      className={`form-control ${
                        errors.EMAIL ? "is-invalid" : ""
                      }`}
                      id="EMAIL"
                      name="EMAIL"
                      value={formState.EMAIL}
                      onChange={handleChange}
                      // required
                      aria-label="電子信箱"
                    />
                    {errors.EMAIL && (
                      <div className="invalid-feedback">{errors.EMAIL}</div>
                    )}
                  </div>
                </div>

                {/* 右側欄位 */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="REGION" className="form-label">
                      地區*
                    </label>
                    <select
                      className={`form-select ${
                        errors.REGION ? "is-invalid" : ""
                      }`}
                      id="REGION"
                      name="REGION"
                      value={formState.REGION}
                      onChange={handleChange}
                      required
                    >
                      <option value="">請選擇地區</option>
                      {taiwanRegions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                    {errors.REGION && (
                      <div className="invalid-feedback">{errors.REGION}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="DISTRICT" className="form-label">
                      行政區*
                    </label>
                    <select
                      className={`form-select ${
                        errors.DISTRICT ? "is-invalid" : ""
                      }`}
                      id="DISTRICT"
                      name="DISTRICT"
                      value={formState.DISTRICT}
                      onChange={handleChange}
                      disabled={!formState.REGION}
                      // required
                    >
                      <option value="">請選擇城市</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    {errors.DISTRICT && (
                      <div className="invalid-feedback">{errors.DISTRICT}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="ADDRESS" className="form-label">
                      收件地址*
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.ADDRESS ? "is-invalid" : ""
                      }`}
                      id="ADDRESS"
                      name="ADDRESS"
                      value={formState.ADDRESS}
                      onChange={handleChange}
                      // required
                      aria-label="收件地址"
                    />
                    {errors.ADDRESS && (
                      <div className="invalid-feedback">{errors.ADDRESS}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="POSTAL_CODE" className="form-label">
                      郵遞區號*
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.POSTAL_CODE ? "is-invalid" : ""
                      }`}
                      id="POSTAL_CODE"
                      name="POSTAL_CODE"
                      value={formState.POSTAL_CODE}
                      onChange={handleChange}
                      // pattern="[0-9]{3,6}" // 簡單的郵遞區號格式範例
                      // required
                      aria-label="郵遞區號"
                    />
                    {errors.POSTAL_CODE && (
                      <div className="invalid-feedback">
                        {errors.POSTAL_CODE}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-center">
                <button type="submit" className="btn btn-warning px-4">
                  {editAddressId ? "更新" : "新增"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. 顯示已儲存的收貨地址區域 */}
      {shippingData.length > 0 && (
        <>
          <h3 className="mb-3">已存收貨地址</h3>
          {/* 使用 Bootstrap Grid 實現卡片佈局，每排最多4張 */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {shippingData.map((address, index) => (
              <div key={index} className="col">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{address.NAME}</h5>
                    <p className="card-text mb-1">
                      <small className="text-muted">市話：</small>
                      {address.LANDLINE_PHONE}
                    </p>
                    <p className="card-text mb-1">
                      <small className="text-muted">手機：</small>
                      {address.MOBILE_PHONE}
                    </p>
                    <p className="card-text mb-1" style={{ fontSize: "14px" }}>
                      <small
                        className="text-muted"
                        style={{ fontSize: "14px" }}
                      >
                        信箱：
                      </small>
                      {address.EMAIL}
                    </p>
                    <p className="card-text mb-1">
                      <small className="text-muted">地址：</small>
                      {`${address.REGION} ${address.DISTRICT} ${address.ADDRESS}`}
                    </p>
                    <p className="card-text mb-0">
                      <small className="text-muted">郵遞區號：</small>
                      {address.POSTAL_CODE}
                    </p>
                  </div>
                  <div className="card-footer bg-transparent d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleEditAddress(address)}
                      aria-label="編輯地址"
                    >
                      編輯
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteAddress(address.ID || "")}
                      aria-label="刪除地址"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {shippingData.length === 0 && !showForm && (
        <p className="text-center text-muted mt-5">尚未新增任何收貨地址。</p>
      )}

      {/* 確認刪除的 Modal */}
      <ConfirmModal
        ref={confirmModalRef}
        title="確認刪除"
        message="確定要刪除此收貨地址嗎？"
        confirmBtnText="刪除"
        cancelBtnText="取消"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteAddressId(null)}
      />
    </div>
  );
}
