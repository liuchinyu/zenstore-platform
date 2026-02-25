"use client";

import { useAppSelector } from "../../hooks/redux";
import useHeaderInit from "@/hooks/useHeaderInit";
import CartModal from "../CartModal/CartModal";

// 匯入Homeproduct選擇器
import { selectIsMobile } from "@/store/selectors/homeProductSelectors";
import dynamic from "next/dynamic";

// 定義Chatwoot的window物件
declare global {
  interface Window {
    chatwootSDK: {
      run: (config: {
        websiteToken: string;
        baseUrl: string;
        position?: string;
      }) => void;
    };
    $chatwoot: {
      toggle: () => void;
      setUser: (
        identifier: string,
        user: { name?: string; email?: string; identifier_hash?: string },
      ) => void;
      reset: () => void;
      toggleBubbleVisibility: (action: "show" | "hide") => void;
    };
    chatwootSettings: {
      hideMessageBubble: boolean;
      position: string;
      type: string;
    };
    __chatwoot_initialized: boolean;
  }
}
const HeaderMobile = dynamic(() => import("./HeaderMobile"), {
  ssr: false,
});
const HeaderDesktop = dynamic(() => import("./HeaderDesktop"), {
  ssr: false,
});

const Header = () => {
  useHeaderInit();
  const isMobile = useAppSelector(selectIsMobile);

  return (
    <>
      {!isMobile ? <HeaderDesktop /> : <HeaderMobile />}
      <CartModal />
    </>
  );
};

export default Header;
