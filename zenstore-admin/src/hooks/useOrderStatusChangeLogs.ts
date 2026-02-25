import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchOrderStatusChangeLogs } from "@/store/orderSlice";

export const useOrderStatusChangeLogs = (orderId: string | null) => {
  const dispatch = useAppDispatch();
  const { statusChangeLogs, statusChangeLogsLoading, statusChangeLogsError } =
    useAppSelector((state) => state.order);

  const refreshLogs = useCallback(() => {
    if (orderId) {
      dispatch(fetchOrderStatusChangeLogs(orderId));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (orderId) {
      refreshLogs();
    }
  }, [orderId, refreshLogs]);

  return {
    logs: statusChangeLogs,
    isLoading: statusChangeLogsLoading,
    error: statusChangeLogsError,
    refreshLogs,
  };
};
