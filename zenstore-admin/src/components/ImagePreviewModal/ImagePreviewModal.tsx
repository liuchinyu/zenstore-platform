import React, { useCallback } from "react";

interface ImagePreviewModalProps {
  show: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  show,
  imageUrl,
  onClose,
}) => {
  if (!show || !imageUrl) return null;

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // 確保只有當點擊的是背景元素 (modal 容器) 時才關閉
      // 避免點擊 modal 內容時也關閉
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
      onClick={handleBackdropClick} // 添加點擊事件處理
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">圖片預覽</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="關閉"
            ></button>
          </div>
          <div className="modal-body text-center">
            <img
              src={imageUrl}
              alt="商品圖片預覽"
              className="img-fluid"
              style={{ maxHeight: "50vh" }}
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
