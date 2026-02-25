import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { addToast } from "@/store/toastSlice";

type ToastType = "success" | "error" | "warning" | "info";

export const useToast = () => {
  const dispatch = useDispatch();
  const lastToastRef = useRef<{ message: string; timestamp: number } | null>(
    null
  );

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const now = Date.now();
      if (
        lastToastRef.current?.message === message &&
        now - lastToastRef.current.timestamp < 3000
      ) {
        return;
      }
      dispatch(addToast({ id: now, type, message }));
      lastToastRef.current = { message, timestamp: now };
    },
    [dispatch]
  );

  return { showToast };
};
