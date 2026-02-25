// 圖片管理
"use client";

import { ProductImageUpload as SharedProductImageUpload } from "../../components/ProductImageUpload";

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
}

export const ProductImageUpload = (props: Props) => {
  const isMain = props.type === "main";

  return (
    <SharedProductImageUpload
      {...props}
      titleOverride={isMain ? "商品主圖" : "商品詳情圖"}
      buttonVariant="primary"
    />
  );
};
