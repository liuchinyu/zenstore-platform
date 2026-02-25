import { useEffect, useMemo, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchOrderList } from "@/store/orderSlice";
import { OrderFilterOptions } from "@/components/OrderFilterModal/OrderFilterModal";
import { selectOrders } from "@/store/selectors/orderSelector";
import { usePagination } from "@/hooks/usePagination";

export const useOrders = () => {
  const dispatch = useAppDispatch();
  const orderList = useAppSelector(selectOrders);

  const [searchTerm, setSearchTerm] = useState("");

  const { currentPage, itemsPerPage, setTotalItems, handlePageChange } =
    usePagination(1, 100);

  // 篩選state
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

  const filterByStatus = (status: any) => {
    if (status === "ALL") return resetFilters();
    const statusFilter = { ...filterOptions, orderStatus: [status] };
    applyFilters(statusFilter);
  };

  const getOrderList = useCallback(
    async (page = currentPage, currentFilters = filterOptions) => {
      await dispatch(
        fetchOrderList({
          page,
          pageSize: itemsPerPage,
          filters: currentFilters,
        }),
      );
    },
    [currentPage, itemsPerPage, filterOptions],
  );

  // 取得訂單
  useEffect(() => {
    if (orderList.length === 0) getOrderList();
  }, [getOrderList]);

  // 套用篩選
  const applyFilters = useCallback(
    async (passedFilters?: OrderFilterOptions) => {
      const currentFilters = passedFilters || filterOptions;
      setFilterOptions(currentFilters);
      await getOrderList(currentPage, currentFilters);
      handlePageChange(1);
    },
    [currentPage, filterOptions],
  );

  // 記錄搜尋資料並透過applyFilters套用到篩選(keyword)
  const handleSearch = useCallback(() => {
    const updatedFilters = { ...filterOptions, keyword: searchTerm };
    applyFilters(updatedFilters);
  }, [searchTerm]);

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

  // 計算總頁數
  const totalPages = Math.ceil(orderList.length / itemsPerPage);

  const statusTabs = [
    { label: "全部訂單", value: "ALL" },
    { label: "待處理", value: "PENDING" },
    { label: "處理中", value: "PROCESSING" },
    { label: "已完成", value: "COMPLETED" },
    // { label: "已取消", value: "CANCELLED" },
    // { label: "已作廢", value: "VOIDED" },
  ];

  return {
    totalPages,
    orderList,
    searchTerm,
    setSearchTerm,
    filterOptions,
    setFilterOptions,
    activeStatusTab,
    setActiveStatusTab,
    selectedOrders,
    setSelectedOrders,
    currentPage,
    itemsPerPage,
    statusTabs,
    applyFilters,
    resetFilters,
    filterByStatus,
    handleSearch,
    handlePageChange,
  };
};
