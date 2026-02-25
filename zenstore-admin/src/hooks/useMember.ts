import { useEffect, useMemo, useState, useCallback } from "react";
import { usePagination } from "@/hooks/usePagination";
import { MemberFilterOptions } from "@/components/MemberFilterModal/MemberFilterModal";
import { useGetMembersQuery } from "@/store/api/memberApi";

export const useMember = () => {
  // 分頁相關函數
  const { currentPage, itemsPerPage, setTotalItems, handlePageChange } =
    usePagination(1, 100);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]); //選取的會員

  // 篩選設定
  const [filterOptions, setFilterOptions] = useState<MemberFilterOptions>({
    registrationDateStart: "",
    registrationDateEnd: "",
    memberType: "",
    verificationStatus: "",
    accountStatus: "",
    memberGroup: null,
  });

  // 準備查詢參數
  // const queryParams = useMemo(
  //   () => ({
  //     page: currentPage,
  //     pageSize: itemsPerPage,
  //     filters: {
  //       ...filterOptions,
  //       keyword: searchTerm ? searchTerm : undefined,
  //     },
  //   }),
  //   [currentPage, itemsPerPage, filterOptions, searchTerm], // 注意：這裡將searchTerm也納入依賴，如果想要按下搜尋才觸發，則需調整
  // );

  // 原本邏輯是 handleSearch 才更新 filters 裡的 keyword。
  // 但為了與 RTK Query 整合，我們可以選擇：
  // 1. 維持 filterOptions 內含 keyword (Original Logic)
  // 2. 直接依賴 searchTerm (更即時)
  // 為了保持 "handleSearch" 的行為 (即按下按鈕才搜尋)，我們應該只在 filterOptions 變更時才查詢。
  // 但原代碼 handleSearch 會把 searchTerm 塞進 filterOptions。
  // 所以 queryParams 應該依賴 filterOptions 即可。

  const activeQueryParams = useMemo(
    () => ({
      page: currentPage,
      pageSize: itemsPerPage,
      filters: filterOptions,
    }),
    [currentPage, itemsPerPage, filterOptions],
  );

  const { data, isLoading, isFetching } = useGetMembersQuery(activeQueryParams);
  console.log("data", data);

  const memberList = data?.data || [];
  const totalMemberCount = data?.totalCount || 0;

  // 更新分頁總數
  useEffect(() => {
    setTotalItems(totalMemberCount);
  }, [totalMemberCount, setTotalItems]);

  // 套用篩選
  const applyFilters = useCallback(
    (passedFilters?: MemberFilterOptions) => {
      const currentFilters = passedFilters || filterOptions;
      setFilterOptions(currentFilters);
      handlePageChange(1);
    },
    [filterOptions, handlePageChange],
  );

  // 處理搜尋並套用篩選
  const handleSearch = useCallback(() => {
    // 將 keyword 加入 filters
    const updatedFilters = { ...filterOptions, keyword: searchTerm };
    applyFilters(updatedFilters);
  }, [filterOptions, searchTerm, applyFilters]);

  // 重置篩選
  const resetFilters = useCallback(() => {
    const defaultFilters: MemberFilterOptions = {
      registrationDateStart: "",
      registrationDateEnd: "",
      memberType: "",
      verificationStatus: "",
      accountStatus: "",
      memberGroup: null,
    };
    setFilterOptions(defaultFilters);
    setSearchTerm("");
    applyFilters(defaultFilters);
  }, [applyFilters]);

  // 計算總頁數
  const totalPages = Math.ceil(totalMemberCount / itemsPerPage);

  return {
    totalPages,
    memberList,
    searchTerm,
    setSearchTerm,
    filterOptions,
    setFilterOptions,
    selectedMembers,
    setSelectedMembers,
    currentPage,
    itemsPerPage,
    applyFilters,
    resetFilters,
    handleSearch,
    handlePageChange,
    isLoading: isLoading || isFetching,
  };
};
