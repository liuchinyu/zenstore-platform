"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CartNav from "@/components/CartNav/CartNav";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { useCart } from "@/hooks/useCart";
import { clearCheckoutData } from "@/store/checkoutSlice";
import { clearCart } from "@/store/cartSlice";
import { useToast } from "@/hooks/useToast";
import { createOrder } from "@/store/orderSlice";
import cartService from "@/services/cartService";
import LoadingLink from "@/components/LoadingLink/LoadingLink";
import { selectMemberId } from "@/store/selectors/authSelectors";
import {
  selectShippingInfo,
  selectPaymentInfo,
} from "@/store/selectors/checkoutSelectors";

export default function Confirm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const shippingInfo = useAppSelector(selectShippingInfo);
  const paymentInfo = useAppSelector(selectPaymentInfo);

  const cart_items = useAppSelector((state) => state.cart?.items);
  const cart_items_array = cart_items ? Object.values(cart_items) : [];
  const { totalPrice } = useCart();
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  const member_id = useAppSelector(selectMemberId);
  // 如果沒有收件資料或付款資料，則重定向回相應頁面
  useEffect(() => {
    if (isOrderSubmitted) return; //若已提交訂單就不重新導向
    if (!shippingInfo) {
      showToast("請先填寫收件資訊！", "error");
      router.push("/checkout");
    } else if (!paymentInfo) {
      showToast("請先填寫付款資訊！", "error");
      router.push("/checkout/payment");
    }
  }, [shippingInfo, paymentInfo, router]);

  // 處理訂單提交
  const handleSubmitOrder = async () => {
    setIsOrderSubmitted(true); // 在提交開始時就設定，避免清空資料後觸發檢查
    try {
      const orderResult = await dispatch(
        createOrder({
          shippingInfo,
          paymentInfo,
          items: cart_items_array,
          totalAmount: totalPrice,
          member_id: member_id,
          shippingFee: 100,
        })
      );

      // 檢查訂單創建結果
      if (createOrder.fulfilled.match(orderResult)) {
        // 訂單創建成功
        showToast("訂單提交成功！", "success");
        // 導航到訂單完成頁面
        router.push("/account/orders");

        // 清空結帳資料和購物車
        dispatch(clearCheckoutData());
        dispatch(clearCart());

        // 清除後端購物車數據
        cartService.deleteUserCart(member_id);
      } else if (createOrder.rejected.match(orderResult)) {
        // 訂單創建失敗
        const errorMessage =
          orderResult.payload || "訂單提交失敗，請稍後再試！";
        showToast(
          String(errorMessage) || "訂單提交失敗，請稍後再試！",
          "error"
        );
      }
    } catch (error) {
      console.error("訂單提交失敗:", error);
      showToast("訂單提交失敗，請稍後再試！", "error");
    }
  };

  // 若沒有繳交資料，且沒有取得收件資訊就return
  if (!isOrderSubmitted && !shippingInfo) {
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

  return (
    <>
      <CartNav color="step-4" />
      <div className="container mt-4 mb-5">
        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0 py-2">訂單確認</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <h6 className="mb-3 border-bottom pb-2">收件資訊</h6>
                  {shippingInfo && (
                    <div className="ms-2">
                      <div className="row mb-2">
                        <div className="col-md-3 fw-bold">收件人：</div>
                        <div className="col-md-9">{shippingInfo.name}</div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-md-3 fw-bold">市話：</div>
                        <div className="col-md-9">
                          {shippingInfo.landline_phone}
                        </div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-md-3 fw-bold">手機：</div>
                        <div className="col-md-9">
                          {shippingInfo.mobile_phone}
                        </div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-md-3 fw-bold">Email：</div>
                        <div className="col-md-9">{shippingInfo.email}</div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-md-3 fw-bold">收件地址：</div>
                        <div className="col-md-9">
                          {shippingInfo.postal_code} {shippingInfo.region}
                          {shippingInfo.district} {shippingInfo.address}
                        </div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-md-3 fw-bold">收貨時間：</div>
                        <div className="col-md-9">
                          {shippingInfo.deliveryTime}
                        </div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-md-3 fw-bold">配送方式：</div>
                        <div className="col-md-9">
                          {shippingInfo.deliveryMethod}
                        </div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-md-3 fw-bold">訂單備註：</div>
                        <div className="col-md-9">{shippingInfo.note}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h6 className="mb-3 border-bottom pb-2">付款資訊</h6>
                  {paymentInfo && (
                    <div className="ms-2">
                      <div className="row mb-2">
                        <div className="col-md-3 fw-bold">付款方式：</div>
                        <div className="col-md-9">
                          {paymentInfo.paymentMethod === "ATM"
                            ? "ATM轉帳"
                            : "信用卡付款"}
                        </div>
                      </div>
                      {paymentInfo.paymentMethod === "ATM" && (
                        <div className="row mb-2">
                          <div className="col-md-3 fw-bold">
                            匯款帳號末五碼：
                          </div>
                          <div className="col-md-9">
                            {paymentInfo.atmLastFiveDigits}
                          </div>
                        </div>
                      )}
                      <div className="row mb-2">
                        <div className="col-md-3 fw-bold">發票類型：</div>
                        <div className="col-md-9">
                          {paymentInfo.invoiceType === "company"
                            ? "三聯式發票(企業會員)"
                            : "二聯式發票"}
                        </div>
                      </div>
                      {paymentInfo.invoiceType == "company" ? (
                        <>
                          <div className="row mb-2">
                            <div className="col-md-3 fw-bold">統一編號:</div>
                            <div className="col-md-9">{paymentInfo.tax_id}</div>
                          </div>
                          <div className="row mb-2">
                            <div className="col-md-3 fw-bold">發票抬頭:</div>
                            <div className="col-md-9">
                              {paymentInfo.invoiceTitle}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="row mb-2">
                            <div className="col-md-3 fw-bold">電子發票</div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h6 className="mb-3 border-bottom pb-2">商品明細</h6>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>商品名稱</th>
                        <th className="text-center" style={{ width: "50px" }}>
                          數量
                        </th>
                        <th className="text-start" style={{ width: "55px" }}>
                          單價
                        </th>
                        <th className="text-start" style={{ width: "90px" }}>
                          小計
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className="checkout_item"
                      style={{ overflowWrap: "anywhere" }}
                    >
                      {cart_items_array.map((item: any) => (
                        <tr key={item.ORACLE_ID}>
                          <td>
                            <LoadingLink
                              href={`/products/${item.BRAND}/${item.ORACLE_ID}`}
                            >
                              {item.PRODUCT_ID}
                            </LoadingLink>
                          </td>
                          <td className="text-center">{item.QUANTITY}</td>
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
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 py-2">訂單摘要</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>商品金額：</span>
                  <span>NT${totalPrice.toLocaleString("zh-TW")}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>運費：</span>
                  <span>NT$100</span>
                </div>
                <div className="d-flex justify-content-between fw-bold fs-5 mt-3 pt-2 border-top">
                  <span>總計：</span>
                  <span>NT${(totalPrice + 100).toLocaleString("zh-TW")}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="d-flex justify-content-between mt-4">
              <a
                href="/checkout/payment"
                className="btn btn-outline-secondary px-4"
              >
                <i className="fa-solid fa-arrow-left me-2"></i>上一步
              </a>
              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={handleSubmitOrder}
              >
                確認訂購
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
