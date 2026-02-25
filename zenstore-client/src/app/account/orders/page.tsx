"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { fetchOrders } from "@/store/orderSlice";
import {
  OrderStatusTransform,
  PaymentStatusTransform,
  ShippingStatusTransform,
} from "@/utils/OrderStatusTransform";
import { useDynamicReducer } from "@/hooks/useDynamicReducer";
import dynamic from "next/dynamic";
import LoadingLink from "@/components/LoadingLink/LoadingLink";
import { selectMemberId } from "@/store/selectors/authSelectors";
import {
  selectOrders,
  selectOrdersLoading,
} from "@/store/selectors/orderSelector";
import { useToast } from "@/hooks/useToast";

// 動態導入 DatePicker
const DatePickerWrapper = dynamic(
  () => import("@/components/DatePicker/DatePickerWrapper"),
  {
    ssr: false,
    loading: () => <div className="form-control">載入中...</div>,
  }
);

//若將OrderRow放置在Orders函數內部，當Orders重新渲染的時候OrderRow就會重新創建
const OrderRow = React.memo(
  ({
    row,
  }: {
    row: {
      id: string;
      date: string;
      amount: string;
      payment: string;
      orderStatus: React.ReactNode;
      paymentStatus: React.ReactNode;
      shippingStatus: React.ReactNode;
    };
  }) => {
    return (
      <tr className="orderRow">
        <td>{row.id}</td>
        <td>{row.date}</td>
        <td>${row.amount}</td>
        <td>{row.payment}</td>
        <td>{row.orderStatus}</td>
        <td>{row.paymentStatus}</td>
        <td>{row.shippingStatus}</td>
        <td>
          <LoadingLink
            href={`/account/orders/${row.id}`}
            className="btn btn-sm btn-outline-primary"
            tabIndex={0}
            aria-label={`查看訂單 ${row.id} 詳情`}
          >
            查看詳情
          </LoadingLink>
        </td>
      </tr>
    );
  }
);
OrderRow.displayName = "OrderRow";

// 日期格式轉換
const toLocalYmd = (d: Date | null) => {
  if (!d) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function Orders() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  // 動態載入 orders reducer
  const isOrdersLoaded = useDynamicReducer(
    "orders",
    () => import("@/store/orderSlice")
  );

  const ordersData = useAppSelector(selectOrders);
  const loading = useAppSelector(selectOrdersLoading);
  const memberId = useAppSelector(selectMemberId);

  console.log("ordersData", ordersData);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [status, setStatus] = useState("");
  const [isFilter, setIsFilter] = useState(false);

  // 首次載入（或使用者登入後）：以 slice 內的 filters 取得資料
  useEffect(() => {
    if (!memberId || !isOrdersLoaded) return;
    dispatch(fetchOrders({ memberId }));
  }, [memberId, isOrdersLoaded, dispatch]);

  // 僅後端篩選：提交 -> 存 filters -> 發請求
  const handleFilter = () => {
    if (!memberId) return;
    if (startDate && endDate && startDate > endDate) {
      showToast("開始日期不能晚於結束日期", "error");
      return;
    }

    const next = {
      startDate: toLocalYmd(startDate),
      endDate: toLocalYmd(endDate),
      status: status || null,
    };

    setIsFilter(true);
    dispatch(
      fetchOrders({
        memberId,
        filters: {
          ...(next.startDate ? { startDate: next.startDate } : {}),
          ...(next.endDate ? { endDate: next.endDate } : {}),
          ...(next.status ? { status: next.status } : {}),
        },
      })
    );
  };

  const handleClearFilters = () => {
    if (!memberId) return;

    setStartDate(null);
    setEndDate(null);
    setStatus("");
    dispatch(fetchOrders({ memberId }));
  };

  // 展示列預先格式化，避免每列 render 再做轉換
  const viewRows = useMemo(() => {
    if (!Array.isArray(ordersData)) return [];
    return ordersData.map((o: any) => ({
      id: o.order_id,
      date: o.order_date,
      amount: o.final_amount.toLocaleString("zh-TW"),
      payment:
        String(o.payment_method || "").toLowerCase() === "credit_card"
          ? "信用卡"
          : "ATM",
      orderStatus: OrderStatusTransform(o.order_status),
      paymentStatus: PaymentStatusTransform(o.payment_status),
      shippingStatus: ShippingStatusTransform(o.shipping_status),
    }));
  }, [ordersData]);

  // 載入態
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">載入中...</span>
        </div>
        <p className="mt-2">載入訂單資料中...</p>
      </div>
    );
  }

  // 空態
  if (
    !loading &&
    (!Array.isArray(viewRows) || viewRows.length === 0) &&
    !isFilter
  ) {
    return (
      <div className={`orders_orderContainer container-fluid p-0`}>
        <h1 className="mb-4">訂單紀錄</h1>
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="fa-regular fa-clipboard fa-2x text-muted mb-3"></i>
            <h5>您尚未有任何訂單</h5>
            <p className="text-muted">開始購物並建立您的第一筆訂單吧！</p>
            <LoadingLink href="/products" className="btn btn-primary">
              瀏覽商品
            </LoadingLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`orders_orderContainer container-fluid p-0`}>
      <h1 className="mb-4">訂單紀錄</h1>

      {/* 篩選區 */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">篩選訂單</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="startDate" className="form-label d-block">
                開始日期
              </label>
              <DatePickerWrapper
                selected={startDate}
                onChange={(date: Date | null) => setStartDate(date)}
                id="startDate"
                name="startDate"
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="endDate" className="form-label d-block">
                結束日期
              </label>
              <DatePickerWrapper
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
                id="endDate"
                name="endDate"
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="status" className="form-label">
                訂單狀態
              </label>
              <select
                className="form-select"
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">所有狀態</option>
                <option value="PENDING">待處理</option>
                <option value="PROCESSING">處理中</option>
                <option value="CONFIRMED">已確認</option>
                <option value="COMPLETED">已完成</option>
                <option value="CANCELLED">已取消</option>
                <option value="VOIDED">已作廢</option>
              </select>
            </div>
          </div>
          <div className="d-flex justify-content-end mt-3">
            <button
              className="btn btn-outline-secondary me-2"
              onClick={handleClearFilters}
            >
              清除篩選
            </button>
            <button className="btn btn-primary" onClick={handleFilter}>
              套用篩選
            </button>
          </div>
        </div>
      </div>

      {/* 訂單列表 */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>訂單編號</th>
              <th>訂單日期</th>
              <th>金額</th>
              <th>付款方式</th>
              <th>訂單狀態</th>
              <th>付款狀態</th>
              <th>出貨狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {viewRows.map((r) => (
              <OrderRow key={r.id} row={r} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
