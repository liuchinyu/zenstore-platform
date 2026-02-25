import React, { ReactNode } from "react";

interface ModalProps {
  id: string;
  title: string;
  children: ReactNode;
  show: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg";
  centered?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  id,
  title,
  children,
  show,
  onClose,
  size = "md",
  centered = false,
}) => {
  if (!show) return null;

  return (
    <div
      className="modal fade show"
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}Label`}
      style={{
        display: show ? "block" : "none",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1050,
      }}
    >
      <div
        className={`modal-dialog ${
          size === "lg" ? "modal-lg" : size === "sm" ? "modal-sm" : ""
        } ${centered ? "modal-dialog-centered" : ""}`}
      >
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
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
