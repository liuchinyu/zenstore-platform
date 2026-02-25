import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface OrderPermitModalProps {
  id: string;
  title?: string;
  show: boolean;
  onClose: () => void;
  onPermitUpdate: (isPermit: string) => void;
}

const OrderPermitModal = ({
  id,
  title = "取消訂單核准",
  show,
  onClose,
  onPermitUpdate,
}: OrderPermitModalProps) => {
  const { showToast } = useToast();

  const [isPermit, setIsPermit] = useState("");
  const handleSubmit = () => {
    if (!isPermit) {
      showToast({
        type: "error",
        title: "提交失敗",
        message: "資料欄位未填寫",
        duration: 3000,
      });
      return;
    }
    onPermitUpdate(isPermit);
    onClose();
  };

  if (!show) return;

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
              <label htmlFor="refundMethod" className="form-label">
                是否核准<span className="text-danger"> *</span>
              </label>
              <select
                className="form-select"
                id="refundMethod"
                value={isPermit}
                onChange={(e) => setIsPermit(e.target.value)}
              >
                <option value="">請選擇</option>
                <option value="1">同意退貨</option>
                <option value="0">不同意退貨</option>
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
              確認
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPermitModal;
