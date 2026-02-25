import React from "react";

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "確認",
  cancelText = "取消",
  type = "danger",
}) => {
  if (!show) return null;

  const getButtonClass = () => {
    switch (type) {
      case "danger":
        return "btn-danger";
      case "warning":
        return "btn-warning";
      case "info":
        return "btn-primary";
      default:
        return "btn-primary";
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1050,
      }}
    >
      <div className="card shadow" style={{ maxWidth: "400px" }}>
        <div className="card-header">
          <h5 className="card-title mb-0">{title}</h5>
        </div>
        <div className="card-body">
          <p className="mb-0">{message}</p>
        </div>
        <div className="card-footer d-flex gap-2 justify-content-end">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${getButtonClass()}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
