"use client";
import InteractButton from "@/components/ui/InteractButton/InteractButton";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchTags, updateTag, deleteTag } from "@/store/tagSlice";
import { useEffect, useState } from "react";
import { CategoryModal } from "@/components/modal";
import { useToast } from "@/components/ui/Toast/ToastContext";
import {
  selectTags,
  selectTagLoading,
  selectTagError,
} from "@/store/selectors/tagSelector";
const ProductTags = () => {
  const dispatch = useAppDispatch();
  const tags = useAppSelector(selectTags);
  const isLoading = useAppSelector(selectTagLoading);
  const error = useAppSelector(selectTagError);

  const { showToast } = useToast();
  // 載入初始狀態
  const [initialLoading, setInitialLoading] = useState(() => tags.length === 0);

  const [editingTag, setEditingTag] = useState<{
    TAG_ID: number;
    TAG_NAME: string;
  } | null>(null);
  const [deletingTag, setDeletingTag] = useState<{
    TAG_ID: number;
    TAG_NAME: string;
    PRODUCT_COUNT: number;
  } | null>(null);

  useEffect(() => {
    if (tags.length === 0) {
      dispatch(fetchTags()).finally(() => {
        setInitialLoading(false);
      });
    }
  }, [dispatch]);

  // 監聽錯誤狀態並顯示 Toast
  useEffect(() => {
    if (error) {
      showToast({
        type: "error",
        title: "操作失敗",
        message: "該標籤已經被使用，無法刪除",
        duration: 5000,
      });
    }
  }, [error, showToast]);

  const showLoading = isLoading || initialLoading;

  const handleEditTag = (tag: { TAG_ID: number; TAG_NAME: string }) => {
    setEditingTag(tag);
  };

  const handleUpdateTag = () => {
    if (editingTag && editingTag.TAG_NAME.trim()) {
      dispatch(
        updateTag({
          tag_id: editingTag.TAG_ID,
          tag_name: editingTag.TAG_NAME.trim(),
        }),
      );
      setEditingTag(null);
    }
  };

  // 儲存要刪除的標籤名稱作為modal確認
  const handleDeleteTag = (tag: {
    TAG_ID: number;
    TAG_NAME: string;
    PRODUCT_COUNT: number;
  }) => {
    setDeletingTag(tag);
  };

  const confirmDeleteTag = () => {
    if (deletingTag) {
      dispatch(deleteTag(deletingTag.TAG_ID));
      setDeletingTag(null);
    }
  };

  return (
    <div className="container-fluid p-3 border-0">
      <div className="row p-3">
        <div className="col-sm-6 col-12">
          <h1 className="h4">標籤列表</h1>
        </div>
        <div className="col-sm-6 col-12 text-sm-end">
          <InteractButton title="新增標籤" props="createTag" />
        </div>
      </div>
      <div className="row p-4">
        {showLoading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">載入中...</span>
            </div>
          </div>
        ) : tags.length > 0 ? (
          <table className="table table-bordered table-striped table-hover">
            <thead>
              <tr>
                <th>標籤名稱</th>
                <th>商品數量</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag: any) => (
                <tr key={tag.TAG_ID}>
                  <td>{tag.TAG_NAME}</td>
                  <td>{tag.PRODUCT_COUNT}</td>
                  <td>
                    <div className="btn-group" role="group">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEditTag(tag)}
                        data-bs-toggle="modal"
                        data-bs-target="#editTagModal"
                      >
                        編輯
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteTag(tag)}
                        data-bs-toggle="modal"
                        data-bs-target="#deleteTagModal"
                      >
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="alert alert-warning mt-2">
            目前尚無標籤，請點擊「新增標籤」按鈕進行設定
          </div>
        )}
      </div>

      {/* 編輯標籤模態框 */}
      <CategoryModal id="editTagModal" title="編輯標籤">
        <form>
          <div className="text-start">
            <label htmlFor="editTagName" className="form-label">
              標籤名稱
            </label>
          </div>
          <input
            type="text"
            id="editTagName"
            className="form-control mb-2"
            value={editingTag?.TAG_NAME ?? ""}
            onChange={(e) => {
              if (editingTag) {
                setEditingTag({ ...editingTag, TAG_NAME: e.target.value });
              }
            }}
            placeholder="請輸入標籤名稱"
          />
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={() => {
                setEditingTag(null);
              }}
            >
              取消
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpdateTag}
              data-bs-dismiss="modal"
              disabled={!editingTag?.TAG_NAME.trim()}
            >
              更新
            </button>
          </div>
        </form>
      </CategoryModal>

      {/* 刪除標籤確認模態框 */}
      <CategoryModal id="deleteTagModal" title="確認刪除">
        <div className="text-center">
          <p className="mb-3">
            您確定要刪除標籤「<strong>{deletingTag?.TAG_NAME}</strong>」嗎？
          </p>
          <p className="text-muted small">此操作無法復原，請謹慎操作。</p>
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={() => setDeletingTag(null)}
            >
              取消
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={confirmDeleteTag}
              data-bs-dismiss="modal"
            >
              確認刪除
            </button>
          </div>
        </div>
      </CategoryModal>
    </div>
  );
};

export default ProductTags;
