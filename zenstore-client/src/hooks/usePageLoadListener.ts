// src/hooks/usePageLoadListener.ts
"use client";

import { useEffect } from "react";
import { useAppDispatch } from "./redux";
import { setIsNavigating } from "@/store/headerSlice";

export const usePageLoadListener = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handlePageLoad = () => {
      dispatch(setIsNavigating(false));
    };

    if (document.readyState === "complete") {
      handlePageLoad();
    } else {
      window.addEventListener("load", handlePageLoad);
    }

    return () => {
      window.removeEventListener("load", handlePageLoad);
    };
  }, [dispatch]);
};
