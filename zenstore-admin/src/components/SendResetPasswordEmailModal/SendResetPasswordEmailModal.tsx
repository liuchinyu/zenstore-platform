import React from "react";
import Modal from "@/components/ui/Modal";

interface SendResetPasswordEmailModalProps {
  id: string;
  title: string;
  show: boolean;
  email: string;
  mobilePhone: string;
  onClose: () => void;
  onConfirm: (email: string, mobilePhone: string) => void;
}

const SendResetPasswordEmailModal = ({
  id,
  title,
  show,
  email,
  mobilePhone,
  onClose,
  onConfirm,
}: SendResetPasswordEmailModalProps) => {
  const handleConfirm = () => {
    onConfirm(email, mobilePhone);
    onClose();
  };

  return (
    <Modal id={id} title={title} show={show} onClose={onClose}>
      <div className="modal-body">
        <p>確定要發送密碼重設郵件給以下用戶嗎？</p>
        <div className="mb-3">
          <strong>電子郵件：</strong> {email}
        </div>
        <div className="mb-3">
          <strong>手機號碼：</strong> {mobilePhone}
        </div>
        <p className="text-muted">用戶將收到一封包含重設密碼連結的電子郵件。</p>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          取消
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleConfirm}
        >
          確認發送
        </button>
      </div>
    </Modal>
  );
};

export default SendResetPasswordEmailModal;
