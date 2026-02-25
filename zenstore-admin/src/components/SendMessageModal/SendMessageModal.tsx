"use client";

import { useState, useEffect } from "react";

// 定義元件接收的 props 類型
interface SendMessageModalProps {
  show: boolean;
  onClose: () => void;
  onSend: (message: string) => Promise<void>; // onSend 是一個會回傳 Promise 的非同步函式
  memberName: string;
}

const SendMessageModal = ({
  show,
  onClose,
  onSend,
  memberName,
}: SendMessageModalProps) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // 當 modal 關閉時，清空訊息內容
  useEffect(() => {
    if (!show) {
      setMessage("");
      setIsSending(false);
    }
  }, [show]);

  // 處理按下 "發送" 按鈕的事件
  const handleSend = async () => {
    if (!message.trim() || isSending) {
      return; // 如果訊息為空或正在發送中，則不執行
    }
    setIsSending(true);
    try {
      await onSend(message);
      // 成功後不需要在這裡關閉 modal 或顯示成功訊息，
      // 這些行為由呼叫此元件的父層處理
    } catch (error) {
      // 錯誤處理也由父層的 onSend 函式處理，這裡只需重設發送狀態
      console.error("Modal: Send message failed", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div
      className="modal fade show"
      style={{
        display: show ? "block" : "none",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1050,
      }}
    >
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                發送即時訊息給{" "}
                <span className="text-primary">{memberName}</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
                disabled={isSending}
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="message-text" className="col-form-label">
                    訊息內容:
                  </label>
                  <textarea
                    className="form-control"
                    id="message-text"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="請在此輸入您想傳送的訊息..."
                    disabled={isSending}
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSending}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSend}
                disabled={!message.trim() || isSending}
              >
                {isSending ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span className="ms-2">發送中...</span>
                  </>
                ) : (
                  "發送"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMessageModal;
