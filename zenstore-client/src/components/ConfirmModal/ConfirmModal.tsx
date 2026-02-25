"use client";

import { useImperativeHandle, forwardRef, useState, useEffect } from "react";

type ConfirmModalProps = {
  title?: string;
  message: string;
  confirmBtnText?: string;
  cancelBtnText?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export type ConfirmModalRef = {
  open: () => void;
  close: () => void;
};

const ConfirmModal = forwardRef<ConfirmModalRef, ConfirmModalProps>(
  (
    {
      title = "確認操作",
      message,
      confirmBtnText = "確認",
      cancelBtnText = "取消",
      onConfirm,
      onClose,
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isShown, setIsShown] = useState(false);

    // 暴露 open 和 close 方法給父組件
    useImperativeHandle(ref, () => ({
      open: () => {
        setIsVisible(true);
        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = "17px";
        // 延遲設置 show 類別，讓過渡動畫生效
        setTimeout(() => {
          setIsShown(true);
        }, 50);
      },
      close: () => {
        setIsShown(false);
        // 延遲移除 DOM，使動畫有時間完成
        setTimeout(() => {
          setIsVisible(false);
          document.body.style.overflow = "";
          document.body.style.paddingRight = "";
        }, 300);
      },
    }));

    const handleConfirm = () => {
      onConfirm();
      closeModal(false);
    };

    const closeModal = (isConfirm: boolean) => {
      setIsShown(false);
      setTimeout(() => {
        setIsVisible(false);
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }, 300);
      if (isConfirm) {
        onClose();
      }
    };

    // 按 ESC 鍵關閉模態框
    useEffect(() => {
      const handleEscKey = (event: KeyboardEvent) => {
        if (event.key === "Escape" && isVisible) {
          closeModal(true);
        }
      };

      if (isVisible) {
        window.addEventListener("keydown", handleEscKey);
      }

      return () => {
        window.removeEventListener("keydown", handleEscKey);
      };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
      <>
        <div
          className={`modal-backdrop fade ${isShown ? "show" : ""}`}
          style={{ zIndex: 1050 }}
          onClick={() => closeModal(false)}
        ></div>
        <div
          className={`modal fade ${isShown ? "show" : ""}`}
          style={{ display: "block", zIndex: 2000 }}
          tabIndex={-1}
          aria-labelledby="confirmModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold" id="confirmModalLabel">
                  <i className="fa-solid fa-exclamation-circle me-2 text-warning"></i>
                  {title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => closeModal(true)}
                ></button>
              </div>
              <div className="modal-body py-4">
                <p className="mb-0 text-center">{message}</p>
              </div>
              <div className="modal-footer border-top-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => closeModal(true)}
                >
                  {cancelBtnText}
                </button>
                <button
                  type="button"
                  className="btn text-white"
                  style={{ backgroundColor: "#ed7d31" }}
                  onClick={handleConfirm}
                >
                  {confirmBtnText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
);

ConfirmModal.displayName = "ConfirmModal";

export default ConfirmModal;
