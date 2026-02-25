"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import OrderService from "@/services/orderService";
import OrderFilterModal from "@/components/OrderFilterModal/OrderFilterModal";
import OrderStatusEditModal from "@/components/OrderStatusEditModal/OrderStatusEditModal";
import PaginationComponent from "@/components/ui/Pagination/PaginationComponent";
import styles from "@/app/orders/styles/order.module.scss";
import { useToast } from "@/components/ui/Toast";
import {
  OrderStatusTransform,
  PaymentStatusTransform,
  ShippingStatusTransform,
} from "@/utils/OrderStatusTransform";
import { useOrderStatusEdit } from "@/hooks/useOrderStatusEdit";

// import { OrderType } from "@/types/orders/order";

const OrdersPage = () => {
  const {
    totalPages, // 總頁數
    orderList,
    searchTerm,
    setSearchTerm,
    filterOptions,
    activeStatusTab,
    setActiveStatusTab,
    selectedOrders,
    setSelectedOrders,
    currentPage,
    handlePageChange,
    statusTabs,
    applyFilters,
    resetFilters,
    filterByStatus,
    handleSearch,
  } = useOrders();

  const {
    showModal,
    orderStatus,
    paymentStatus,
    shipmentStatus,
    setOrderStatus,
    setPaymentStatus,
    setShipmentStatus,
    openModal,
    handleApply,
    closeModal,
  } = useOrderStatusEdit();

  const { showToast } = useToast();

  // 新增 Modal 顯示狀態
  const [showFilterModal, setShowFilterModal] = useState(false);

  // 在訂單列表的編輯按鈕上使用
  const handleEditOrder = (order: any) => {
    openModal(order);
  };

  return (
    <div className="container-fluid p-4">
      <h1 className="mb-4">所有訂單</h1>

      {/* 搜尋與功能列 */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="搜尋"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={handleSearch}
            >
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>
        <div className="col-md-4 text-end">
          {/* <button className="btn btn-outline-primary me-3">新增訂單</button> */}
          <button
            className="btn btn-primary me-3"
            onClick={() => setShowFilterModal(true)}
          >
            篩選
          </button>
          <div className="dropdown d-inline-block">
            <button
              className="btn btn-primary"
              id="exportImportDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-three-dots"></i>
            </button>
            <ul
              className="dropdown-menu"
              aria-labelledby="exportImportDropdown"
            >
              <li>
                <button
                  className="dropdown-item"
                  onClick={async () => {
                    const result =
                      await OrderService.exportExcel(selectedOrders);
                    if (result.success) {
                      showToast({
                        type: "success",
                        title: "匯出成功",
                        message: "Excel 檔案已成功匯出",
                      });
                    } else {
                      showToast({
                        type: "error",
                        title: "匯出失敗",
                        message: "無法匯出 Excel 檔案，請稍後再試",
                      });
                    }
                  }}
                >
                  <i className="bi bi-file-earmark-arrow-up me-2"></i>匯出 Excel
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 狀態 Tabs */}
      <div className="row mb-3">
        <div className="col-12">
          <ul className="nav nav-pills gap-2">
            {statusTabs.map((tab) => (
              <li className="nav-item" key={tab.value}>
                <button
                  className={`nav-link${
                    activeStatusTab === tab.value ? " active" : ""
                  }`}
                  style={{ borderRadius: "20px" }}
                  onClick={() => {
                    setActiveStatusTab(tab.value);
                    filterByStatus(tab.value);
                  }}
                >
                  {tab.label}
                </button>
              </li>
            ))}

            {selectedOrders.length > 0 && (
              <li className="nav-item ms-auto">
                <button
                  className={`nav-link btn btn-outline-primary ${styles.buttonStatusEdit}`}
                  onClick={() => handleEditOrder(selectedOrders)}
                >
                  編輯狀態
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* 提示訊息 */}
      {selectedOrders.length === 0 && (
        <div className="text-danger mb-3">可勾選訂單批次更新狀態</div>
      )}

      {/* 訂單表格 */}
      <div className="row">
        <div className="col-12">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="全選訂單"
                    checked={
                      selectedOrders.length === orderList.length &&
                      orderList.length > 0
                    }
                    onChange={(e) => {
                      setSelectedOrders(
                        e.target.checked
                          ? orderList.map((o: any) => o.order_id)
                          : [],
                      );
                    }}
                  />
                </th>
                <th>訂單編號</th>
                <th>訂單日期</th>
                <th>客戶姓名</th>
                <th>會員身分</th>
                <th>訂單狀態</th>
                <th>付款狀態</th>
                <th>出貨狀態</th>
                <th>配送方式</th>
                <th>訂單金額</th>
                <th>訂單備註</th>
              </tr>
            </thead>
            <tbody>
              {orderList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center text-muted py-5">
                    無訂單資料
                  </td>
                </tr>
              ) : (
                orderList.map((order: any) => (
                  <tr key={order.ORDER_ID}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`選取訂單 ${order.ORDER_ID}`}
                        checked={selectedOrders.includes(order.ORDER_ID)}
                        onChange={(e) => {
                          setSelectedOrders((prev) =>
                            e.target.checked
                              ? [...prev, order.ORDER_ID]
                              : prev.filter((id) => id !== order.ORDER_ID),
                          );
                        }}
                      />
                    </td>
                    <td>
                      <Link
                        href={`/orders/${order.ORDER_ID}`}
                        className={styles.linkItem}
                      >
                        {order.ORDER_ID}
                      </Link>
                    </td>
                    <td>{order.ORDER_DATE || "-"}</td>
                    <td>
                      <Link
                        href={`/customers/members/${order.MEMBER_ID}`}
                        className={styles.linkItem}
                      >
                        {order.USER_NAME}
                      </Link>
                    </td>
                    <td>{order.MEMBER_TYPE}</td>
                    <td>{OrderStatusTransform(order.ORDER_STATUS)}</td>
                    <td>{PaymentStatusTransform(order.PAYMENT_STATUS)}</td>
                    <td>{ShippingStatusTransform(order.SHIPPING_STATUS)}</td>
                    <td>{order.DELIVERY_METHOD || "-"}</td>
                    <td>
                      {order.FINAL_AMOUNT
                        ? `NT$${order.FINAL_AMOUNT.toLocaleString()}`
                        : "-"}
                    </td>
                    <td>
                      {order.NOTES || <span className="text-muted">-</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* 分頁元件 */}
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* 篩選 Modal */}
      <OrderFilterModal
        mode="order"
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(opts) => {
          applyFilters(opts);
          setShowFilterModal(false);
        }}
        onClear={() => {
          resetFilters();
          setShowFilterModal(false);
        }}
        initialOptions={filterOptions}
      />

      {/* 編輯狀態 Modal */}
      <OrderStatusEditModal
        show={showModal}
        selectedOrder={selectedOrders}
        orderStatus={orderStatus}
        paymentStatus={paymentStatus}
        shipmentStatus={shipmentStatus}
        onOrderStatusChange={setOrderStatus}
        onPaymentStatusChange={setPaymentStatus}
        onShipmentStatusChange={setShipmentStatus}
        onApply={handleApply}
        onClose={closeModal}
      />
    </div>
  );
};

export default OrdersPage;
