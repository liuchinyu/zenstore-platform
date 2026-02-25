import { useEffect, useRef, useState } from "react";

interface UseIsMobileOptions {
  breakpoint?: number;
  onResize?: () => void;
  onChange?: (isMobile: boolean) => void;
}

export function useIsMobile(options: UseIsMobileOptions = {}) {
  const { breakpoint = 768, onResize, onChange } = options;
  const [isMobile, setIsMobile] = useState(false);
  const lastRef = useRef(false);

  // 使用 useRef 存儲最新的回調函數
  const callbacksRef = useRef({ onResize, onChange }); //只有初次渲染會執行
  callbacksRef.current = { onResize, onChange }; //確保每次渲染都會更新

  useEffect(() => {
    const handle = () => {
      const next = window.innerWidth < breakpoint;

      setIsMobile(next);
      if (lastRef.current !== next) {
        lastRef.current = next;
        callbacksRef.current.onChange?.(next);
      }
      callbacksRef.current.onResize?.();
    };

    handle();
    window.addEventListener("resize", handle);

    return () => window.removeEventListener("resize", handle);
  }, [breakpoint]); // 只依賴 breakpoint

  return isMobile;
}
