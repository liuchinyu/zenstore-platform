"use client";

import React from "react";
import TechResourcesModal from "@/components/TechResourcesModal";
import { useTechResources } from "@/hooks/useTechResources";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";

const TechnicalResourcesPage = () => {
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
  } = useTechResources();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingResource) {
      // 更新現有資源
      handleUpdate(editingResource.TECH_ID!, formData);
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
          <h1 className="h3 mb-0">技術資源管理</h1>
          <p className="text-muted">
            管理技術文檔、API 文檔、開發指南等技術相關資源
          </p>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={handleAdd}
            type="button"
          >
            <i className="bi bi-plus"></i> 新增資源
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {resources && resources.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-file-earmark-text display-1 text-muted"></i>
              <p className="text-muted mt-3">目前沒有技術資源</p>
              <button
                className="btn btn-primary"
                onClick={handleAdd}
                type="button"
              >
                新增第一個技術資源
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th style={{ width: "150px" }}>標題</th>
                    <th style={{ width: "80px" }}>分類</th>
                    <th>網址</th>
                    <th style={{ width: "100px" }}>描述</th>
                    <th style={{ width: "110px" }}>上傳日期</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {resources &&
                    resources.length > 0 &&
                    resources.map((resource) => (
                      <tr key={resource.TECH_ID}>
                        <td>
                          <div>
                            <div className="fw-medium">{resource.TITLE}</div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-primary">
                            {resource.CATEGORY}
                          </span>
                        </td>
                        <td>
                          <a
                            href={resource.URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none"
                          >
                            {resource.URL}
                          </a>
                        </td>
                        <td>
                          <small className="text-muted">
                            {resource.DESCRIPTION}
                          </small>
                        </td>
                        <td>{resource.UPLOAD_DATE}</td>
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
                                handleDeleteResource(resource.TECH_ID!)
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
        <TechResourcesModal
          id="tech-resources-modal"
          title={editingResource ? "編輯技術資源" : "新增技術資源"}
          category={formData.CATEGORY}
          url={formData.URL}
          description={formData.DESCRIPTION}
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
        message="確定要刪除這個技術資源嗎？"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="確認刪除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
};

export default TechnicalResourcesPage;
