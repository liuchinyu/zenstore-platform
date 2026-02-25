import React from "react";
import Modal from "@/components/ui/Modal";

interface AnnouncementModalProps {
  id: string;
  title: string;
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    TITLE: string;
    CATEGORY: string;
    CONTENT: string;
    STATUS: number;
    PUBLISH_DATE?: string;
    END_DATE?: string;
  };
  setFormData: (data: any) => void;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  id,
  title,
  show,
  onClose,
  onSubmit,
  formData,
  setFormData,
}) => {
  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };
  return (
    <Modal id={id} title={title} show={show} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            標題 <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={formData.TITLE}
            onChange={(e) => handleInputChange("TITLE", e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="category" className="form-label">
            分類 <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            id="category"
            value={formData.CATEGORY}
            onChange={(e) => handleInputChange("CATEGORY", e.target.value)}
            required
          >
            <option value="最新消息">最新消息</option>
            <option value="活動公告">活動公告</option>
            <option value="其他">其他</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="content" className="form-label">
            內容 <span className="text-danger">*</span>
          </label>
          <textarea
            className="form-control"
            id="content"
            rows={5}
            value={formData.CONTENT}
            onChange={(e) => handleInputChange("CONTENT", e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="status" className="form-label">
            狀態 <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            id="status"
            value={formData.STATUS}
            onChange={(e) => handleInputChange("STATUS", e.target.value)}
            required
          >
            <option value={1}>啟用</option>
            <option value={0}>停用</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="publishDate" className="form-label">
            發布日期 <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className="form-control"
            id="publishDate"
            value={formData.PUBLISH_DATE}
            onChange={(e) => handleInputChange("PUBLISH_DATE", e.target.value)}
            required
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="btn btn-primary">
            儲存
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AnnouncementModal;
