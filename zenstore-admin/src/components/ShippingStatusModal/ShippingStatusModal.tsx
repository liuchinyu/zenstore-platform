import React, { useState } from "react";
import { ShippingStatus } from "@/types/orders/order";

interface ShippingStatusModalProps {
  id: string;
  title?: string;
  show: boolean;
  onClose: () => void;
  currentStatus: string;
  onStatusUpdate: (status: string, trackingNumber?: string) => void;
}

const ShippingStatusModal: React.FC<ShippingStatusModalProps> = ({
  id,
  title = "更新出貨狀態",
  show,
  onClose,
  currentStatus,
  onStatusUpdate,
}) => {
  const [status, setStatus] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleSubmit = () => {
    onStatusUpdate(status, trackingNumber);
    onClose();
  };

  // 判斷是否需要顯示追蹤編號輸入框
  const showTrackingInput = status === ShippingStatus.SHIPPED;
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
              <label htmlFor="shippingStatus" className="form-label">
                選擇出貨狀態
              </label>
              <select
                className="form-select"
                id="shippingStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value={ShippingStatus.UNSHIPPED}>未出貨</option>
                <option value={ShippingStatus.PREPARING}>備貨中</option>
                <option value={ShippingStatus.SHIPPED}>已出貨</option>
                <option value={ShippingStatus.ARRIVED}>已送達</option>
                {/* <option value={ShippingStatus.RETURNING}>退貨中</option>
                <option value={ShippingStatus.RETURNED}>已退貨</option> */}
              </select>
            </div>

            {showTrackingInput && (
              <div className="mb-3">
                <label htmlFor="trackingNumber" className="form-label">
                  運送追蹤編號
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="trackingNumber"
                  placeholder="請輸入運送追蹤編號"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
            )}
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

export default ShippingStatusModal;
