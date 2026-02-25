import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useToast } from "@/components/ui/Toast";
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  clearError,
} from "@/store/announcementSlice";
import { Announcement } from "@/types/announcements/announcementType";

export const useAnnouncements = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  // Redux狀態
  const {
    announcements: resources,
    isLoading,
    error,
  } = useAppSelector((state) => state.announcements);

  // 本地狀態
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Announcement | null>(
    null
  );
  const [formData, setFormData] = useState({
    TITLE: "",
    CATEGORY: "最新消息",
    CONTENT: "",
    STATUS: 1,
    PUBLISH_DATE: new Date().toISOString().split("T")[0],
    END_DATE: "",
  });

  // 輕量級確認對話框狀態
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(
    null
  );

  // 初始化：獲取公告列表
  useEffect(() => {
    dispatch(fetchAnnouncements());
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
      CATEGORY: "最新消息",
      CONTENT: "",
      STATUS: 1,
      PUBLISH_DATE: new Date().toISOString().split("T")[0],
      END_DATE: "",
    });
  };

  // 處理創建公告
  const handleCreate = async (data: Announcement) => {
    try {
      // 確保數據格式正確，移除可能的 undefined 值
      const createData = {
        TITLE: data.TITLE,
        CONTENT: data.CONTENT,
        STATUS: data.STATUS,
        CATEGORY: data.CATEGORY,
        PUBLISH_DATE:
          data.PUBLISH_DATE || new Date().toISOString().split("T")[0],
        END_DATE: data.END_DATE || "",
      };

      await dispatch(createAnnouncement(createData)).unwrap();
      showToast({
        type: "success",
        title: "創建成功！",
        message: "公告創建成功！",
        duration: 3000,
      });
      dispatch(fetchAnnouncements());
      handleCloseModal();
    } catch (error) {
      showToast({
        type: "error",
        title: "創建失敗",
        message: "公告創建失敗",
        duration: 3000,
      });
    }
  };

  // 處理更新公告
  const handleUpdate = async (id: string, data: Partial<Announcement>) => {
    try {
      await dispatch(updateAnnouncement({ id, data })).unwrap();
      showToast({
        type: "success",
        title: "更新成功！",
        message: "公告更新成功！",
        duration: 3000,
      });
      dispatch(fetchAnnouncements());
      handleCloseModal();
    } catch (error) {
      showToast({
        type: "error",
        title: "更新失敗",
        message: "公告更新失敗",
        duration: 3000,
      });
    }
  };

  // 處理刪除公告
  const handleDelete = async (id: string) => {
    setDeletingResourceId(id);
    setShowConfirmDialog(true);
  };

  // 確認刪除
  const handleConfirmDelete = async () => {
    if (!deletingResourceId) return;

    try {
      await dispatch(deleteAnnouncement(deletingResourceId)).unwrap();
      showToast({
        type: "success",
        title: "刪除成功！",
        message: "公告刪除成功！",
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "刪除失敗",
        message: "公告刪除失敗",
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
  const handleEdit = (resource: Announcement) => {
    setEditingResource(resource);
    setFormData({
      TITLE: resource.TITLE,
      CONTENT: resource.CONTENT,
      STATUS: resource.STATUS,
      CATEGORY: resource.CATEGORY,
      PUBLISH_DATE:
        resource.PUBLISH_DATE || new Date().toISOString().split("T")[0],
      END_DATE: resource.END_DATE || "",
    });
    setShowModal(true);
  };

  // 處理新增
  const handleAdd = () => {
    setEditingResource(null);
    setFormData({
      TITLE: "",
      CATEGORY: "最新消息",
      CONTENT: "",
      STATUS: 1,
      PUBLISH_DATE: new Date().toISOString().split("T")[0],
      END_DATE: "",
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
