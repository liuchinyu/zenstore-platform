"use client";

import React from "react";
import AnnouncementModal from "@/components/AnnouncementModal/AnnouncementModal";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { Announcement } from "@/types/announcements/announcementType";

const AnnouncementsPage = () => {
  const {
    resources,
    isLoading,
    showModal,
    editingResource,
    formData,
    setFormData,
    handleCloseModal,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleEdit,
    handleAdd,
    showConfirmDialog,
    handleConfirmDelete,
    handleCancelDelete,
  } = useAnnouncements();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingResource) {
      // 更新現有資源
      handleUpdate(editingResource.ANNOUNCEMENTS_ID!, formData);
    } else {
      // 新增資源 - 傳遞 formData 給 handleCreate
      handleCreate(formData);
    }
  };

  const handleEditResource = (resource: any) => {
    handleEdit(resource);
  };

  const handleDeleteResource = (id: string) => {
    handleDelete(id);
  };

  if (isLoading) {
    return (
      <div className="container-fluid p-4">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">載入中...</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="h3 mb-0">公告管理</h1>
          <p className="text-muted">發布和管理網站的公告、重要通知等內容</p>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={handleAdd}
            type="button"
          >
            <i className="bi bi-plus"></i> 新增公告
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {resources && resources.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-megaphone display-1 text-muted"></i>
              <p className="text-muted mt-3">目前沒有公告</p>
              <button
                className="btn btn-primary"
                onClick={handleAdd}
                type="button"
              >
                新增第一則公告
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th style={{ width: "180px" }}>標題</th>
                    <th style={{ width: "100px" }}>分類</th>
                    <th>內容</th>
                    <th style={{ width: "100px" }}>狀態</th>
                    <th style={{ width: "110px" }}>發布日期</th>
                    <th style={{ width: "110px" }}>停用日期</th>
                    <th style={{ width: "120px" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {resources &&
                    resources.map((resource: Announcement) => (
                      <tr key={resource.ANNOUNCEMENTS_ID}>
                        <td>
                          <div className="fw-medium">{resource.TITLE}</div>
                        </td>
                        <td>{resource.CATEGORY}</td>
                        <td>
                          <div
                            className="text-truncate"
                            style={{ maxWidth: "400px" }}
                          >
                            {resource.CONTENT}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              resource.STATUS === 1
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
                          >
                            {resource.STATUS === 1 ? "啟用" : "停用"}
                          </span>
                        </td>
                        <td>{resource.PUBLISH_DATE}</td>
                        <td>{resource.END_DATE || "-"}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleEditResource(resource)}
                              type="button"
                              title="編輯"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() =>
                                handleDeleteResource(resource.ANNOUNCEMENTS_ID!)
                              }
                              type="button"
                              title="刪除"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 新增/編輯 Modal */}
      {showModal && (
        <AnnouncementModal
          id="announcement-modal"
          title={editingResource ? "編輯公告" : "新增公告"}
          show={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
        />
      )}

      {/* 輕量級確認對話框 */}
      <ConfirmDialog
        show={showConfirmDialog}
        title="確認刪除"
        message="確定要刪除此公告嗎？此操作無法復原。"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="確認刪除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
};

export default AnnouncementsPage;
