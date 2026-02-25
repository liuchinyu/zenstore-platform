"use client";

import { useForm } from "react-hook-form";
import CartNav from "@/components/CartNav/CartNav";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { setPaymentInfo } from "@/store/checkoutSlice";
import { useCart } from "@/hooks/useCart";
import { selectShippingInfo } from "@/store/selectors/checkoutSelectors";
import { useDynamicReducer } from "@/hooks/useDynamicReducer";
import LoadingLink from "@/components/LoadingLink/LoadingLink";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import {
  InvoiceHandling,
  PaymentMethod,
  ATMPaymentInfo,
  CreditCardPaymentInfo,
  InvoiceType,
} from "@/types";

type PaymentFormData = {
  paymentMethod: string;
  atmLastFiveDigits?: string;
  invoiceType: string;
  invoiceTitle?: string; //發票抬頭
  tax_id?: string; //統一編號
  isPersonInvoice?: boolean;
  invoiceHandling?: string;
};

export default function Payment() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth?.user);
  const companyData = useAppSelector((state) => state.auth?.companyData);
  const cart_items = useAppSelector((state) => state.cart?.items);
  const cart_items_array = cart_items ? Object.values(cart_items) : [];
  const { totalPrice } = useCart();
  const isCheckoutLoaded = useDynamicReducer(
    "checkout",
    () => import("@/store/checkoutSlice")
  );

  const shippingInfo = useAppSelector(selectShippingInfo);
  const { navigateWithLoading } = useGlobalLoading();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    defaultValues: {
      paymentMethod: "ATM",
      invoiceType: "",
      isPersonInvoice: false,
      invoiceHandling: "person",
    },
  });
  // 監測選擇的付款方式
  const selectedPaymentMethod = watch("paymentMethod");

  // 如果 checkout 還沒載入，顯示載入中
  if (!isCheckoutLoaded) {
    return (
      <>
        <CartNav color="step-3" />
        <div className="container mt-4 mb-5">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "400px" }}
          >
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">載入中...</span>
              </div>
              <p className="mt-3">正在載入結帳資料...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 如果沒有收件資料，顯示錯誤訊息
  if (isCheckoutLoaded && !shippingInfo) {
    return (
      <>
        <CartNav color="step-3" />
        <div className="container mt-4 mb-5">
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading">缺少收件資訊</h4>
            <p>請先填寫收件資訊後再進行付款。</p>
            <hr />
            <a href="/checkout" className="btn btn-primary">
              返回填寫收件資訊
            </a>
          </div>
        </div>
      </>
    );
  }

  const onSubmit = (data: PaymentFormData) => {
    // 建立基礎資訊
    const baseInfo = {
      invoiceType: data.invoiceType as InvoiceType,
      isPersonInvoice: data.isPersonInvoice,
      invoiceHandling: data.invoiceHandling as InvoiceHandling,
      invoiceTitle: data.invoiceTitle,
      tax_id: data.tax_id,
    };

    // 根據支付方式建構完整的 PaymentInfo
    const paymentInfo: ATMPaymentInfo | CreditCardPaymentInfo =
      data.paymentMethod === PaymentMethod.ATM
        ? {
            ...baseInfo,
            paymentMethod: PaymentMethod.ATM,
            atmLastFiveDigits: data.atmLastFiveDigits!,
          }
        : {
            ...baseInfo,
            paymentMethod: PaymentMethod.CREDIT_CARD,
          };

    dispatch(setPaymentInfo(paymentInfo));
    navigateWithLoading("/checkout/confirm");
  };

  // 處理下一步按鈕點擊事件
  const handleNextStep = () => {
    if (selectedPaymentMethod === "ATM") {
      // 如果選擇 ATM 轉帳，需要驗證是否填寫了末五碼
      if (
        !watch("atmLastFiveDigits") ||
        !/^\d{5}$/.test(watch("atmLastFiveDigits") || "")
      ) {
        // 手動觸發表單提交，讓表單驗證顯示錯誤訊息
        handleSubmit(onSubmit)();
        return;
      }
    }

    // 提交表單
    handleSubmit(onSubmit)();
  };

  return (
    <>
      <CartNav color="step-3" />
      <div className="container mt-4 mb-5">
        <div className="row">
          <div className="col-lg-7">
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0 py-2">付款方式</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-4">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="ATM"
                        value="ATM"
                        {...register("paymentMethod")}
                      />
                      <label className="form-check-label" htmlFor="ATM">
                        ATM轉帳
                      </label>
                    </div>

                    {selectedPaymentMethod === "ATM" && (
                      <div className="ms-4 mb-4">
                        <div className="border p-3 bg-light rounded mb-3">
                          <p className="mb-1">戶名：增你強股份有限公司</p>
                          <p className="mb-1">帳號：121-001-0050162-3</p>
                          <p className="mb-1">銀行名稱：永豐銀行營業部</p>
                          <p className="mb-1">銀行代號：807</p>
                          <p className="text-danger mb-0">
                            當您完成轉帳後，請填寫帳號後五碼，以便讓我們確認您的匯款，盡速安排出貨，謝謝。
                          </p>
                        </div>

                        <div className="mb-3">
                          <label
                            htmlFor="atmLastFiveDigits"
                            className="form-label"
                          >
                            匯款帳號末五碼<span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${
                              errors.atmLastFiveDigits ? "is-invalid" : ""
                            }`}
                            id="atmLastFiveDigits"
                            maxLength={5}
                            {...register("atmLastFiveDigits", {
                              required:
                                selectedPaymentMethod === "ATM"
                                  ? "請填寫匯款帳號末五碼"
                                  : false,
                              pattern: {
                                value: /^\d{5}$/,
                                message: "請輸入5位數字",
                              },
                            })}
                          />
                          {errors.atmLastFiveDigits && (
                            <div className="invalid-feedback">
                              {errors.atmLastFiveDigits.message}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="CREDIT_CARD"
                        value="CREDIT_CARD"
                        {...register("paymentMethod")}
                      />
                      <label className="form-check-label" htmlFor="CREDIT_CARD">
                        信用卡(可接受VISA、Master、銀聯卡)
                      </label>
                    </div>

                    {selectedPaymentMethod === "CREDIT_CARD" && (
                      <div className="ms-4 mt-3">
                        <p className="text-danger">
                          *完成刷卡後
                          請勿立即關閉頁面，待畫面跳回官網訂單頁面才算完成。
                          <br />
                          *請留意訂單狀態是否呈現為"已付款"，若顯示"未付款"，請主動告知客服人員。
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h6 className="mb-2">發票資訊</h6>

                    <div className="border p-3 bg-light rounded">
                      <p className="mb-1">*電子發票將會寄送至您的信箱</p>
                      {user?.MEMBER_TYPE === "企業會員" ? (
                        <>
                          <div className="mt-3 mb-3">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                id="invoiceTypeCompany"
                                value="company"
                                {...register("invoiceType")}
                                defaultChecked
                              />
                              <label
                                className="form-check-label"
                                htmlFor="invoiceTypeCompany"
                              >
                                三聯式發票(企業會員)
                              </label>
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-4">
                              <p className="mb-1">
                                統一編號<span className="text-danger">*</span>
                              </p>
                              <input
                                type="text"
                                className="form-control"
                                value={companyData?.[0][1]}
                                readOnly
                                {...register("tax_id")}
                              />
                            </div>
                            <div className="col-md-8">
                              <p className="mb-1">
                                發票抬頭<span className="text-danger">*</span>
                              </p>
                              <input
                                type="text"
                                className="form-control"
                                value={companyData?.[0][0]}
                                readOnly
                                {...register("invoiceTitle")}
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mt-3 mb-3">
                            <div className="form-check mb-3">
                              <input
                                className={`form-check-input ${
                                  errors.invoiceType ? "is-invalid" : ""
                                }`}
                                type="radio"
                                id="isPersonInvoice"
                                value="person"
                                {...register("invoiceType", {
                                  required: "此欄位為必填",
                                })}
                                defaultChecked
                              />
                              <label
                                className="form-check-label"
                                htmlFor="isPersonInvoice"
                              >
                                二聯式發票(個人會員)
                              </label>
                              {errors.invoiceType && (
                                <div className="invalid-feedback">
                                  {errors.invoiceType.message}
                                </div>
                              )}
                            </div>

                            <div className="ms-3 mt-3">
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  id="invoiceHandlingDonate"
                                  value="donate"
                                  defaultChecked
                                  {...register("invoiceHandling")}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="invoiceHandlingDonate"
                                >
                                  電子發票
                                </label>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="mt-3">
                        <p className="text-muted small">
                          <span className="text-danger">*</span>
                          發票資訊已帶入會員資料，如需修改請前往會員中心的帳號資料修改
                          <br />
                          <span className="text-danger">*</span>
                          統一開立電子發票，將會寄送至您的電子信箱
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 py-2">訂單摘要</h5>
              </div>
              <div className="card-body">
                {cart_items_array && cart_items_array.length > 0 ? (
                  <>
                    <div className="mb-3">
                      <h6 className="mb-2">收件資訊</h6>
                      {shippingInfo && (
                        <div className="border p-3 rounded">
                          <p className="mb-1">
                            <strong>收件人：</strong> {shippingInfo.name}
                          </p>
                          <p className="mb-1">
                            <strong>市話：</strong>
                            {shippingInfo.landline_phone}
                          </p>
                          <p className="mb-1">
                            <strong>手機：</strong>
                            {shippingInfo.mobile_phone}
                          </p>
                          <p className="mb-1">
                            <strong>Email：</strong> {shippingInfo.email}
                          </p>
                          <p className="mb-1">
                            <strong>收件地址：</strong>
                            {shippingInfo.postal_code} {shippingInfo.region}
                            {shippingInfo.district} {shippingInfo.address}
                          </p>
                          <p className="mb-1">
                            <strong>收貨時間：</strong>
                            {shippingInfo.deliveryTime}
                          </p>
                          <p className="mb-0">
                            <strong>訂單備註：</strong>
                            {shippingInfo.note}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <h6 className="mb-2">商品明細</h6>
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>商品名稱</th>
                            <th className="text-center">數量</th>
                            <th className="text-end">單價</th>
                            <th className="text-end">小計</th>
                          </tr>
                        </thead>
                        <tbody
                          className="checkout_item"
                          style={{ overflowWrap: "anywhere" }}
                        >
                          {cart_items_array.map((item) => (
                            <tr key={item.ORACLE_ID}>
                              <td style={{ maxWidth: "150px" }}>
                                <LoadingLink
                                  href={`/products/${item.BRAND}/${item.ORACLE_ID}`}
                                >
                                  {item.PRODUCT_ID}
                                </LoadingLink>
                              </td>
                              <td className="text-center text-start">
                                {item.QUANTITY}
                              </td>
                              {/* 若有動態價格(unit_price)則以unit_price表示，否則以price表示 */}
                              <td className="text-end">
                                {"NT$" + item.PRICE.toLocaleString("zh-TW")}
                              </td>
                              <td className="text-end">
                                {"NT$" +
                                  (item.PRICE * item.QUANTITY).toLocaleString(
                                    "zh-TW"
                                  )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="border-top pt-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span>商品金額：</span>
                        <span>NT${totalPrice.toLocaleString("zh-TW")}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>運費：</span>
                        <span>NT$100</span>
                      </div>
                      <div className="d-flex justify-content-between fw-bold">
                        <span>總計：</span>
                        <span>
                          NT${(totalPrice + 100).toLocaleString("zh-TW")}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center py-3">購物車內沒有商品</p>
                )}
              </div>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="d-flex justify-content-between mt-4">
              <a href="/checkout" className="btn btn-outline-secondary px-4">
                <i className="fa-solid fa-arrow-left me-2"></i>上一步
              </a>
              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={handleNextStep}
              >
                下一步<i className="fa-solid fa-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
