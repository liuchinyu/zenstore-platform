import React from "react";
import Modal from "@/components/ui/Modal";

interface TechResourcesModalProps {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string;
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    TITLE: string;
    CATEGORY: string;
    DESCRIPTION: string;
    URL: string;
  };
  setFormData: (data: any) => void;
}

const TechResourcesModal: React.FC<TechResourcesModalProps> = ({
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
            <option value="">請選擇分類</option>
            <option value="API 文檔">API 文檔</option>
            <option value="開發文檔">開發文檔</option>
            <option value="使用指南">使用指南</option>
            <option value="最佳實踐">最佳實踐</option>
            <option value="故障排除">故障排除</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="url" className="form-label">
            網址 <span className="text-danger">*</span>
          </label>
          <input
            type="url"
            className="form-control"
            id="url"
            value={formData.URL}
            onChange={(e) => handleInputChange("URL", e.target.value)}
            placeholder="https://example.com"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            描述
          </label>
          <textarea
            className="form-control"
            id="description"
            rows={3}
            value={formData.DESCRIPTION}
            onChange={(e) => handleInputChange("DESCRIPTION", e.target.value)}
            placeholder="請描述這個技術資源的內容..."
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

export default TechResourcesModal;
