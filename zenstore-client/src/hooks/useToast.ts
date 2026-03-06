import { useCallback, useRef } from "react";
import { useAppDispatch } from "@/hooks/redux";
import { addToast } from "@/store/toastSlice";

type ToastType = "success" | "error" | "warning" | "info";

// 全域鎖：防止因為組件 Remount 導致的重複 Toast 觸發
let globalLastToast: { message: string; timestamp: number } | null = null;

export const useToast = () => {
  const dispatch = useAppDispatch();

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const now = Date.now();
      if (
        globalLastToast?.message === message &&
        now - globalLastToast.timestamp < 3000
      ) {
        return;
      }
      dispatch(addToast({ id: now, type, message }));
      globalLastToast = { message, timestamp: now };
    },
    [dispatch],
  );

  return { showToast };
};
