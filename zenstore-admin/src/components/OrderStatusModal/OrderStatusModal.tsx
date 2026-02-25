import React, { useState } from "react";
import { OrderStatus } from "@/types/orders/order";

interface OrderStatusModalProps {
  id: string;
  title?: string;
  show: boolean;
  onClose: () => void;
  currentStatus: string;
  onStatusUpdate: (status: string) => void;
}

const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  id,
  title = "更新訂單狀態",
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
              <label htmlFor="orderStatus" className="form-label">
                選擇訂單狀態
              </label>
              <select
                className="form-select"
                id="orderStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value={OrderStatus.PENDING}>待處理</option>
                <option value={OrderStatus.PROCESSING}>處理中</option>
                <option value={OrderStatus.CONFIRMED}>已確認</option>
                <option value={OrderStatus.COMPLETED}>已完成</option>
                {/* <option value={OrderStatus.CANCELLED}>已取消</option>
                <option value={OrderStatus.VOIDED}>已作廢</option> */}
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

export default OrderStatusModal;
