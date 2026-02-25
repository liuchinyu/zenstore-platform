import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";
import ToastContainer from "./ToastContainer";
import { ToastProps, ToastType } from "./Toast";

interface ToastContextProps {
  showToast: (options: {
    type: ToastType;
    title: string;
    message: string;
    duration?: number;
  }) => string;
  hideToast: (id: string) => void;
  clearToasts: () => void;
}

interface ToastProviderProps {
  children: ReactNode;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

// 擴展 ToastProps 但不包含 onClose 屬性
type ToastItem = Omit<ToastProps, "onClose">;

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = "top-right",
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    ({
      type,
      title,
      message,
      duration = 5000,
    }: {
      type: ToastType;
      title: string;
      message: string;
      duration?: number;
    }) => {
      const id = uuidv4();
      setToasts((prevToasts) => [
        ...prevToasts,
        { id, type, title, message, duration },
      ]);
      return id;
    },
    []
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // 將 toasts 轉換為符合 ToastProps[] 的格式
  const toastsWithOnClose = toasts.map((toast) => ({
    ...toast,
    onClose: hideToast,
  }));

  return (
    <ToastContext.Provider value={{ showToast, hideToast, clearToasts }}>
      {children}
      <ToastContainer
        toasts={toastsWithOnClose}
        position={position}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default ToastProvider;
