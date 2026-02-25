import { useState } from "react";
import OrderService from "@/services/orderService";
// import { OrderType } from "@/types/orders/order";
import { useToast } from "@/components/ui/Toast";

export const useOrderStatusEdit = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [originalOrderStatus, setOriginalOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [originalPaymentStatus, setOriginalPaymentStatus] = useState("");
  const [shipmentStatus, setShipmentStatus] = useState("");
  const [originalShipmentStatus, setOriginalShipmentStatus] = useState("");

  const { showToast } = useToast();

  const openModal = (order: any) => {
    setSelectedOrder(order);
    // setOrderStatus(order.order_status);
    // setPaymentStatus(order.payment_status || "");
    // setShipmentStatus(order.shipping_status || "");
    setShowModal(true);
  };

  const handleApply = async () => {
    if (!selectedOrder) return;

    try {
      // 建構條件性更新物件
      const updateData: any = {
        order_id: selectedOrder,
        // 新增：記錄原始狀態用於變動記錄
        // original_status: {
        //   order_status: selectedOrder.order_status,
        //   payment_status: selectedOrder.payment_status || "",
        //   shipping_status: selectedOrder.shipping_status || "",
        // },
      };

      // 只有當值不為 undefined 且不為空字串時才加入物件
      if (orderStatus !== undefined && orderStatus !== "") {
        updateData.order_status = orderStatus;
      }
      if (paymentStatus !== undefined && paymentStatus !== "") {
        updateData.payment_status = paymentStatus;
      }
      if (shipmentStatus !== undefined && shipmentStatus !== "") {
        updateData.shipping_status = shipmentStatus;
      }

      const result = await OrderService.updateOrderStatus(updateData);
      if (result.success) {
        showToast({
          type: "success",
          title: "更新成功",
          message: "訂單狀態已更新",
          duration: 3000,
        });
        window.location.href = "/orders";
      }
      setShowModal(false);
    } catch (error) {
      showToast({
        type: "error",
        title: "更新失敗",
        message: "訂單狀態更新失敗",
        duration: 2000,
      });
      console.error("更新訂單狀態失敗:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setOrderStatus("");
    setPaymentStatus("");
    setShipmentStatus("");
  };

  return {
    showModal,
    selectedOrder,
    orderStatus,
    paymentStatus,
    shipmentStatus,
    setOrderStatus,
    setOriginalOrderStatus,
    setPaymentStatus,
    setOriginalPaymentStatus,
    setShipmentStatus,
    setOriginalShipmentStatus,
    openModal,
    handleApply,
    closeModal,
  };
};
