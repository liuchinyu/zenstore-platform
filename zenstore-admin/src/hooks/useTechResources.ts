import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useToast } from "@/components/ui/Toast";
import { RootState, AppDispatch } from "@/store/store";
import {
  fetchTechResources,
  createTechResource,
  updateTechResource,
  deleteTechResource,
  clearError,
} from "@/store/techResourcesSlice";
import { TechResource } from "@/types/techResources/techResourceType";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";

export const useTechResources = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  // Redux狀態
  const { resources, isLoading, error } = useAppSelector(
    (state) => state.techResources
  );

  // 本地狀態
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<TechResource | null>(
    null
  );
  const [formData, setFormData] = useState({
    TITLE: "",
    CATEGORY: "",
    DESCRIPTION: "",
    URL: "",
  });

  // 輕量級確認對話框狀態
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(
    null
  );

  // 初始化：獲取技術文章列表
  useEffect(() => {
    dispatch(fetchTechResources());
  }, [dispatch]);

  // 錯誤處理
  // useEffect(() => {
  //   if (error) {
  //     showToast(error, "error");
  //     dispatch(clearError());
  //   }
  // }, [error, showToast, dispatch]);

  // 處理關閉Modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingResource(null);
    setFormData({
      TITLE: "",
      CATEGORY: "",
      DESCRIPTION: "",
      URL: "",
    });
  };

  // 處理創建技術文章
  const handleCreate = async (data: TechResource) => {
    try {
      // 確保數據格式正確，移除可能的 undefined 值
      const createData = {
        TITLE: data.TITLE,
        CATEGORY: data.CATEGORY,
        DESCRIPTION: data.DESCRIPTION,
        URL: data.URL,
        UPLOAD_DATE: new Date().toISOString().split("T")[0],
      };

      await dispatch(createTechResource(createData)).unwrap();
      showToast({
        type: "success",
        title: "創建成功！",
        message: "技術文章創建成功！",
        duration: 3000,
      });
      handleCloseModal();
    } catch (error) {
      showToast({
        type: "error",
        title: "創建失敗",
        message: "技術文章創建失敗",
        duration: 3000,
      });
    }
    dispatch(fetchTechResources());
  };

  // 處理更新技術文章
  const handleUpdate = async (id: string, data: Partial<TechResource>) => {
    try {
      data.UPLOAD_DATE = new Date().toISOString().split("T")[0];
      await dispatch(updateTechResource({ id, data })).unwrap();
      showToast({
        type: "success",
        title: "更新成功！",
        message: "技術文章更新成功！",
        duration: 3000,
      });
      handleCloseModal();
    } catch (error) {
      showToast({
        type: "error",
        title: "更新失敗",
        message: "技術文章更新失敗",
        duration: 3000,
      });
    }
    dispatch(fetchTechResources());
  };

  // 處理刪除技術文章
  const handleDelete = async (id: string) => {
    setDeletingResourceId(id);
    setShowConfirmDialog(true);
  };

  // 確認刪除
  const handleConfirmDelete = async () => {
    if (!deletingResourceId) return;

    try {
      await dispatch(deleteTechResource(deletingResourceId)).unwrap();
      showToast({
        type: "success",
        title: "刪除成功！",
        message: "技術文章刪除成功！",
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "刪除失敗",
        message: "技術文章刪除失敗",
        duration: 3000,
      });
    } finally {
      setDeletingResourceId(null);
      setShowConfirmDialog(false);
    }
    dispatch(fetchTechResources());
  };

  // 取消刪除
  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setDeletingResourceId(null);
  };

  // 處理編輯
  const handleEdit = (resource: TechResource) => {
    setEditingResource(resource);
    setFormData({
      TITLE: resource.TITLE,
      CATEGORY: resource.CATEGORY,
      DESCRIPTION: resource.DESCRIPTION,
      URL: resource.URL,
    });
    setShowModal(true);
  };

  // 處理新增
  const handleAdd = () => {
    setEditingResource(null);
    setFormData({
      TITLE: "",
      CATEGORY: "",
      DESCRIPTION: "",
      URL: "",
    });
    setShowModal(true);
  };

  return {
    // Redux狀態
    resources,
    isLoading,
    error,

    // 本地狀態
    showModal,
    editingResource,
    formData,
    showConfirmDialog,
    handleConfirmDelete,
    handleCancelDelete,

    // 方法
    setFormData,
    handleCloseModal,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleEdit,
    handleAdd,
  };
};
