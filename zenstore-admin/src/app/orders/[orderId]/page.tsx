"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchOrderById,
  updateOrderStatus,
  orderCancelUpdatePermit,
  orderCancelUpdate,
  fetchOrderStatusChangeLogs,
} from "@/store/orderSlice";
import {
  OrderStatusTransform,
  PaymentStatusTransform,
  ShippingStatusTransform,
} from "@/utils/OrderStatusTransform";
import { format } from "date-fns";
// 引入自定義模態框組件
import OrderStatusModal from "@/components/OrderStatusModal";
import PaymentStatusModal from "@/components/PaymentStatusModal";
import ShippingStatusModal from "@/components/ShippingStatusModal";
import OrderCancelModal from "@/components/OrderCancelModal";
import OrderPermitModal from "@/components/OrderPermitModal";
import { useToast } from "@/components/ui/Toast";
import OrderStatusChangeLog from "@/components/OrderStatusChangeLog";
import { useOrderStatusChangeLogs } from "@/hooks/useOrderStatusChangeLogs";
import {
  selectGroupedOrderDetail,
  selectOrderLoading,
  selectOrderError,
} from "@/store/selectors/orderSelector";

const OrderDetail = () => {
  const { orderId } = useParams();
  const dispatch = useAppDispatch();

  // 訂單詳細
  const groupedOrderDetail = useAppSelector(selectGroupedOrderDetail);
  const isLoading = useAppSelector(selectOrderLoading);
  const error = useAppSelector(selectOrderError);

  // 使用 Hook
  const {
    logs: statusChangeLogs,
    isLoading: statusChangeLogsLoading,
    error: statusChangeLogsError,
    refreshLogs,
  } = useOrderStatusChangeLogs(orderId as string);

  const { showToast } = useToast();

  // 控制三個模態框的顯示狀態
  const [showOrderStatusModal, setShowOrderStatusModal] = useState(false);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [showShippingStatusModal, setShowShippingStatusModal] = useState(false);
  const [showOrderCancelModal, setShowOrderCancelModal] = useState(false);
  const [showOrderPermitModal, setShowOrderPermitModal] = useState(false);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId as string));
    }
  }, [dispatch, orderId]);

  // 處理訂單狀態更新
  const handleOrderStatusUpdate = (newStatus: string) => {
    if (orderId) {
      dispatch(
        updateOrderStatus({
          order_id: orderId,
          order_status: newStatus,
          // notes: "",
        }),
      ).then((result) => {
        if (result.meta.requestStatus === "fulfilled") {
          showToast({
            type: "success",
            title: "更新成功",
            message: "訂單狀態已更新",
            duration: 3000,
          });
        } else {
          showToast({
            type: "error",
            title: "更新失敗",
            message: "訂單狀態更新失敗",
            duration: 3000,
          });
        }
        // 重新獲取訂單數據以確保顯示最新狀態
        dispatch(fetchOrderById(orderId as string));
      });
    }
  };

  // 處理付款狀態更新
  const handlePaymentStatusUpdate = (newStatus: string) => {
    if (orderId) {
      dispatch(
        updateOrderStatus({
          order_id: orderId as string,
          payment_status: newStatus,
          // notes: "",
        }),
      ).then((result) => {
        if (result.meta.requestStatus === "fulfilled") {
          showToast({
            type: "success",
            title: "更新成功",
            message: "付款狀態已更新",
            duration: 3000,
          });
        } else {
          showToast({
            type: "error",
            title: "更新失敗",
            message: "付款狀態更新失敗",
            duration: 3000,
          });
        }
        dispatch(fetchOrderById(orderId as string));
      });
    }
  };

  // 處理出貨狀態更新
  const handleShippingStatusUpdate = (
    newStatus: string,
    trackingNumber?: string,
  ) => {
    if (orderId) {
      dispatch(
        updateOrderStatus({
          order_id: orderId as string,
          shipping_status: newStatus,
          // tracking_number: trackingNumber,
        }),
      ).then((result) => {
        if (result.meta.requestStatus === "fulfilled") {
          showToast({
            type: "success",
            title: "更新成功",
            message: "出貨狀態已更新",
            duration: 3000,
          });
        } else {
          showToast({
            type: "error",
            title: "更新失敗",
            message: "出貨狀態更新失敗",
            duration: 3000,
          });
        }
        // 重新獲取訂單數據以確保顯示最新狀態
        dispatch(fetchOrderById(orderId as string));
      });
    }
  };

  // 處理退貨訂單
  const handleorderCancelUpdatePermit = (cancel_object: any) => {
    if (orderId && cancel_object) {
      if (cancel_object.refundMethod === "atm") {
        dispatch(
          orderCancelUpdate({
            order_id: orderId as string,
            cancel_reason: cancel_object.reason,
            refund_method: cancel_object.refundMethod,
            refund_bank: cancel_object.bank,
            refund_account_name: cancel_object.accountName,
            refund_account: cancel_object.account,
            // tracking_number: trackingNumber,
          }),
        ).then((result) => {
          if (result.meta.requestStatus === "fulfilled") {
            showToast({
              type: "success",
              title: "更新成功",
              message: "已成功取消訂單",
              duration: 3000,
            });
          } else {
            showToast({
              type: "error",
              title: "更新失敗",
              message: "取消訂單失敗",
              duration: 3000,
            });
          }
          // 重新獲取訂單數據以確保顯示最新狀態
          dispatch(fetchOrderById(orderId as string));
        });
      } else {
        dispatch(
          orderCancelUpdate({
            order_id: orderId as string,
            cancel_reason: cancel_object.reason,
            refund_method: cancel_object.refundMethod,
            // tracking_number: trackingNumber,
          }),
        ).then((result) => {
          if (result.meta.requestStatus === "fulfilled") {
            showToast({
              type: "success",
              title: "更新成功",
              message: "已成功取消訂單",
              duration: 3000,
            });
          } else {
            showToast({
              type: "error",
              title: "更新失敗",
              message: "取消訂單失敗",
              duration: 3000,
            });
          }
          // 重新獲取訂單數據以確保顯示最新狀態
          dispatch(fetchOrderById(orderId as string));
        });
      }
    }
  };

  // 處理核准退貨
  const handleOrderPermit = (isPermit: string) => {
    dispatch(
      orderCancelUpdatePermit({
        order_id: orderId as string,
        isPermit,
      }),
    ).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        showToast({
          type: "success",
          title: "更新成功",
          message: "已成功取消訂單",
          duration: 3000,
        });
      } else {
        showToast({
          type: "error",
          title: "更新失敗",
          message: "取消訂單失敗",
          duration: 3000,
        });
      }
      // 重新獲取訂單數據以確保顯示最新狀態
      dispatch(fetchOrderById(orderId as string));
    });
  };

  if (isLoading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">載入中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!groupedOrderDetail) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-warning" role="alert">
          找不到訂單資料
        </div>
      </div>
    );
  }
  const {
    basicInfo,
    productDetails,
    financialInfo,
    receiverInfo,
    shippingInfo,
    paymentInfo,
    additionalInfo,
    cancelInfo,
  } = groupedOrderDetail;

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* 訂單標題與狀態 */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <h4 className="h2">訂單編號: {orderId}</h4>
          <p className="text-muted">
            建立時間: {formatDate(basicInfo.order_date)} | 最後更新:
            {formatDate(basicInfo.last_updated)}
          </p>
          <div className="d-flex gap-2">
            <div>{PaymentStatusTransform(paymentInfo.status)}</div>
            <div>{ShippingStatusTransform(shippingInfo.status)}</div>
          </div>
        </div>
        <div className="col-lg-4 text-end">
          <button
            className="btn btn-primary"
            onClick={() => setShowOrderStatusModal(true)}
            disabled={
              cancelInfo.cancel_verified?.toString() === "1" ||
              basicInfo.order_status === "CANCELLED"
            }
          >
            更新訂單狀態
          </button>
        </div>
      </div>

      <div className="row">
        {/* 訂單資訊 */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 d-flex mb-2 align-items-center">
                  <h3 className="me-2 fw-bold">訂單狀態</h3>
                  <div>{OrderStatusTransform(basicInfo.order_status)}</div>
                </div>
                <div className="col-md-6 d-flex mb-2 align-items-center">
                  <h3 className="me-2 fw-bold">付款方式</h3>
                  <h5 className="fw-bold text-decoration-underline">
                    {paymentInfo.payment_method === "CREDIT_CARD"
                      ? "信用卡"
                      : "ATM"}
                  </h5>
                </div>
                <div className="col-md-6 d-flex">
                  <h5 className="fw-bold">訂單總金額 : </h5>
                  <h5 className="fw-bold">
                    {(
                      financialInfo.total_amount + financialInfo.shipping_fee
                    ).toLocaleString()}
                    <span> TWD</span>
                  </h5>
                </div>
                <div className="col-md-6 d-flex">
                  <h5 className="fw-bold">商品總數 : </h5>
                  <h5 className="ms-1">{productDetails.length}</h5>
                </div>
                <div className="col-md-6">
                  <button
                    className="btn btn-primary mt-2"
                    onClick={() => setShowPaymentStatusModal(true)}
                    disabled={
                      cancelInfo.cancel_verified?.toString() === "1" ||
                      basicInfo.order_status === "CANCELLED"
                    }
                  >
                    更改付款狀態
                  </button>
                </div>
                <div className="col-md-6">
                  <button
                    className="btn btn-primary mt-2"
                    onClick={() => setShowShippingStatusModal(true)}
                    disabled={
                      cancelInfo.cancel_verified?.toString() === "1" ||
                      basicInfo.order_status === "CANCELLED"
                    }
                  >
                    更新出貨狀態
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 商品資訊卡片 */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">商品資訊</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th></th>
                      <th>零件編號</th>
                      <th>品牌</th>
                      <th>數量</th>
                      <th>單價</th>
                      <th>小計</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productDetails.map((product: any, index: number) => (
                      <tr key={index}>
                        <td>
                          <img
                            src={product.image_url}
                            alt={product.product_id}
                            className="img-fluid"
                            style={{ minWidth: "6vw", maxWidth: "6vw" }}
                          />
                        </td>
                        <td>{product.product_id}</td>
                        <td>{product.brand}</td>
                        <td>{product.quantity}</td>
                        <td className="text-end">
                          NT$ {product.unit_price.toLocaleString()}
                        </td>
                        <td className="text-end">
                          NT$ {product.subtotal.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={5} className="text-end fw-bold">
                        商品小計:
                      </td>
                      <td className="text-end">
                        NT$ {financialInfo.total_amount.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="text-end fw-bold">
                        運費:
                      </td>
                      <td className="text-end">
                        NT$ {financialInfo.shipping_fee.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="text-end fw-bold">
                        總計金額:
                      </td>
                      <td className="fw-bold text-end">
                        NT${" "}
                        {(
                          financialInfo.total_amount +
                          financialInfo.shipping_fee
                        ).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* 退款資訊 */}
          {cancelInfo.cancel_reason && (
            <>
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">退款資訊</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <p className="mb-1 text-muted">退貨原因</p>
                      <p className="fw-bold">{cancelInfo.cancel_reason}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <p className="mb-1 text-muted">退款方式</p>
                      <p className="fw-bold">{cancelInfo.refund_method}</p>
                    </div>
                    {cancelInfo.refund_method === "atm" && (
                      <>
                        <div className="col-md-6 mb-3">
                          <p className="mb-1 text-muted">銀行名稱</p>
                          <p className="fw-bold">{cancelInfo.refund_bank}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <p className="mb-1 text-muted">戶名</p>
                          <p className="fw-bold">
                            {cancelInfo.refund_account_name}
                          </p>
                        </div>
                        <div className="col-12 mb-3">
                          <p className="mb-1 text-muted">帳號</p>
                          <p className="fw-bold">{cancelInfo.refund_account}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 收件人資訊卡片 */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">收件人資訊</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <p className="mb-1 text-muted">收件人姓名</p>
                  <p className="fw-bold">{receiverInfo.name}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="mb-1 text-muted">聯絡電話</p>
                  <p className="fw-bold">{receiverInfo.receiver_phone}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="mb-1 text-muted">市話</p>
                  <p className="fw-bold">
                    {receiverInfo.receiver_landing_phone || "無"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="mb-1 text-muted">電子郵件</p>
                  <p className="fw-bold">{receiverInfo.email}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="mb-1 text-muted">收件地址</p>
                  <p className="fw-bold">
                    {receiverInfo.postal_code} {receiverInfo.region}
                    {receiverInfo.district}
                    {receiverInfo.address}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <p>發票類型</p>
                  <p className="fw-bold">
                    {basicInfo.invoice_type == "person"
                      ? "二聯式發票"
                      : "三聯式發票"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 備註資訊 */}
          {additionalInfo.notes && (
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">訂單備註</h5>
              </div>
              <div className="card-body">
                <p>{additionalInfo.notes}</p>
              </div>
            </div>
          )}

          {/* 狀態變動記錄 */}
          <div className="row mt-4">
            <div className="col-12">
              <OrderStatusChangeLog
                logs={statusChangeLogs}
                isLoading={statusChangeLogsLoading}
                error={statusChangeLogsError}
                onRetry={refreshLogs}
              />
            </div>
          </div>
        </div>

        {/* 側邊欄 - 配送與付款資訊 */}
        <div className="col-lg-4">
          {/* 配送資訊卡片 */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">配送資訊</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <p className="mb-1 text-muted">配送方式</p>
                <p className="fw-bold">{shippingInfo.method}</p>
              </div>
              <div className="mb-3">
                <p className="mb-1 text-muted">配送時間</p>
                <p className="fw-bold">{shippingInfo.time}</p>
              </div>
              <div className="mb-3">
                <p className="mb-1 text-muted">配送狀態</p>
                <div>{ShippingStatusTransform(shippingInfo.status)}</div>
              </div>
            </div>
          </div>

          {/* 付款資訊卡片 */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">付款資訊</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <p className="mb-1 text-muted">付款狀態</p>
                <div>{PaymentStatusTransform(paymentInfo.status)}</div>
              </div>
              <div className="mb-3">
                <p className="mb-1 text-muted">付款方式</p>
                <div className="fw-bold">
                  {paymentInfo.payment_method === "CREDIT_CARD"
                    ? "信用卡"
                    : "ATM"}
                </div>
              </div>
              {paymentInfo.payment_method === "ATM" && (
                <>
                  {/* <div className="mb-3">
                    <p className="mb-1 text-muted">付款期限</p>
                    <p className="fw-bold">
                      {formatDate(paymentInfo.due_date)}
                    </p>
                  </div> */}
                  <div className="mb-3">
                    <p className="mb-1 text-muted">ATM 後五碼</p>
                    <p className="fw-bold">
                      {paymentInfo.Atm_Last_Five_Digits}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">訂單操作</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => setShowOrderStatusModal(true)}
                  disabled={
                    cancelInfo.cancel_verified?.toString() === "1" ||
                    basicInfo.order_status === "CANCELLED"
                  }
                >
                  更新訂單狀態
                </button>
                <button
                  className="btn btn-success"
                  type="button"
                  onClick={() => setShowPaymentStatusModal(true)}
                  disabled={
                    cancelInfo.cancel_verified?.toString() === "1" ||
                    basicInfo.order_status === "CANCELLED"
                  }
                >
                  更新付款狀態
                </button>
                <button
                  className="btn btn-info text-white"
                  type="button"
                  onClick={() => setShowShippingStatusModal(true)}
                  disabled={
                    cancelInfo.cancel_verified?.toString() === "1" ||
                    basicInfo.order_status === "CANCELLED"
                  }
                >
                  更新出貨狀態
                </button>
                {cancelInfo.cancel_reason ? (
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => setShowOrderPermitModal(true)}
                    disabled={cancelInfo.cancel_verified?.toString() === "1"}
                  >
                    核准退貨
                  </button>
                ) : (
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => setShowOrderCancelModal(true)}
                  >
                    取消訂單
                  </button>
                )}

                {/* <button className="btn btn-outline-secondary" type="button">
                  列印訂單
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 訂單狀態模態框 */}
      <OrderStatusModal
        id="orderStatusModal"
        show={showOrderStatusModal}
        onClose={() => setShowOrderStatusModal(false)}
        currentStatus={basicInfo.order_status}
        onStatusUpdate={handleOrderStatusUpdate}
      />

      {/* 付款狀態模態框 */}
      <PaymentStatusModal
        id="paymentStatusModal"
        show={showPaymentStatusModal}
        onClose={() => setShowPaymentStatusModal(false)}
        currentStatus={paymentInfo.status}
        onStatusUpdate={handlePaymentStatusUpdate}
      />

      {/* 出貨狀態模態框 */}
      <ShippingStatusModal
        id="shippingStatusModal"
        show={showShippingStatusModal}
        onClose={() => setShowShippingStatusModal(false)}
        currentStatus={shippingInfo.status}
        onStatusUpdate={handleShippingStatusUpdate}
      />

      {/* 取消訂單Modal */}
      <OrderCancelModal
        id="orderCancelModal"
        show={showOrderCancelModal}
        onClose={() => setShowOrderCancelModal(false)}
        onReasonUpdate={handleorderCancelUpdatePermit}
      />

      {/* 核准取消訂單Modal */}
      <OrderPermitModal
        id="orderPermitModal"
        show={showOrderPermitModal}
        onClose={() => setShowOrderPermitModal(false)}
        onPermitUpdate={handleOrderPermit}
      />

      {/* 新增狀態變動記錄區塊 */}
    </div>
  );
};

export default OrderDetail;
