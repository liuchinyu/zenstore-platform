import React, { useState } from "react";
import { PaymentStatus } from "@/types/orders/order";

interface PaymentStatusModalProps {
  id: string;
  title?: string;
  show: boolean;
  onClose: () => void;
  currentStatus: string;
  onStatusUpdate: (status: string) => void;
}

const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  id,
  title = "更新付款狀態",
  show,
  onClose,
  currentStatus,
  onStatusUpdate,
}) => {
  const [status, setStatus] = useState(currentStatus);

  const handleSubmit = () => {
    onStatusUpdate(status);
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}Label`}
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1050,
        overflow: "auto",
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={`${id}Label`}>
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="paymentStatus" className="form-label">
                選擇付款狀態
              </label>
              <select
                className="form-select"
                id="paymentStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value={PaymentStatus.UNPAID}>未付款</option>
                <option value={PaymentStatus.PENDING_CONFIRMATION}>
                  待確認
                </option>
                <option value={PaymentStatus.PAID}>已付款</option>
                <option value={PaymentStatus.PAYMENT_FAILED}>付款失敗</option>
                {/* <option value={PaymentStatus.REFUNDING}>退款中</option>
                <option value={PaymentStatus.REFUNDED}>已退款</option>
                <option value={PaymentStatus.PAYMENT_TIMEOUT}>
                  超過付款時間
                </option> */}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              確認更新
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusModal;
