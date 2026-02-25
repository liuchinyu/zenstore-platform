"use client";

import React from "react";
import { useAppSelector } from "@/hooks/redux";
import SimpleLoadingIndicator from "../SimpleLoadingIndicator";
import { useRouteChangeListener } from "@/hooks/useRouteChangeListener";

const GlobalLoading = () => {
  const { isNavigating, navigationText } = useAppSelector((state) => ({
    isNavigating: state.header?.isNavigating,
    navigationText: state.header?.navigationText,
  }));

  // usePageLoadListener();
  useRouteChangeListener();

  if (!isNavigating) {
    return null;
  }

  return <SimpleLoadingIndicator text={navigationText} />;
};

export default GlobalLoading;
