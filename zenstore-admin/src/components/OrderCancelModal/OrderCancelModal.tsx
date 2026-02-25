import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface OrderCancelModalProps {
  id: string;
  title?: string;
  show: boolean;
  onClose: () => void;
  onReasonUpdate: (cancel_object: any) => void;
}

const OrderCancelModal = ({
  id,
  title = "取消訂單",
  show,
  onClose,
  onReasonUpdate,
}: OrderCancelModalProps) => {
  const { showToast } = useToast();

  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("creditCard");
  const [bank, setBank] = useState("");
  const [accountName, setAccountName] = useState("");
  const [account, setAccount] = useState("");

  const handleSubmit = () => {
    if (!reason) {
      showToast({
        type: "error",
        title: "提交失敗",
        message: "資料欄位未填寫",
        duration: 3000,
      });
      return;
    }
    if (refundMethod === "creditCard") {
      onReasonUpdate({ reason, refundMethod });
    } else {
      // ATM退款須提供銀行名稱、戶名、帳號
      if (!bank || !accountName || !account) {
        showToast({
          type: "error",
          title: "提交失敗",
          message: "資料欄位未填寫",
          duration: 3000,
        });
        return;
      }
      onReasonUpdate({ reason, refundMethod, bank, accountName, account });
    }

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
              <label htmlFor="cancelReason" className="form-label">
                輸入退貨原因<span className="text-danger"> *</span>
              </label>
              <input
                className="form-control"
                id="cancelReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              ></input>
            </div>
            <div className="mb-3">
              <label htmlFor="refundMethod" className="form-label">
                選擇退款方式<span className="text-danger"> *</span>
              </label>
              <select
                className="form-select"
                id="refundMethod"
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value)}
              >
                <option value="creditCard">信用卡退款</option>
                <option value="atm">退款至指定帳戶</option>
              </select>
            </div>
            {refundMethod === "atm" && (
              <>
                <div className="mb-3">
                  <div className="d-flex">
                    <div className="w-50 d-flex me-2 align-items-center">
                      <label htmlFor="bank" className="form-label me-1">
                        銀行名稱<span className="text-danger"> *</span>
                      </label>
                      <input
                        className="form-control"
                        style={{ width: "60%" }}
                        id="bank"
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        required
                      ></input>
                    </div>
                    <div className="w-50 d-flex  align-items-center">
                      <label htmlFor="accountName" className="form-label me-1">
                        戶名<span className="text-danger"> *</span>
                      </label>
                      <input
                        className="form-control"
                        style={{ width: "70%" }}
                        id="accountName"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        required
                      ></input>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="account" className="form-label">
                    銀行帳號<span className="text-danger"> *</span>
                  </label>
                  <input
                    className="form-control"
                    id="account"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    required
                  ></input>
                </div>
              </>
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
              確認
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCancelModal;
