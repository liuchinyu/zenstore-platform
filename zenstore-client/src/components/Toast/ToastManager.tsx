"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import Toast from "./Toast";
import { removeToast } from "@/store/toastSlice";

const ToastManager = () => {
  const toasts = useSelector((state: RootState) => state.toast.toasts);
  const dispatch = useDispatch();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => dispatch(removeToast(toast.id))}
        />
      ))}
    </div>
  );
};

export default ToastManager;
