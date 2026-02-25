import React from "react";
import { useToast } from "./ToastContext";

const ToastDemo: React.FC = () => {
  const { showToast } = useToast();

  const handleShowSuccessToast = () => {
    showToast({
      type: "success",
      title: "成功",
      message: "操作已成功完成",
      duration: 5000,
    });
  };

  const handleShowErrorToast = () => {
    showToast({
      type: "error",
      title: "錯誤",
      message: "操作失敗，請稍後再試",
      duration: 5000,
    });
  };

  const handleShowWarningToast = () => {
    showToast({
      type: "warning",
      title: "警告",
      message: "請注意此操作可能有風險",
      duration: 5000,
    });
  };

  const handleShowInfoToast = () => {
    showToast({
      type: "info",
      title: "資訊",
      message: "這是一條資訊通知",
      duration: 5000,
    });
  };

  return (
    <div className="d-flex flex-column gap-2">
      <button className="btn btn-success" onClick={handleShowSuccessToast}>
        顯示成功通知
      </button>
      <button className="btn btn-danger" onClick={handleShowErrorToast}>
        顯示錯誤通知
      </button>
      <button className="btn btn-warning" onClick={handleShowWarningToast}>
        顯示警告通知
      </button>
      <button className="btn btn-info" onClick={handleShowInfoToast}>
        顯示資訊通知
      </button>
    </div>
  );
};

export default ToastDemo;
