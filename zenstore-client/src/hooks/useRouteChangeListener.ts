"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppDispatch } from "./redux";
import { setIsNavigating } from "@/store/headerSlice";

export const useRouteChangeListener = () => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    dispatch(setIsNavigating(false));
    // pathname 或 query 改變後，確保關閉全域 Loading
  }, [pathname, searchParams, dispatch]);
};
