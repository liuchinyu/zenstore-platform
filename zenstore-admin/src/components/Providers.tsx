"use client";

import { Provider } from "react-redux";
import { store } from "../store/store";
import { ReactNode } from "react";
import { ToastProvider } from "./ui/Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ToastProvider position="top-right">{children}</ToastProvider>
    </Provider>
  );
}
