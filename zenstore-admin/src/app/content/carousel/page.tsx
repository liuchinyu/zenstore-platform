"use client";

import React, { useState } from "react";
import { useAppDispatch } from "../../../hooks/redux";
import { useCarousel } from "../../../hooks/useCarousel";
import CarouselItemForm from "../../../components/CarouselEditor/CarouselItemForm";
import CarouselPreview from "../../../components/CarouselEditor/CarouselPreview";
import CarouselItemList from "../../../components/CarouselEditor/CarouselItemList";
import { fetchCarouselItems } from "../../../store/carouselSlice";
import { CarouselItem } from "../../../types/carousel/carouselType";
import ConfirmDialog from "../../../components/ui/ConfirmDialog/ConfirmDialog";
import { useToast } from "../../../components/ui/Toast";

export default function CarouselPage() {
  const dispatch = useAppDispatch();
  const {
    items,
    loading,
    error,
    selectedItem,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
    handleReorderItems,
    handleUpdateItemOrder,
    selectItem,
  } = useCarousel();

  const { showToast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [deleteItemIndex, setDeleteItemIndex] = useState<number | null>(null);

  const handleSubmit = async (item: CarouselItem) => {
    if (isEditing && selectedItem) {
      try {
        await handleUpdateItem({ ...item, ID: selectedItem.ID });
        showToast({
          type: "success",
          title: "更新成功",
          message: "輪播圖項目已成功更新",
          duration: 3000,
        });
        dispatch(fetchCarouselItems()); // 重新獲取最新數據
        setIsEditing(false);
        selectItem(null);
      } catch (error) {
        showToast({
          type: "error",
          title: "更新失敗",
          message: "輪播圖項目更新失敗，請稍後再試",
          duration: 3000,
        });
      }
    } else {
      try {
        await handleAddItem(item);
        showToast({
          type: "success",
          title: "新增成功",
          message: "輪播圖項目已成功新增",
          duration: 3000,
        });
        dispatch(fetchCarouselItems()); // 重新獲取最新數據
        setIsAdding(false);
      } catch (error) {
        showToast({
          type: "error",
          title: "新增失敗",
          message: "輪播圖項目新增失敗，請稍後再試",
          duration: 3000,
        });
      }
    }
  };

  const handleEdit = (item: CarouselItem) => {
    selectItem(item);
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    selectItem(null);
  };

  const handleDelete = async (id: number, index: number) => {
    setDeleteItemId(id);
    setDeleteItemIndex(index);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteItemId !== null) {
      try {
        await handleDeleteItem(deleteItemId, deleteItemIndex || 0);
        showToast({
          type: "success",
          title: "刪除成功",
          message: "輪播圖項目已成功刪除",
          duration: 3000,
        });
        dispatch(fetchCarouselItems()); // 重新獲取最新數據
        setShowDeleteConfirm(false);
        setDeleteItemId(null);
        setDeleteItemIndex(null);
      } catch (error) {
        showToast({
          type: "error",
          title: "刪除失敗",
          message: "輪播圖項目刪除失敗，請稍後再試",
          duration: 3000,
        });
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteItemId(null);
    setDeleteItemIndex(null);
  };

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">輪播圖設定</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">輪播圖預覽</h5>
            </div>
            <div className="card-body p-0">
              <CarouselPreview items={items} />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">輪播項目列表</h5>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setIsAdding(true);
                  setIsEditing(false);
                  selectItem(null);
                }}
                disabled={isAdding || isEditing}
              >
                <i className="bi bi-plus"></i> 新增輪播
              </button>
            </div>
            <div className="card-body">
              <CarouselItemList
                items={items}
                onEdit={handleEdit}
                onEditOrder={handleUpdateItemOrder}
                onDelete={handleDelete}
                onReorder={handleReorderItems}
              />
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
                  {isEditing ? "編輯輪播項目" : "新增輪播項目"}
                </h5>
              </div>
              <div className="card-body">
                <CarouselItemForm
                  item={selectedItem || undefined}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isEditing={isEditing}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        show={showDeleteConfirm}
        title="刪除確認"
        message="確定要刪除此輪播項目嗎？"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="刪除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
}
