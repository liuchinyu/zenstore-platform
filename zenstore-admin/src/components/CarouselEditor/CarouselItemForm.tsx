import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { CarouselItem } from "../../types/carousel/carouselType";
import ColorPicker from "../ColorPicker/ColorPicker";
import carouselService from "../../services/carouselService";

interface CarouselItemFormProps {
  item?: CarouselItem;
  onSubmit: (item: Omit<CarouselItem, "id">) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const defaultItem: CarouselItem = {
  IMAGE_URL: "",
  TITLE: "",
  DESCRIPTION: "",
  BUTTON_TEXT: "",
  BUTTON_LINK: "",
  TEXT_COLOR: "#FFFFFF",
  BACKGROUND_COLOR: "#005BAE",
  POSITION: "left", // 預設為左側
  DISPLAY_ORDER: 0,
  CREATED_AT: "",
  IS_ACTIVE: 1,
};

export const CarouselItemForm: React.FC<CarouselItemFormProps> = ({
  item,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const { items } = useSelector((state: any) => state.carousel);

  const [formData, setFormData] = useState<CarouselItem>(item || defaultItem);
  const [imagePreview, setImagePreview] = useState<string | null>(
    item?.IMAGE_URL || null,
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (item) {
      setFormData(item);
      setImagePreview(item.IMAGE_URL);
    }
  }, [item]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 保存文件以便稍後上傳
      setImageFile(file);

      // 創建本地預覽
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (name: string, color: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: color,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 如果有新的圖片文件，先上傳圖片
      if (imageFile) {
        setUploadingImage(true);
        const imageFormData = new FormData(); // 改名為 imageFormData
        imageFormData.append("image", imageFile);

        const response = await carouselService.uploadImage(imageFormData);

        if (response && response.success) {
          // 使用後端返回的圖片 URL
          if (!items || items.length === 0) {
            formData.DISPLAY_ORDER = 0;
          } else {
            formData.DISPLAY_ORDER = items.length;
          }
          const updatedData = {
            // 使用新變數 updatedData
            ...formData,
            IMAGE_URL: response.file_path,
          };

          setFormData(updatedData);
          onSubmit(updatedData); // 提交更新後的數據
        } else {
          throw new Error("圖片上傳失敗");
        }
      } else {
        // 如果沒有新的圖片，直接提交表單數據
        onSubmit(formData);
      }
    } catch (error) {
      console.error("提交輪播項目失敗:", error);
      alert("提交失敗，請稍後再試");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="carousel-item-form">
      <div className="mb-3">
        <label htmlFor="image" className="form-label">
          輪播圖片
        </label>
        <input
          type="file"
          className="form-control"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
        />
        {imagePreview && (
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="預覽"
              className="img-thumbnail"
              style={{ maxHeight: "200px" }}
            />
          </div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="TITLE" className="form-label">
          標題
        </label>
        <input
          type="text"
          className="form-control"
          id="TITLE"
          name="TITLE"
          value={formData.TITLE}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="DESCRIPTION" className="form-label">
          文字
        </label>
        <textarea
          className="form-control"
          id="DESCRIPTION"
          name="DESCRIPTION"
          value={formData.DESCRIPTION}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="BUTTON_TEXT" className="form-label">
          按鈕文字
        </label>
        <input
          type="text"
          className="form-control"
          id="BUTTON_TEXT"
          name="BUTTON_TEXT"
          value={formData.BUTTON_TEXT}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="BUTTON_LINK" className="form-label">
          連結
        </label>
        <input
          type="text"
          className="form-control"
          id="BUTTON_LINK"
          name="BUTTON_LINK"
          value={formData.BUTTON_LINK}
          onChange={handleChange}
        />
      </div>

      <ColorPicker
        color={formData.TEXT_COLOR}
        onChange={(color) => handleColorChange("TEXT_COLOR", color)}
        label="文字顏色"
      />

      <ColorPicker
        color={formData.BACKGROUND_COLOR}
        onChange={(color) => handleColorChange("BACKGROUND_COLOR", color)}
        label="背景顏色"
      />

      <div className="mb-3">
        <label htmlFor="POSITION" className="form-label">
          內容位置
        </label>
        <select
          className="form-select"
          id="POSITION"
          name="POSITION"
          value={formData.POSITION}
          onChange={handleChange}
        >
          <option value="left">左邊</option>
          <option value="right">右邊</option>
        </select>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={uploadingImage}
        >
          取消
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={uploadingImage}
        >
          {uploadingImage ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              上傳中...
            </>
          ) : isEditing ? (
            "更新"
          ) : (
            "新增"
          )}
        </button>
      </div>
    </form>
  );
};

export default CarouselItemForm;
