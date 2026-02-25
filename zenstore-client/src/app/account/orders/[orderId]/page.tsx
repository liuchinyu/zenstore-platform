"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { useAppSelector } from "@/hooks/redux";
import { useParams } from "next/navigation";
import { fetchOrderDetail, cancelOrder } from "@/store/orderSlice";
import {
  OrderStatusTransform,
  PaymentStatusTransform,
  ShippingStatusTransform,
} from "@/utils/OrderStatusTransform";
import { useDynamicReducer } from "@/hooks/useDynamicReducer";
import Image from "next/image";
import LoadingLink from "@/components/LoadingLink/LoadingLink";
import {
  selectOrdersError,
  selectCurrentOrder,
  selectOrdersLoading,
} from "@/store/selectors/orderSelector";

export default function OrderDetail() {
  const dispatch = useDispatch<AppDispatch>();
  const { orderId } = useParams();

  // 動態載入 orders reducer
  const isOrdersLoaded = useDynamicReducer(
    "orders",
    () => import("@/store/orderSlice")
  );

  // 使用記憶化選擇器
  const currentOrder = useAppSelector(selectCurrentOrder);
  const orderMaster = currentOrder?.[0];
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // 發起 API
  useEffect(() => {
    if (orderId && isOrdersLoaded) {
      dispatch(fetchOrderDetail(orderId as string));
    }
  }, [dispatch, orderId, isOrdersLoaded]);

  const handleCancelOrder = async () => {
    if (orderId) {
      const result = await dispatch(cancelOrder(orderId as string));
      if (cancelOrder.fulfilled.match(result)) {
        setShowCancelConfirm(false);
      }
    }
  };

  if (loading && !currentOrder) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">載入中...</span>
        </div>
        <p className="mt-2">載入訂單詳情中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <div className="d-flex align-items-center">
          <i className="fa-solid fa-circle-exclamation me-2"></i>
          <span>{error}</span>
        </div>
        <LoadingLink
          href="/account/orders"
          className="btn btn-outline-primary mt-3"
        >
          返回訂單列表
        </LoadingLink>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="alert alert-warning" role="alert">
        <div className="d-flex align-items-center">
          <i className="fa-solid fa-circle-exclamation me-2"></i>
          <span>找不到訂單資料</span>
        </div>
        <LoadingLink
          href="/account/orders"
          className="btn btn-outline-primary mt-3"
        >
          返回訂單列表
        </LoadingLink>
      </div>
    );
  }

  return (
    <div className="orderDetail">
      {/* 頂部導航欄 */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>訂單詳情</h1>
        <LoadingLink
          href="/account/orders"
          className="btn btn-outline-secondary"
        >
          <i className="fa-solid fa-arrow-left me-1"></i> 返回訂單列表
        </LoadingLink>
      </div>

      {/* 訂單基本資訊 */}
      <div className="card mb-4">
        <div className="card-header bg-transparent">
          <div className="row">
            <div className="col-12  d-flex justify-content-between">
              <h5 className="mb-0">訂單編號: {orderMaster.ORDER_ID}</h5>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4 mb-2 mb-md-0">
              <strong>訂單狀態：</strong>
              <span>{OrderStatusTransform(orderMaster?.ORDER_STATUS)}</span>
            </div>
            <div className="col-md-4 mb-2 mb-md-0">
              <strong>付款狀態：</strong>
              <span>{PaymentStatusTransform(orderMaster?.PAYMENT_STATUS)}</span>
            </div>
            <div className="col-md-4">
              <strong>出貨狀態：</strong>
              <span>
                {ShippingStatusTransform(orderMaster?.SHIPPING_STATUS)}
              </span>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <strong>訂購日期：</strong>
              <span>{orderMaster?.ORDER_DATE}</span>
            </div>
            <div className="col-md-4 mb-3">
              <strong>付款方式：</strong>
              <span>
                {orderMaster?.PAYMENT_METHOD == "ATM" ? "ATM" : "信用卡"}
              </span>
            </div>
            {orderMaster?.PAYMENT_METHOD == "ATM" && (
              <div className="col-md-4 mb-3">
                <strong>匯款帳號末五碼：</strong>
                <span>{orderMaster?.ATM_LAST_FIVE_DIGITS}</span>
              </div>
            )}
            <div className="col-md-4 mb-3">
              <strong>運送方式：</strong>
              <span>{orderMaster?.DELIVERY_METHOD}</span>
            </div>
            <div className="col-md-4 mb-3">
              <strong>訂單備註：</strong>
              <span>{orderMaster?.NOTES}</span>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4 mb-2 mb-md-0">
              <strong>發票類型：</strong>
              <span>
                {orderMaster?.INVOICE_TYPE == "person"
                  ? "二聯式發票"
                  : "三聯式發票"}
              </span>
            </div>
          </div>

          {/* 取消訂單按鈕 (僅在未完成的訂單顯示) */}
          {["pending", "paid"].includes(orderMaster?.ORDER_STATUS) && (
            <div className="mt-3">
              <button
                className="btn btn-outline-danger"
                onClick={() => setShowCancelConfirm(true)}
              >
                <i className="fa-regular fa-circle-xmark me-1"></i>
                取消訂單
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-transparent">
          <h5 className="mb-0">商品明細</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table  mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">商品</th>
                  <th className="ps-3">說明</th>
                  <th className="ps-3" style={{ width: "90px" }}>
                    製造商
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    數量
                  </th>
                  <th className="text-center" style={{ width: "90px" }}>
                    單價
                  </th>
                  <th className="pe-3" style={{ width: "90px" }}>
                    小計
                  </th>
                </tr>
              </thead>
              <tbody className="align-middle">
                {currentOrder.map((item: any) => (
                  <tr key={item.ITEM_ID} className="pb-5">
                    <td className="ps-3 py-2">
                      <div className="d-flex align-items-center">
                        <div className="productImage">
                          <LoadingLink
                            href={`/products/${item.BRAND}/${item.ORACLE_ID}`}
                          >
                            <Image
                              src={item.IMAGE_URL}
                              alt={item.PRODUCT_ID}
                              width={60}
                              height={60}
                              style={{ width: "100%", height: "auto" }}
                            />
                          </LoadingLink>
                        </div>
                        <div className="ms-3">
                          <LoadingLink
                            href={`/products/${item.BRAND}/${item.ORACLE_ID}`}
                          >
                            {item.PRODUCT_ID}
                          </LoadingLink>
                        </div>
                      </div>
                    </td>
                    <td className="ps-3">{item.DESCRIPTION}</td>
                    <td className="ps-3">{item.BRAND}</td>
                    <td className="text-center">{item.QUANTITY}</td>
                    <td className="text-center">
                      ${item.UNIT_PRICE.toLocaleString()}
                    </td>
                    <td className="text-end pe-3">
                      ${(item.UNIT_PRICE * item.QUANTITY).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 訂單金額資訊 */}
      <div className="card mb-4">
        <div className="card-header bg-transparent">
          <h5 className="mb-0">金額資訊</h5>
        </div>
        <div className="card-body">
          <div className="row justify-content-end">
            <div className="col-md-6">
              <div className="d-flex justify-content-between mb-2">
                <span>小計：</span>
                <span>${orderMaster?.TOTAL_AMOUNT?.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>運費：</span>
                <span>${orderMaster?.SHIPPING_FEE?.toLocaleString()}</span>
              </div>
              {orderMaster.discount > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span>折扣：</span>
                  <span>-${orderMaster.discount?.toLocaleString()}</span>
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between">
                <span className="fw-bold">總計：</span>
                <span className="fw-bold fs-5">
                  ${orderMaster?.FINAL_AMOUNT?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 收貨人資訊 */}
      <div className="card mb-4">
        <div className="card-header bg-transparent">
          <h5 className="mb-0">收貨資訊</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3 mb-md-0">
              <h6 className="fw-bold mb-2">收件人資料</h6>
              <p className="mb-1">
                <strong>姓名：</strong> {orderMaster?.RECEIVER_NAME}
              </p>
              <p className="mb-1">
                <strong>手機：</strong> {orderMaster?.RECEIVER_PHONE}
              </p>
              <p className="mb-1">
                <strong>電話：</strong> {orderMaster?.RECEIVER_LANDING_PHONE}
              </p>
              <p className="mb-0">
                <strong>Email：</strong> {orderMaster?.RECEIVER_EMAIL}
              </p>
            </div>
            <div className="col-md-6">
              <h6 className="fw-bold mb-2">收件地址</h6>
              <p className="mb-2">
                {orderMaster?.POSTAL_CODE} {orderMaster?.REGION}
                {orderMaster?.DISTRICT}
                {orderMaster?.ADDRESS}
              </p>
              <h6 className="fw-bold mb-2">收貨時段</h6>
              <p className="mb-0">{orderMaster?.DELIVERY_TIME}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 取消訂單確認彈窗 */}
      {showCancelConfirm && (
        <div className="modalBackdrop">
          <div className="modalContent card">
            <div className="card-header">
              <h5 className="mb-0">確認取消訂單</h5>
            </div>
            <div className="card-body">
              <p>您確定要取消此訂單嗎？此操作無法撤銷。</p>
              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  返回
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleCancelOrder}
                  disabled={loading}
                >
                  {loading ? "處理中..." : "確認取消"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
