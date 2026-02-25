"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import CartNav from "@/components/CartNav/CartNav";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { taiwanRegions, citiesByRegion } from "@/utils/area";
import { useCart } from "@/hooks/useCart";
import { setShippingInfo } from "@/store/checkoutSlice";
import { CheckoutShippingInfo } from "@/types";
import LoadingLink from "@/components/LoadingLink/LoadingLink";
import Image from "next/image";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { useDynamicReducer } from "@/hooks/useDynamicReducer"; //動態導入reducer
import { selectMemberId } from "@/store/selectors/authSelectors";
import { selectShippingInfo } from "@/store/selectors/checkoutSelectors";
import {
  selectAddresses,
  selectAddressesInitialized,
} from "@/store/selectors/addressesSelector";
import { getAddresses } from "@/store/addressSlice";
import { ShippingAddress } from "@/types";

// 常數定義
const SHIPPING_FEE = 100;

type FormData = {
  name: string;
  mobile_phone: string;
  landline_phone: string;
  email: string;
  postal_code: string;
  region: string;
  district: string;
  address: string;
  deliveryTime: string;
  deliveryMethod: string;
  note?: string;
};

export default function Checkout() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      deliveryTime: "不限時",
      deliveryMethod: "宅配到府",
    },
  });

  const dispatch = useAppDispatch();

  const isAddressesLoaded = useDynamicReducer(
    "address",
    () => import("@/store/addressSlice"),
  );
  const { navigateWithLoading } = useGlobalLoading();

  // 其他狀態
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<
    string | number | null
  >(null);

  // 追蹤是否已經初始化過表單
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  const member_id = useAppSelector(selectMemberId);
  const cart_items = useAppSelector((state) => state.cart?.items);
  const { totalPrice } = useCart();
  const addresses = useAppSelector(selectAddresses); //常用地址
  const addressesInitialized = useAppSelector(selectAddressesInitialized); //常用地址是否初始化
  const savedShippingInfo = useAppSelector(selectShippingInfo); //結帳地址

  // 監聽地區欄位變化，帶出對應城市
  const watchRegion = watch("region");

  // 使用 useMemo 優化購物車項目陣列計算
  const cart_items_array = useMemo(
    () => (cart_items ? Object.values(cart_items) : []),
    [cart_items],
  );

  // 使用 useMemo 計算可用城市列表
  const availableCities = useMemo(() => {
    return watchRegion ? citiesByRegion[watchRegion] || [] : [];
  }, [watchRegion]);

  // 使用 useMemo 計算總金額
  const finalTotal = useMemo(() => totalPrice + SHIPPING_FEE, [totalPrice]);

  // 初始化表單資料 (從 Redux 恢復)
  useEffect(() => {
    if (savedShippingInfo && !isFormInitialized) {
      // 批量更新 react-hook-form 的值
      Object.entries(savedShippingInfo).forEach(([key, value]) => {
        setValue(key as keyof FormData, value as string);
      });

      setIsFormInitialized(true);
    }
  }, [savedShippingInfo, setValue, isFormInitialized]);

  // 獲取常用地址
  useEffect(() => {
    if (member_id && !addressesInitialized && isAddressesLoaded) {
      dispatch(getAddresses(member_id));
    }
  }, [member_id, isAddressesLoaded, addressesInitialized]);

  // 使用 useCallback 優化函數
  const fillFormWithAddress = useCallback(
    (address: ShippingAddress) => {
      // 批量更新表單值
      setValue("name", address.NAME);
      setValue("landline_phone", address.LANDLINE_PHONE);
      setValue("mobile_phone", address.MOBILE_PHONE);
      setValue("email", address.EMAIL);
      setValue("postal_code", address.POSTAL_CODE);
      setValue("address", address.ADDRESS);
      setValue("region", address.REGION);
      setValue("district", address.DISTRICT);
      setSelectedAddressId(address.ID || "");
      setShowAddressSelector(false);
    },
    [setValue],
  );

  const onSubmit = useCallback(
    (data: FormData) => {
      // 分發 action
      dispatch(setShippingInfo(data as CheckoutShippingInfo));

      // 跳轉
      navigateWithLoading("/checkout/payment");
    },
    [dispatch, navigateWithLoading],
  );

  const toggleAddressSelector = useCallback(() => {
    setShowAddressSelector((prev) => !prev);
  }, []);

  return (
    <>
      <CartNav color="step-2" />
      <div className="container-fluid mt-4 mb-5">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-lg-7 ps-md-5">
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 py-2">收件資訊</h5>
                </div>
                <div className="card-body">
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={toggleAddressSelector}
                      >
                        <i className="fa-solid fa-address-book me-2"></i>
                        選擇收貨地址
                      </button>
                    </div>
                    {showAddressSelector && addresses?.length > 0 && (
                      <div className="checkout_addressSelector">
                        <div className="card border-primary shadow-sm">
                          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">選擇收貨地址</h6>
                            <button
                              type="button"
                              className="btn-close btn-close-white"
                              onClick={() => setShowAddressSelector(false)}
                              aria-label="關閉"
                            ></button>
                          </div>
                          <div className="card-body p-0">
                            <div className="row g-0">
                              {addresses.map((address: ShippingAddress) => (
                                <div
                                  key={address.ID}
                                  className="col-12 col-md-6"
                                >
                                  <div
                                    className={`checkout_addressCard ${
                                      selectedAddressId === address.ID
                                        ? "selectedAddress"
                                        : ""
                                    }`}
                                    onClick={() => fillFormWithAddress(address)}
                                  >
                                    <h5 className="mb-2">{address.NAME}</h5>
                                    <p className="mb-1">
                                      市話:{address.LANDLINE_PHONE}
                                    </p>
                                    <p className="mb-1">
                                      手機:{address.MOBILE_PHONE}
                                    </p>
                                    <p className="mb-1">
                                      信箱:{address.EMAIL || "無"}
                                    </p>
                                    <p className="mb-1">
                                      地址:{address.REGION} {address.DISTRICT}{" "}
                                      {address.ADDRESS}
                                    </p>
                                    <p className="mb-0">
                                      郵遞區號:{address.POSTAL_CODE}
                                    </p>
                                    {selectedAddressId === address.ID && (
                                      <div className="checkout_selectedBadge">
                                        <i className="fa-solid fa-check"></i>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {showAddressSelector && addresses?.length === 0 && (
                      <>
                        <div className="alert alert-warning" role="alert">
                          您尚未設定任何收貨地址,可點擊下方按鈕至會員資料新增收貨地址,或直接填寫下方表單。
                        </div>
                        <LoadingLink
                          href={`/account/addresses`}
                          className="btn btn-primary"
                        >
                          新增收貨地址
                        </LoadingLink>
                      </>
                    )}
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label htmlFor="name" className="form-label">
                        收貨人姓名<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.name ? "is-invalid" : ""
                        }`}
                        id="name"
                        {...register("name", { required: "請填寫收貨人姓名" })}
                      />
                      {errors.name && (
                        <div className="invalid-feedback">
                          {errors.name.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="landline_phone" className="form-label">
                        市話<span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${
                          errors.landline_phone ? "is-invalid" : ""
                        }`}
                        id="landline_phone"
                        {...register("landline_phone", {
                          required: "請填寫市話",
                        })}
                      />
                      {errors.landline_phone && (
                        <div className="invalid-feedback">
                          {errors.landline_phone.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="mobile_phone" className="form-label">
                        手機<span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${
                          errors.mobile_phone ? "is-invalid" : ""
                        }`}
                        id="mobile_phone"
                        {...register("mobile_phone", {
                          required: "請填寫手機",
                          pattern: {
                            value: /^09\d{8}$/,
                            message: "請輸入有效的台灣手機號碼",
                          },
                        })}
                      />
                      {errors.mobile_phone && (
                        <div className="invalid-feedback">
                          {errors.mobile_phone.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      電子信箱<span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${
                        errors.email ? "is-invalid" : ""
                      }`}
                      id="email"
                      {...register("email", {
                        required: "請填寫電子信箱",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "請輸入有效的電子信箱",
                        },
                      })}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">
                        {errors.email.message}
                      </div>
                    )}
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label htmlFor="postal_code" className="form-label">
                        郵遞區號<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.postal_code ? "is-invalid" : ""
                        }`}
                        id="postal_code"
                        {...register("postal_code", {
                          required: "請填寫郵遞區號",
                        })}
                      />
                      {errors.postal_code && (
                        <div className="invalid-feedback">
                          {errors.postal_code.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="region" className="form-label">
                        地區<span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${
                          errors.region ? "is-invalid" : ""
                        }`}
                        id="region"
                        {...register("region", { required: "請選擇地區" })}
                      >
                        <option value="">請選擇</option>
                        {taiwanRegions.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                      {errors.region && (
                        <div className="invalid-feedback">
                          {errors.region.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="district" className="form-label">
                        城市<span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${
                          errors.district ? "is-invalid" : ""
                        }`}
                        id="district"
                        {...register("district", { required: "請選擇城市" })}
                      >
                        <option value="">請選擇</option>
                        {availableCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      {errors.district && (
                        <div className="invalid-feedback">
                          {errors.district.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">
                      收貨地址<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.address ? "is-invalid" : ""
                      }`}
                      id="address"
                      {...register("address", { required: "請填寫收貨地址" })}
                    />
                    {errors.address && (
                      <div className="invalid-feedback">
                        {errors.address.message}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="note" className="form-label">
                      訂單備註
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="note"
                      {...register("note")}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label d-block">收貨時間</label>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="deliveryTime1"
                        value="不限時"
                        {...register("deliveryTime")}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="deliveryTime1"
                      >
                        不限時
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="deliveryTime2"
                        value="上午9:00~13:00"
                        {...register("deliveryTime")}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="deliveryTime2"
                      >
                        上午9:00~13:00
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="deliveryTime3"
                        value="下午13:00~18:00"
                        {...register("deliveryTime")}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="deliveryTime3"
                      >
                        下午13:00~18:00
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-muted small">
                      * 配送時間為白天,請填寫白天可簽收的中文地址以利貨物送達
                      <br />*
                      商品配送方式採用宅配到府,需專人簽收,請再次確認地址無誤
                    </p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">收件方式</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="deliveryMethod1"
                        value="宅配到府"
                        {...register("deliveryMethod")}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="deliveryMethod1"
                      >
                        宅配到府
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5 me-0">
              <div className="card shadow-sm">
                <div className="card-header bg-white d-flex align-items-center">
                  <h5 className="mb-0 py-2">訂單摘要</h5>
                  <span className="text-muted small ms-auto">
                    請先確認好商品資訊是否正確
                  </span>
                </div>
                <div className="card-body">
                  {cart_items_array.length > 0 && (
                    <>
                      <table className="table">
                        <thead>
                          <tr>
                            <th className="text-start">商品名稱</th>
                            <th style={{ width: "50px" }}>數量</th>
                            <th>單價</th>
                            <th>小計</th>
                          </tr>
                        </thead>
                        <tbody className="text-center align-middle checkout_item">
                          {cart_items_array.map((item) => (
                            <tr
                              key={item.ORACLE_ID}
                              style={{ overflowWrap: "anywhere" }}
                            >
                              <td className="text-start checkout_row">
                                <LoadingLink
                                  href={`/products/${item.BRAND}/${item.ORACLE_ID}`}
                                  className="checkout_productLink text-decoration-none d-md-flex align-items-center text-dark"
                                >
                                  <Image
                                    src={item.IMAGE_URL}
                                    alt={item.PRODUCT_ID}
                                    width={75}
                                    height={75}
                                    className="object-fit-contain"
                                  />
                                  <p
                                    className="ms-2"
                                    style={{ fontSize: "12px" }}
                                  >
                                    {item.PRODUCT_ID}
                                  </p>
                                </LoadingLink>
                              </td>
                              <td style={{ width: "60px" }}>{item.QUANTITY}</td>
                              <td>
                                {"NT$" + item.PRICE.toLocaleString("zh-TW")}
                              </td>
                              <td>
                                {"NT$" +
                                  (item.PRICE * item.QUANTITY).toLocaleString(
                                    "zh-TW",
                                  )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="text-end">{`商品總計 : NT$${totalPrice.toLocaleString(
                        "zh-TW",
                      )}`}</p>
                      <p className="text-end">{`運費 : NT$${SHIPPING_FEE.toLocaleString(
                        "zh-TW",
                      )}`}</p>
                      <hr />
                      <h3 className="text-end">{`總計 : NT$${finalTotal.toLocaleString(
                        "zh-TW",
                      )}`}</h3>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="d-flex justify-content-between mt-4">
                <LoadingLink
                  href="/cart"
                  className="btn btn-outline-secondary px-4"
                >
                  <i className="fa-solid fa-arrow-left me-2"></i>上一步
                </LoadingLink>
                <button type="submit" className="btn btn-primary px-4">
                  下一步<i className="fa-solid fa-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
