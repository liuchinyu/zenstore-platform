import React from "react";

interface OrderStatusEditModalProps {
  show: boolean;
  selectedOrder: string[];
  orderStatus: string;
  paymentStatus: string;
  shipmentStatus: string;
  onOrderStatusChange: (status: string) => void;
  onPaymentStatusChange: (status: string) => void;
  onShipmentStatusChange: (status: string) => void;
  onApply: () => void;
  onClose: () => void;
}

const OrderStatusEditModal: React.FC<OrderStatusEditModalProps> = ({
  show,
  selectedOrder,
  orderStatus,
  paymentStatus,
  shipmentStatus,
  onOrderStatusChange,
  onPaymentStatusChange,
  onShipmentStatusChange,
  onApply,
  onClose,
}) => {
  return (
    <>
      <div
        className={`modal fade ${show ? "show d-block" : ""}`}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">編輯狀態</div>
              <button
                type="button"
                className="btn-close"
                aria-label="close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <h6>訂單狀態</h6>
                <select
                  className="form-select"
                  value={orderStatus}
                  onChange={(e) => onOrderStatusChange(e.target.value)}
                >
                  <option value="">請選擇訂單狀態</option>
                  <option value="PENDING">待處理</option>
                  <option value="PROCESSING">處理中</option>
                  <option value="CONFIRMED">已確認</option>
                  <option value="COMPLETED">已完成</option>
                  {/* <option value="CANCELLED">已取消</option>
                  <option value="VOIDED">已作廢</option> */}
                </select>
              </div>

              <div className="mb-3">
                <h6>付款狀態</h6>
                <select
                  className="form-select"
                  value={paymentStatus}
                  onChange={(e) => onPaymentStatusChange(e.target.value)}
                >
                  <option value="">請選擇付款狀態</option>
                  <option value="UNPAID">未付款</option>
                  <option value="PENDING_CONFIRMATION">待確認</option>
                  <option value="PAID">已付款</option>
                  <option value="PAYMENT_FAILED">付款失敗</option>
                  {/* <option value="REFUNDING">退款中</option>
                  <option value="REFUNDED">已退款</option>
                  <option value="PAYMENT_TIMEOUT">超過付款時間</option> */}
                </select>
              </div>

              <div className="mb-3">
                <h6>運送狀態</h6>
                <select
                  className="form-select"
                  value={shipmentStatus}
                  onChange={(e) => onShipmentStatusChange(e.target.value)}
                >
                  <option value="">請選擇運送狀態</option>
                  <option value="UNSHIPPED">未出貨</option>
                  <option value="PREPARING">備貨中</option>
                  <option value="SHIPPED">已出貨</option>
                  <option value="ARRIVED">已送達</option>
                  {/* <option value="RETURNING">退貨中</option>
                  <option value="RETURNED">已退貨</option> */}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onApply}
              >
                套用
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderStatusEditModal;
