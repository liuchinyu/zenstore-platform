"use client";

import React from "react";
import clsx from "clsx";

interface Props {
  type: "main" | "detail";
  previews: string[];
  uploadStatus: string;
  filesCount: number;
  onUploadClick: () => void;
  onRemove: (index: number) => void;
  onPreview: (src: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  titleOverride?: string;
  buttonVariant?: "primary" | "outline-primary";
}

export const ProductImageUpload = ({
  type,
  previews,
  uploadStatus,
  filesCount,
  onUploadClick,
  onRemove,
  onPreview,
  fileInputRef,
  onFileInputChange,
  titleOverride,
  buttonVariant = "outline-primary",
}: Props) => {
  const isMain = type === "main";
  const limit = isMain ? 10 : 20;
  const title = titleOverride ?? (isMain ? "商品圖片" : "商品詳情圖");

  return (
    <div className={clsx("card", !isMain && "mt-3", isMain && "mb-3")}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="fw-bold m-0 h6">
          {title} <span className="text-muted">({limit}張為上限)</span>
        </h5>
        <button
          type="button"
          className={clsx(
            "btn btn-sm",
            buttonVariant === "primary" ? "btn-primary" : "btn-outline-primary"
          )}
          onClick={onUploadClick}
          disabled={filesCount >= limit}
        >
          <i className="bi bi-plus" aria-hidden="true"></i> 上傳 ({filesCount}/{limit})
        </button>
      </div>
      <div className="card-body">
        <input
          type="file"
          accept="image/*"
          className="d-none"
          multiple
          ref={fileInputRef}
          onChange={onFileInputChange}
        />
        <div
          className={clsx(!isMain && "d-flex flex-wrap")}
          style={{
            minHeight: isMain ? "150px" : "100px",
            ...(isMain && {
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "0.5rem",
            }),
          }}
        >
          {previews.map((src, index) => (
            <div
              key={src + index}
              className={clsx("position-relative", !isMain && "m-1")}
              style={{
                width: isMain ? "100%" : "120px",
                maxWidth: isMain ? "140px" : "none",
                height: isMain ? "auto" : "120px",
                aspectRatio: isMain ? "1/1" : "auto",
                minWidth: 0,
              }}
            >
              <img
                src={src}
                alt={`${title} ${index + 1}`}
                className="img-thumbnail w-100 h-100 object-fit-cover cursor-pointer"
                onClick={() => onPreview(src)}
              />
              <button
                type="button"
                className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center"
                style={{ width: "22px", height: "22px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                aria-label="移除圖片"
              >
                ×
              </button>
            </div>
          ))}
          {previews.length === 0 && (
            <div
              className="text-muted d-flex align-items-center justify-content-center w-100 bg-light border-dashed"
              style={{
                height: "120px",
                gridColumn: isMain ? "1 / span 3" : "auto",
              }}
            >
              尚無圖片
            </div>
          )}
        </div>
        {uploadStatus && isMain && (
          <div
            className={clsx(
              "mt-2 small",
              uploadStatus.includes("失敗") || uploadStatus.includes("最多")
                ? "text-danger"
                : uploadStatus.includes("成功")
                ? "text-success"
                : "text-info"
            )}
          >
            {uploadStatus}
          </div>
        )}
      </div>
    </div>
  );
};


