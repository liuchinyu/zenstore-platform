import React from "react";
import { CarouselItem } from "../../types/carousel/carouselType";

interface CarouselItemListProps {
  items: CarouselItem[];
  onEdit: (item: CarouselItem) => void;
  onEditOrder: (id: number, display_order: number, change: number) => void;
  onDelete: (id: number, index: number) => void;
  onReorder: (items: CarouselItem[]) => void;
}

export const CarouselItemList: React.FC<CarouselItemListProps> = ({
  items,
  onEdit,
  onEditOrder,
  onDelete,
  onReorder,
}) => {
  const handleMoveUp = (item: CarouselItem, index: number) => {
    if (index <= 0) return;
    const newItems = [...items];
    // 先取得當前資料
    const temp = newItems[index];
    const targetItem = newItems[index - 1];

    // 交換項目位置
    newItems[index] = targetItem;
    newItems[index - 1] = temp;

    // 使用目標位置的顯示順序，而不是項目自身的順序減1
    onReorder(newItems);
    onEditOrder(temp?.ID || 0, index - 1, -1);
  };

  const handleMoveDown = (item: CarouselItem, index: number) => {
    if (index >= items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index];
    const targetItem = newItems[index + 1];

    // 交換項目位置
    newItems[index] = targetItem;
    newItems[index + 1] = temp;

    // 使用目標位置的顯示順序，而不是項目自身的順序加1
    onReorder(newItems);
    onEditOrder(temp?.ID || 0, index + 1, 1);
  };

  if (items.length === 0) {
    return (
      <div className="text-center p-3 bg-light border rounded">
        <p className="mb-0">尚未新增輪播項目</p>
      </div>
    );
  }

  return (
    <div className="list-group">
      {items.map((item, index) => (
        <div
          key={item.ID}
          className="list-group-item d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <div
              className="me-3"
              style={{
                width: "50px",
                height: "50px",
                backgroundImage: `url(${item.IMAGE_URL})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "1px solid #dee2e6",
              }}
            ></div>
            <div>
              <h6 className="mb-0">{item.TITLE}</h6>
              <small className="text-muted">
                {item.DESCRIPTION.substring(0, 30)}
                {item.DESCRIPTION.length > 30 ? "..." : ""}
              </small>
            </div>
          </div>
          <div className="btn-group">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => handleMoveUp(item, index)}
              disabled={index === 0}
            >
              <i className="bi bi-arrow-up"></i>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => handleMoveDown(item, index)}
              disabled={index === items.length - 1}
            >
              <i className="bi bi-arrow-down"></i>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => onEdit(item)}
            >
              <i className="bi bi-pencil"></i>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(item.ID || 0, index)}
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CarouselItemList;
