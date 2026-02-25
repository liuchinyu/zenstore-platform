import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import {
  fetchStoreInfoItems,
  addStoreInfoItem,
  updateStoreInfoItem,
  deleteStoreInfoItem,
  activateStoreInfo,
  deactivateStoreInfo,
} from "../store/storeInfoSlice";
import { StoreInfo } from "../types/storeInfo/storeInfoType";

export const useStoreInfo = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((s: RootState) => s.storeInfo);
  const [selectedItem, setSelectedItem] = useState<StoreInfo | null>(null);

  useEffect(() => {
    dispatch(fetchStoreInfoItems());
  }, [dispatch]);

  const handleAdd = async (item: Omit<StoreInfo, "ID">) => {
    const res = await dispatch(addStoreInfoItem(item));
    if (addStoreInfoItem.rejected.match(res)) {
      throw new Error((res.payload as string) || "新增商場資訊失敗");
    }
    await dispatch(fetchStoreInfoItems());
    return res.payload;
  };

  const handleUpdate = async (item: StoreInfo) => {
    const res = await dispatch(updateStoreInfoItem(item));
    if (updateStoreInfoItem.rejected.match(res)) {
      throw new Error((res.payload as string) || "更新商場資訊失敗");
    }
    await dispatch(fetchStoreInfoItems());
    return res.payload;
  };

  const handleDelete = async (id: number) => {
    const res = await dispatch(deleteStoreInfoItem(id));
    if (deleteStoreInfoItem.rejected.match(res)) {
      throw new Error((res.payload as string) || "刪除商場資訊失敗");
    }
    await dispatch(fetchStoreInfoItems());
    return res.payload;
  };

  // 啟用商場資訊
  const handleActivate = async (id: number) => {
    const res = await dispatch(activateStoreInfo(id));
    if (activateStoreInfo.rejected.match(res)) {
      throw new Error((res.payload as string) || "啟用商場資訊失敗");
    }
    await dispatch(fetchStoreInfoItems());
    return res.payload;
  };

  // 停用商場資訊
  const handleDeactivate = async (id: number) => {
    const res = await dispatch(deactivateStoreInfo(id));
    if (deactivateStoreInfo.rejected.match(res)) {
      throw new Error((res.payload as string) || "停用商場資訊失敗");
    }
    await dispatch(fetchStoreInfoItems());
    return res.payload;
  };

  const selectItem = (item: StoreInfo | null) => setSelectedItem(item);

  return {
    items,
    loading,
    error,
    selectedItem,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleActivate,
    handleDeactivate,
    selectItem,
  };
};
