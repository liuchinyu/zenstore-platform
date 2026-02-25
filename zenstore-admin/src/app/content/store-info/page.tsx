"use client";

import React, { useState, useRef } from "react";
import { useStoreInfo } from "../../../hooks/useStoreInfo";
import { StoreInfo } from "../../../types/storeInfo/storeInfoType";
import { useToast } from "../../../components/ui/Toast";
import { ColorPicker } from "../../../components/ColorPicker/ColorPicker";
import storeInfoService from "../../../services/storeInfoService";

const defaultItem: StoreInfo = {
  TITLE: "",
  CONTENT: "",
  TITLE_COLOR: "#000000",
  TITLE_FONT_SIZE: 32,
  CONTENT_COLOR: "#666666",
  CONTENT_FONT_SIZE: 16,
  IMAGE_URL: "",
  IS_ACTIVE: 0,
};

export default function StoreInfoPage() {
  // API相關函數
  const {
    items,
    loading,
    error,
    selectedItem, //選擇的項目
    selectItem, //設定被選擇的函數
    handleAdd,
    handleUpdate,
    handleDelete,
    handleActivate,
    handleDeactivate,
  } = useStoreInfo();

  const { showToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StoreInfo>(defaultItem);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "TITLE_FONT_SIZE" || name === "CONTENT_FONT_SIZE"
          ? Number(value)
          : value,
    }));
  };

  const handleColorChange = (field: "TITLE_COLOR" | "CONTENT_COLOR") => {
    return (color: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: color,
      }));
    };
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 檢查文件類型
      if (!file.type.startsWith("image/")) {
        showToast({
          type: "error",
          title: "檔案格式錯誤",
          message: "請選擇圖片檔案",
          duration: 3000,
        });
        return;
      }

      // 檢查文件大小 (限制 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast({
          type: "error",
          title: "檔案過大",
          message: "圖片大小不能超過 5MB",
          duration: 3000,
        });
        return;
      }

      setImageFile(file);

      // 建立預覽
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 移除圖片
  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFormData((prev) => ({
      ...prev,
      IMAGE_URL: "",
    }));
  };

  const resetForm = () => {
    setFormData(defaultItem);
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalFormData = { ...formData };

      // 如果有新的圖片文件，先上傳圖片
      if (imageFile) {
        setUploadingImage(true);
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);

        const response = await storeInfoService.uploadImage(imageFormData);

        if (response && response.success && response.file_path) {
          finalFormData.IMAGE_URL = response.file_path;
        } else {
          throw new Error("圖片上傳失敗");
        }
      }

      if (isEditing && selectedItem) {
        await handleUpdate({ ...finalFormData, ID: selectedItem.ID });
        showToast({
          type: "success",
          title: "更新成功",
          message: "商場資訊已更新",
          duration: 3000,
        });
      } else {
        await handleAdd(finalFormData);
        showToast({
          type: "success",
          title: "新增成功",
          message: "商場資訊已新增",
          duration: 3000,
        });
      }

      setIsAdding(false);
      setIsEditing(false);
      selectItem(null);
      resetForm();
    } catch (err) {
      showToast({
        type: "error",
        title: "失敗",
        message: String(err),
        duration: 3000,
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const startAdd = () => {
    setIsAdding(true);
    setIsEditing(false);
    selectItem(null);
    resetForm();
  };

  const startEdit = (item: StoreInfo) => {
    selectItem(item);
    setFormData(item);
    setImagePreview(item.IMAGE_URL || "");
    setIsEditing(true);
    setIsAdding(false);
  };

  const cancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    selectItem(null);
    resetForm();
  };

  // 啟用開關 : 判斷是否為啟用，若啟用則停用，反之亦然
  const toggleActive = async (item: StoreInfo) => {
    try {
      if (item.IS_ACTIVE) {
        await handleDeactivate(item.ID as number);
        showToast({
          type: "success",
          title: "已停用",
          message: "商場資訊已停用",
          duration: 2500,
        });
      } else {
        await handleActivate(item.ID as number);
        showToast({
          type: "success",
          title: "已啟用",
          message: "商場資訊已啟用",
          duration: 2500,
        });
      }
    } catch (err) {
      showToast({
        type: "error",
        title: "操作失敗",
        message: String(err),
        duration: 3000,
      });
    }
  };

  // 取得當前啟用的項目用於預覽
  const activeItem = items.find((item) => item.IS_ACTIVE === 1) || items[0];

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">商場基礎資訊設定</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {/* 左側預覽區塊 */}
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">預覽</h5>
            </div>
            <div className="card-body">
              {!activeItem ? (
                <div className="text-muted">尚未新增商場資訊</div>
              ) : (
                <div className="store-info-preview">
                  {/* 標題區域 */}
                  <div className="text-center mb-4 fw-bold">
                    <h1
                      className="display-4 fw-bold mb-3"
                      style={{
                        color: activeItem.TITLE_COLOR,
                        fontSize: activeItem.TITLE_FONT_SIZE,
                      }}
                    >
                      {activeItem.TITLE || "商場標題"}
                    </h1>
                    <p
                      className="text-start fw-bold"
                      style={{
                        color: activeItem.CONTENT_COLOR,
                        fontSize: activeItem.CONTENT_FONT_SIZE,
                      }}
                    >
                      {activeItem.CONTENT || "商場描述內容"}
                    </p>
                  </div>

                  {/* 圖片區域 */}
                  {activeItem.IMAGE_URL && (
                    <div className="text-center">
                      <div
                        className="store-image-container mx-auto"
                        style={{
                          border: "2px solid #dee2e6",
                          borderRadius: "8px",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <img
                          src={activeItem.IMAGE_URL}
                          alt="商場圖片"
                          className="w-100 h-100 object-fit-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* 右側商場資訊列表 */}
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">商場資訊列表</h5>
              <button
                className="btn btn-primary btn-sm"
                onClick={startAdd}
                disabled={isAdding || isEditing}
              >
                <i className="bi bi-plus"></i> 新增
              </button>
            </div>
            <div className="card-body">
              {items.length === 0 ? (
                <div className="text-center p-3 bg-light border rounded">
                  尚未新增商場資訊
                </div>
              ) : (
                <div className="list-group">
                  {items.map((item) => (
                    <div
                      key={item.ID}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div className="me-2">
                        <div
                          className="small text-truncate fw-bold"
                          style={{ maxWidth: 200, color: item.TITLE_COLOR }}
                        >
                          {item.TITLE || "未設定標題"}
                        </div>
                        <div className="text-muted small">
                          {item.IS_ACTIVE ? "啟用中" : "停用中"}
                        </div>
                      </div>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => toggleActive(item)}
                          aria-label={item.IS_ACTIVE ? "停用" : "啟用"}
                        >
                          {item.IS_ACTIVE ? (
                            <i className="bi bi-toggle-on"></i>
                          ) : (
                            <i className="bi bi-toggle-off"></i>
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => startEdit(item)}
                          aria-label="編輯"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(item.ID as number)}
                          aria-label="刪除"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {(isAdding || isEditing) && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  {isEditing ? "編輯商場資訊" : "新增商場資訊"}
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={submit} className="needs-validation" noValidate>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="TITLE" className="form-label">
                          商場標題
                        </label>
                        <input
                          id="TITLE"
                          name="TITLE"
                          type="text"
                          className="form-control"
                          value={formData.TITLE}
                          onChange={handleChange}
                          required
                          aria-required="true"
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="TITLE_FONT_SIZE" className="form-label">
                          標題字型大小
                        </label>
                        <input
                          id="TITLE_FONT_SIZE"
                          name="TITLE_FONT_SIZE"
                          type="number"
                          className="form-control"
                          value={Number(formData.TITLE_FONT_SIZE)}
                          onChange={handleChange}
                        />
                      </div>

                      <ColorPicker
                        color={formData.TITLE_COLOR}
                        onChange={handleColorChange("TITLE_COLOR")}
                        label="標題顏色"
                      />
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="CONTENT" className="form-label">
                          商場描述內容
                        </label>
                        <textarea
                          id="CONTENT"
                          name="CONTENT"
                          className="form-control"
                          rows={4}
                          value={formData.CONTENT}
                          onChange={handleChange}
                          required
                          aria-required="true"
                        />
                      </div>

                      <div className="mb-3">
                        <label
                          htmlFor="CONTENT_FONT_SIZE"
                          className="form-label"
                        >
                          內容字型大小
                        </label>
                        <input
                          id="CONTENT_FONT_SIZE"
                          name="CONTENT_FONT_SIZE"
                          type="number"
                          className="form-control"
                          value={Number(formData.CONTENT_FONT_SIZE)}
                          onChange={handleChange}
                        />
                      </div>

                      <ColorPicker
                        color={formData.CONTENT_COLOR}
                        onChange={handleColorChange("CONTENT_COLOR")}
                        label="內容顏色"
                      />
                    </div>
                  </div>

                  {/* 圖片上傳區域 */}
                  <div className="mb-3">
                    <label className="form-label">商場圖片</label>
                    <div className="border rounded p-3">
                      {imagePreview ? (
                        <div className="text-center">
                          <div
                            className="mb-3 mx-auto"
                            style={{
                              width: "200px",
                              height: "150px",
                              border: "1px solid #dee2e6",
                              borderRadius: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={imagePreview}
                              alt="預覽"
                              className="w-100 h-100"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={handleUploadButtonClick}
                            >
                              <i className="bi bi-arrow-clockwise"></i> 更換圖片
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={removeImage}
                            >
                              <i className="bi bi-trash"></i> 移除圖片
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="mb-3">
                            <i className="bi bi-image display-4 text-muted"></i>
                          </div>
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={handleUploadButtonClick}
                          >
                            <i className="bi bi-upload"></i> 上傳圖片
                          </button>
                          <p className="text-muted small mt-2">
                            支援 JPG、PNG 格式，大小限制 5MB
                          </p>
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={cancel}
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading || uploadingImage}
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
