import React, { useState, useEffect } from "react";
import { CategoryModal } from "@/components/modal";
import { TagType } from "@/types/products/tagType";

interface TagSettingsModalProps {
  id: string;
  title: string;
  tags: TagType[];
  selectedTag: number[];
  onSelectTag: (tagId: number) => void;
  onApply: () => void;
  onClose: () => void;
}

const TagSettingsModal: React.FC<TagSettingsModalProps> = ({
  id,
  title,
  tags,
  selectedTag,
  onSelectTag,
  onApply,
  onClose,
}) => {
  const [showTagCategories, setShowTagCategories] = useState(false);
  const [tempSelectedTag, setTempSelectedTag] = useState<number[]>([]);

  //設定暫存標籤for選取
  useEffect(() => {
    setTempSelectedTag([...selectedTag]);
  }, [selectedTag]);

  //將選擇標籤return父層
  const handleSelectTag = (tagId: number) => {
    onSelectTag(tagId);
  };

  const handleClose = () => {
    onClose();
    setShowTagCategories(false);
    setTempSelectedTag(selectedTag);
  };

  return (
    <CategoryModal
      id="tagModal"
      title="標籤設定"
      //   categories={[]}
      onClose={handleClose}
    >
      <div className="mb-3">標籤分類</div>
      <div className="mb-4">
        <div className="card">
          <div
            className="card-header d-flex justify-content-between align-items-center"
            onClick={() => setShowTagCategories(!showTagCategories)}
            style={{ cursor: "pointer" }}
          >
            <span>選擇標籤</span>
            <i
              className={`bi ${
                showTagCategories ? "bi-chevron-up" : "bi-chevron-down"
              }`}
            ></i>
          </div>
          {showTagCategories && (
            <div className="card-body">
              <div className="list-group">
                <div className="d-flex mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="搜尋標籤"
                  />
                  <button
                    className="btn btn-outline-secondary ms-1"
                    type="button"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
                {tags.length > 0 ? (
                  <div className="list-group">
                    {tags.map((tag) => (
                      <button
                        key={tag.TAG_ID}
                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                          tempSelectedTag.includes(tag.TAG_ID)
                            ? "active border-2"
                            : ""
                        }`}
                        onClick={() => handleSelectTag(tag.TAG_ID)}
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          textAlign: "left",
                        }}
                      >
                        {tag.TAG_NAME}
                        {tempSelectedTag.includes(tag.TAG_ID) && (
                          <i className="bi bi-check-lg ms-2"></i>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">尚無標籤</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="d-flex justify-content-end mt-4">
        <button
          type="button"
          className="btn btn-secondary me-2"
          data-bs-dismiss="modal"
          onClick={handleClose}
        >
          取消
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onApply}
          data-bs-dismiss="modal"
        >
          套用
        </button>
      </div>
    </CategoryModal>
  );
};

export default TagSettingsModal;
