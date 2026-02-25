import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useToast } from "@/components/ui/Toast";
import {
  fetchNews,
  createNews,
  updateNews,
  deleteNews,
  clearError,
} from "@/store/newsSlice";
import { News } from "@/types/news/newsType";

export const useNews = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  // Redux狀態
  const {
    news: resources,
    isLoading,
    error,
  } = useAppSelector((state) => state.news);

  // 本地狀態
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<News | null>(null);
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

  // 初始化：獲取新聞列表
  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  // 錯誤處理
  useEffect(() => {
    if (error) {
      showToast({
        type: "error",
        title: "錯誤",
        message: error,
        duration: 3000,
      });
      dispatch(clearError());
    }
  }, [error, showToast, dispatch]);

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

  // 處理創建新聞
  const handleCreate = async (data: News) => {
    try {
      // 確保數據格式正確，移除可能的 undefined 值
      const createData = {
        TITLE: data.TITLE,
        CATEGORY: data.CATEGORY,
        DESCRIPTION: data.DESCRIPTION,
        URL: data.URL,
        UPLOAD_DATE: new Date().toISOString().split("T")[0],
      };

      await dispatch(createNews(createData)).unwrap();
      showToast({
        type: "success",
        title: "創建成功！",
        message: "新聞創建成功！",
        duration: 3000,
      });
      handleCloseModal();
    } catch (error) {
      showToast({
        type: "error",
        title: "創建失敗",
        message: "新聞創建失敗",
        duration: 3000,
      });
    }
    dispatch(fetchNews());
  };

  // 處理更新新聞
  const handleUpdate = async (id: string, data: Partial<News>) => {
    try {
      data.UPLOAD_DATE = new Date().toISOString().split("T")[0];
      await dispatch(updateNews({ id, data })).unwrap();
      showToast({
        type: "success",
        title: "更新成功！",
        message: "新聞更新成功！",
        duration: 3000,
      });
      handleCloseModal();
    } catch (error) {
      showToast({
        type: "error",
        title: "更新失敗",
        message: "新聞更新失敗",
        duration: 3000,
      });
    }
    dispatch(fetchNews());
  };

  // 處理刪除新聞
  const handleDelete = async (id: string) => {
    setDeletingResourceId(id);
    setShowConfirmDialog(true);
  };

  // 確認刪除
  const handleConfirmDelete = async () => {
    if (!deletingResourceId) return;

    try {
      await dispatch(deleteNews(deletingResourceId)).unwrap();
      showToast({
        type: "success",
        title: "刪除成功！",
        message: "新聞刪除成功！",
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "刪除失敗",
        message: "新聞刪除失敗",
        duration: 3000,
      });
    } finally {
      setDeletingResourceId(null);
      setShowConfirmDialog(false);
    }
  };

  // 取消刪除
  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setDeletingResourceId(null);
  };

  // 處理編輯
  const handleEdit = (resource: News) => {
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
