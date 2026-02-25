import React, { ReactNode } from "react";

interface ModalProps {
  id: string;
  title: string;
  children: ReactNode;
  onClose?: () => void;
  onSubmit?: () => void;
}

export function CategoryModal({
  id,
  title,
  children,
  onClose,
  onSubmit,
}: ModalProps) {
  return (
    <div
      className="modal fade"
      id={id}
      tabIndex={-1}
      data-bs-backdrop="static"
      aria-labelledby={id}
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title fs-5" id={id}>
              {title}
            </h2>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
