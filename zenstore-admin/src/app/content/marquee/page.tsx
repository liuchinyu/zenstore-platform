"use client";

import React, { useState } from "react";
import { useMarquee } from "../../../hooks/useMarquee";
import { MarqueeItem } from "../../../types/marquee/marqueeType";
import { useToast } from "../../../components/ui/Toast";

const defaultItem: MarqueeItem = {
  TEXT: "",
  SPEED_MS: 50,
  TEXT_COLOR: "#FFFFFF",
  BACKGROUND_COLOR: "#0d6efd",
  PUBLISH_DATE: "",
  END_DATE: "",
  IS_ACTIVE: 0,
};

export default function MarqueePage() {
  const {
    items,
    loading,
    error,
    selectedItem,
    selectItem,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleActivate,
  } = useMarquee();

  const { showToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<MarqueeItem>(defaultItem);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "SPEED_MS" || name === "IS_ACTIVE" ? Number(value) : value,
    }));
  };

  const resetForm = () => setFormData(defaultItem);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const today = new Date().toISOString().split("T")[0];
      const payload: MarqueeItem = { ...formData } as MarqueeItem;
      if (payload.IS_ACTIVE === 1) {
        payload.PUBLISH_DATE = payload.PUBLISH_DATE || today;
        payload.END_DATE = "";
      } else {
        payload.END_DATE = today;
      }
      // 更新
      if (isEditing && selectedItem) {
        await handleUpdate({ ...payload, ID: selectedItem.ID });
        showToast({
          type: "success",
          title: "更新成功",
          message: "跑馬燈已更新",
          duration: 3000,
        });
      }
      // 新增
      else {
        await handleAdd(payload);
        showToast({
          type: "success",
          title: "新增成功",
          message: "跑馬燈已新增",
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
    }
  };

  const startAdd = () => {
    setIsAdding(true);
    setIsEditing(false);
    selectItem(null);
    resetForm();
  };

  const startEdit = (item: MarqueeItem) => {
    selectItem(item);
    setFormData(item);
    setIsEditing(true);
    setIsAdding(false);
  };

  const cancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    selectItem(null);
    resetForm();
  };

  const toggleActive = async (item: MarqueeItem) => {
    try {
      if (item.IS_ACTIVE) {
        const today = new Date().toISOString().split("T")[0];
        await handleUpdate({ ...item, IS_ACTIVE: 0, END_DATE: today });
        showToast({
          type: "success",
          title: "已停用",
          message: "跑馬燈已停用",
          duration: 2500,
        });
      } else {
        const today = new Date().toISOString().split("T")[0];
        // 先本地寫入啟用日期，後端仍會負責單一啟用
        await handleUpdate({
          ...item,
          IS_ACTIVE: 1,
          PUBLISH_DATE: today,
          END_DATE: "",
        });
        await handleActivate(item.ID as number);
        showToast({
          type: "success",
          title: "已啟用",
          message: "已切換為啟用（單一）",
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

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">跑馬燈設定</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">預覽</h5>
            </div>
            <div className="card-body">
              {items.length === 0 || !items ? (
                <div className="text-muted">尚未新增跑馬燈</div>
              ) : (
                items.map((m) => (
                  <div
                    key={m.ID}
                    className="mb-2 p-2 rounded"
                    style={{
                      backgroundColor: m.BACKGROUND_COLOR,
                      color: m.TEXT_COLOR,
                    }}
                  >
                    <div
                      className="text-truncate"
                      aria-label="marquee-preview"
                      role="marquee"
                    >
                      {m.TEXT}
                    </div>
                    <small className="text-light">
                      速度: {m.SPEED_MS}ms, {m.IS_ACTIVE ? "啟用" : "停用"}
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">跑馬燈列表</h5>
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
                  尚未新增跑馬燈
                </div>
              ) : (
                <div className="list-group">
                  {items.map((m) => (
                    <div
                      key={m.ID}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div className="me-2">
                        <div
                          className="small text-truncate"
                          style={{ maxWidth: 240 }}
                        >
                          {m.TEXT}
                        </div>
                        <div className="text-muted small">
                          {m.SPEED_MS}ms • {m.PUBLISH_DATE || "未設定"} ~{" "}
                          {m.END_DATE || "未設定"}
                        </div>
                      </div>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => toggleActive(m)}
                          aria-label={m.IS_ACTIVE ? "停用" : "啟用"}
                        >
                          {m.IS_ACTIVE ? (
                            <i className="bi bi-toggle-on"></i>
                          ) : (
                            <i className="bi bi-toggle-off"></i>
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => startEdit(m)}
                          aria-label="編輯"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(m.ID as number)}
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
      {/* 新增 Or 編輯表單 */}
      {(isAdding || isEditing) && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  {isEditing ? "編輯跑馬燈" : "新增跑馬燈"}
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={submit} className="needs-validation" noValidate>
                  <div className="mb-3">
                    <label htmlFor="TEXT" className="form-label">
                      跑馬燈文字
                    </label>
                    <textarea
                      id="TEXT"
                      name="TEXT"
                      className="form-control"
                      rows={2}
                      value={formData.TEXT}
                      onChange={handleChange}
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="SPEED_MS" className="form-label">
                      速度（毫秒，數值越小越快）
                    </label>
                    <input
                      id="SPEED_MS"
                      name="SPEED_MS"
                      type="number"
                      min={10}
                      step={10}
                      className="form-control"
                      value={formData.SPEED_MS}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="TEXT_COLOR" className="form-label">
                        文字顏色
                      </label>
                      <input
                        id="TEXT_COLOR"
                        name="TEXT_COLOR"
                        type="color"
                        className="form-control form-control-color"
                        value={formData.TEXT_COLOR}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="BACKGROUND_COLOR" className="form-label">
                        背景顏色
                      </label>
                      <input
                        id="BACKGROUND_COLOR"
                        name="BACKGROUND_COLOR"
                        type="color"
                        className="form-control form-control-color"
                        value={formData.BACKGROUND_COLOR}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  {/* 日期由狀態啟用/停用自動維護，無需在表單輸入 */}
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
                      disabled={loading}
                    >
                      {isEditing ? "更新" : "新增"}
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
