import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import {
  fetchMarqueeItems,
  addMarqueeItem,
  updateMarqueeItem,
  deleteMarqueeItem,
  activateMarquee,
  deactivateMarquee,
  reorderMarqueeItems,
} from "../store/marqueeSlice";
import { MarqueeItem } from "../types/marquee/marqueeType";

export const useMarquee = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((s: RootState) => s.marquee);
  const [selectedItem, setSelectedItem] = useState<MarqueeItem | null>(null);

  useEffect(() => {
    dispatch(fetchMarqueeItems());
  }, [dispatch]);

  const handleAdd = async (item: Omit<MarqueeItem, "ID">) => {
    const res = await dispatch(addMarqueeItem(item));
    if (addMarqueeItem.rejected.match(res)) {
      throw new Error((res.payload as string) || "新增跑馬燈失敗");
    }
    await dispatch(fetchMarqueeItems());
    return res.payload;
  };

  const handleUpdate = async (item: MarqueeItem) => {
    const res = await dispatch(updateMarqueeItem(item));
    if (updateMarqueeItem.rejected.match(res)) {
      throw new Error((res.payload as string) || "更新跑馬燈失敗");
    }
    await dispatch(fetchMarqueeItems());
    return res.payload;
  };

  const handleDelete = async (id: number) => {
    const res = await dispatch(deleteMarqueeItem(id));
    if (deleteMarqueeItem.rejected.match(res)) {
      throw new Error((res.payload as string) || "刪除跑馬燈失敗");
    }
    await dispatch(fetchMarqueeItems());
    return res.payload;
  };

  // 啟用跑馬燈
  const handleActivate = async (id: number) => {
    const res = await dispatch(activateMarquee(id));
    if (activateMarquee.rejected.match(res)) {
      throw new Error((res.payload as string) || "啟用跑馬燈失敗");
    }
    await dispatch(fetchMarqueeItems());
    return res.payload;
  };

  // 停用跑馬燈
  const handleDeactivate = async (id: number) => {
    const res = await dispatch(deactivateMarquee(id));
    if (deactivateMarquee.rejected.match(res)) {
      throw new Error((res.payload as string) || "停用跑馬燈失敗");
    }
    await dispatch(fetchMarqueeItems());
    return res.payload;
  };

  const handleReorder = (list: MarqueeItem[]) => {
    dispatch(reorderMarqueeItems(list));
  };

  const selectItem = (item: MarqueeItem | null) => setSelectedItem(item);

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
    handleReorder,
    selectItem,
  };
};
