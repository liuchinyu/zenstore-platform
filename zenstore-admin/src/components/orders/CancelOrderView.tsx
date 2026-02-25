"use client";
import Link from "next/link";
import { useState } from "react";
import { cancelOrders } from "@/hooks/useCancelOrders";
import OrderFilterModal from "@/components/OrderFilterModal/OrderFilterModal";
import PaginationComponent from "@/components/ui/Pagination/PaginationComponent";
import {
  OrderStatusTransform,
  PaymentStatusTransform,
  ShippingStatusTransform,
} from "@/utils/OrderStatusTransform";
import styles from "@/app/orders/styles/order.module.scss";

interface CancelOrderViewProps {
  mode: "pending" | "approved";
}

const CancelOrderView = ({ mode }: CancelOrderViewProps) => {
  const {
    cancelOrder, //待處理
    cancelPermitOrder, //已審核
    totalCancelPages,
    totalCancelPermitPages,
    searchTerm,
    setSearchTerm,
    filterOptions,
    currentPage,
    applyFilters,
    resetFilters,
    handleSearch,
    handlePageChange,
  } = cancelOrders(mode);

  const [showFilterModal, setShowFilterModal] = useState(false);

  // 依據 mode 決定要顯示的資料
  const orders = mode === "pending" ? cancelOrder : cancelPermitOrder;
  const totalPages =
    mode === "pending" ? totalCancelPages : totalCancelPermitPages;
  const titleSuffix = mode === "pending" ? "(待處理)" : "(已審核)";

  return (
    <div className="container-fluid p-4">
      <h1 className="mb-4">
        取消訂單<span className="h4">{titleSuffix}</span>
      </h1>

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
          <button
            className="btn btn-primary me-3"
            onClick={() => setShowFilterModal(true)}
          >
            篩選
          </button>
        </div>
      </div>

      {/* 訂單表格 */}
      <div className="row">
        <div className="col-12">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>訂單編號</th>
                <th>訂單日期</th>
                <th>客戶姓名</th>
                <th>會員身分</th>
                <th>訂單狀態</th>
                <th>付款狀態</th>
                <th>出貨狀態</th>
                <th>訂單金額</th>
                <th>訂單備註</th>
                <th>退貨原因</th>
              </tr>
            </thead>
            <tbody>
              {orders?.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-muted py-5">
                    無訂單資料
                  </td>
                </tr>
              ) : (
                orders?.map((order: any) => (
                  <tr key={order.ORDER_ID}>
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
                    <td>
                      {order.FINAL_AMOUNT
                        ? `NT$${order.FINAL_AMOUNT.toLocaleString()}`
                        : "-"}
                    </td>
                    <td>{order.NOTES}</td>
                    <td>{order.CANCEL_REASON}</td>
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
        show={showFilterModal}
        mode="cancel"
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
    </div>
  );
};

export default CancelOrderView;
