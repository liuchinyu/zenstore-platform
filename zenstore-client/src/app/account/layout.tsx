"use client";

import React, { useEffect, useRef } from "react";
import AccountMenu from "@/components/AccountMenu/AccountMenu";
import { useAppSelector } from "@/hooks/redux";
import {
  selectIsAuthenticated,
  selectAuthRehydrated,
} from "@/store/selectors/authSelectors";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/useToast";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  // 關鍵：等待 Redux Persist 完成 rehydration 才做判斷
  // rehydration 完成前，isAuthenticated 是 initialState 的 false，不可信任
  const isRehydrated = useAppSelector(selectAuthRehydrated);
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const isRedirecting = useRef(false);

  // ====== 診斷 Log：追蹤每次渲染 ======
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  console.log(
    `[AccountLayout] 渲染 #${renderCountRef.current} | isRehydrated=${isRehydrated} | isAuthenticated=${isAuthenticated} | pathname=${pathname} | isRedirecting=${isRedirecting.current}`,
  );

  useEffect(() => {
    console.log("[AccountLayout] 組件掛載 (Mount)");
    return () => console.log("[AccountLayout] 組件卸載 (Unmount)");
  }, []);

  useEffect(() => {
    // AuthGuard：只有在 rehydration 完成後才做驗證
    // 這樣才能確保 isAuthenticated 的值是從 localStorage 正確恢復的
    console.log(
      `[AccountLayout][AuthGuard Effect 觸發] isRehydrated=${isRehydrated} | isAuthenticated=${isAuthenticated} | isRedirecting=${isRedirecting.current}`,
    );
    if (isRehydrated && !isAuthenticated && !isRedirecting.current) {
      isRedirecting.current = true;
      console.log(
        "[AccountLayout][AuthGuard] ⚡ 偵測到未登入，執行硬刷新跳轉 (已上鎖)",
      );
      showToast("請先登入", "error");
      window.location.replace(
        `/auth/login?redirect=${encodeURIComponent(pathname)}`,
      );
    }
  }, [isRehydrated, isAuthenticated, router, showToast, pathname]);

  // rehydration 尚未完成，或未登入（且可能正在跳轉）時，禁止渲染任何子組件
  if (!isRehydrated || !isAuthenticated || isRedirecting.current) {
    return null;
  }

  return (
    <>
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12 col-md-3 mb-4 mb-md-0">
            <AccountMenu />
          </div>
          <div className="col-12 col-md-9">{children}</div>
        </div>
      </div>
    </>
  );
}
