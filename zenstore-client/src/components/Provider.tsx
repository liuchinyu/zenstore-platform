"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store/store";
import { ReactNode } from "react";
import CartModal from "./CartModal/CartModal";
import ToastManager from "./Toast/ToastManager";
import AuthInitializer from "./AuthInitializer/AuthInitializer";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      {/* Provider 使整個 App 裡的所有組件都能透過 useSelector 取得資料/ useDispatch 更改資料 */}
      <PersistGate loading={null} persistor={persistor}>
        {/* PersistGate 使資料在重新載入時能保持不變 */}
        <AuthInitializer />
        {children}
        <CartModal />
        <ToastManager />
      </PersistGate>
    </Provider>
  );
}
