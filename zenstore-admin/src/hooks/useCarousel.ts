import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import {
  fetchCarouselItems,
  addCarouselItem,
  updateCarouselItem,
  deleteCarouselItem,
  reorderCarouselItems,
  updateCarouselItemOrder,
} from "../store/carouselSlice";
import { CarouselItem } from "../types/carousel/carouselType";

export const useCarousel = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector(
    (state: RootState) => state.carousel
  );
  const [selectedItem, setSelectedItem] = useState<CarouselItem | null>(null);

  // 在組件加載時獲取輪播項目
  useEffect(() => {
    dispatch(fetchCarouselItems());
  }, [dispatch]);

  const handleAddItem = async (item: Omit<CarouselItem, "id">) => {
    try {
      const resultAction = await dispatch(addCarouselItem(item));
      if (addCarouselItem.rejected.match(resultAction)) {
        throw new Error((resultAction.payload as string) || "新增輪播項目失敗");
      }
      return resultAction.payload;
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateItem = async (item: CarouselItem) => {
    try {
      const resultAction = await dispatch(updateCarouselItem(item));
      if (updateCarouselItem.rejected.match(resultAction)) {
        throw new Error((resultAction.payload as string) || "更新輪播項目失敗");
      }
      return resultAction.payload;
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateItemOrder = async (
    id: number,
    display_order: number,
    change: number
  ) => {
    try {
      const resultAction = await dispatch(
        updateCarouselItemOrder({ id, display_order, change })
      );
      if (updateCarouselItemOrder.rejected.match(resultAction)) {
        throw new Error(
          (resultAction.payload as string) || "更新輪播項目順序失敗"
        );
      }
      return resultAction.payload;
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteItem = async (id: number, index: number) => {
    try {
      const resultAction = await dispatch(deleteCarouselItem({ id, index }));
      if (deleteCarouselItem.rejected.match(resultAction)) {
        throw new Error((resultAction.payload as string) || "刪除輪播項目失敗");
      }
      return resultAction.payload;
    } catch (error) {
      throw error;
    }
  };

  const handleReorderItems = (newItems: CarouselItem[]) => {
    dispatch(reorderCarouselItems(newItems));
  };

  const selectItem = (item: CarouselItem | null) => {
    setSelectedItem(item);
  };

  return {
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
  };
};
