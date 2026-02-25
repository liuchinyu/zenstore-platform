import { useEffect, useMemo, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchCancelOrder } from "@/store/orderSlice";
import { OrderFilterOptions } from "@/components/OrderFilterModal/OrderFilterModal";
type CancelMode = "pending" | "approved";
import {
  selectCancelPermitOrder,
  selectCancelOrder,
} from "@/store/selectors/orderSelector";
import { usePagination } from "./usePagination";

// 處理待審核與已審核的取消訂單，透過mode區分，pending為待審核，approved為已審核
export const cancelOrders = (mode: CancelMode = "pending") => {
  const dispatch = useAppDispatch();
  const cancelOrder = useAppSelector(selectCancelOrder);
  const cancelPermitOrder = useAppSelector(selectCancelPermitOrder);
  const { currentPage, itemsPerPage, setTotalItems, handlePageChange } =
    usePagination(1, 100);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterOptions, setFilterOptions] = useState<OrderFilterOptions>({
    orderStatus: [],
    paymentStatus: [],
    shippingStatus: [],
    dateFrom: "",
    dateTo: "",
    customerName: "",
    memberType: [],
  });
  const [activeStatusTab, setActiveStatusTab] = useState("ALL");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const pageSize = 100;

  // 抓取資料
  const getCancelOrderList = useMemo(() => {
    return async (page = currentPage, currentFilters = filterOptions) => {
      await dispatch(
        fetchCancelOrder({
          mode,
          page,
          pageSize,
          filters: currentFilters,
        }),
      );
    };
  }, [dispatch, mode, currentPage, filterOptions]);

  // 首次載入依 mode 請求資料
  useEffect(() => {
    if (mode === "pending") {
      if (cancelOrder.length === 0) getCancelOrderList();
    } else {
      if (cancelPermitOrder?.length === 0) getCancelOrderList();
    }
  }, [mode, getCancelOrderList, cancelOrder.length, cancelPermitOrder?.length]);

  const applyFilters = useCallback(
    async (passedFilters?: OrderFilterOptions) => {
      const currentFilters = passedFilters || filterOptions;
      setFilterOptions(currentFilters);
      await getCancelOrderList(currentPage, currentFilters);
      handlePageChange(1);
    },
    [currentPage, filterOptions],
  );

  // 重置篩選
  const resetFilters = useCallback(() => {
    const defaultFilters = {
      orderStatus: [],
      paymentStatus: [],
      shippingStatus: [],
      dateFrom: "",
      dateTo: "",
      customerName: "",
      memberType: [],
    };
    setFilterOptions(defaultFilters);
    applyFilters(defaultFilters);
  }, []);

  // 處理搜尋
  const handleSearch = useCallback(() => {
    const updatedFilters = { ...filterOptions, keyword: searchTerm };
    applyFilters(updatedFilters);
  }, [searchTerm]);

  // 完整的篩選結果（未分頁）

  // 計算總頁數
  const totalCancelPages = Math.ceil(cancelOrder.length / pageSize);
  const totalCancelPermitPages = Math.ceil(cancelPermitOrder.length / pageSize);

  const statusTabs = [
    { label: "全部訂單", value: "ALL" },
    { label: "待處理", value: "PENDING" },
    { label: "處理中", value: "PROCESSING" },
    { label: "已完成", value: "COMPLETED" },
    // { label: "已取消", value: "CANCELLED" },
    // { label: "已作廢", value: "VOIDED" },
  ];

  return {
    // 完整篩選結果（用於計算總頁數和全選）
    cancelOrder,
    cancelPermitOrder,
    totalCancelPages,
    totalCancelPermitPages,
    searchTerm,
    setSearchTerm,
    filterOptions,
    setFilterOptions,
    activeStatusTab,
    setActiveStatusTab,
    selectedOrders,
    setSelectedOrders,
    currentPage,
    pageSize,
    statusTabs,
    applyFilters,
    handlePageChange,
    resetFilters,
    handleSearch,
  };
};
