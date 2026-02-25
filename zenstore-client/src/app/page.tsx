"use client";

import dynamic from "next/dynamic";
import { useDynamicReducer } from "@/hooks/useDynamicReducer";

const LoadingSpinner = () => (
  <div className="d-flex justify-content-center py-5" aria-live="polite">
    <div className="spinner-border" role="status" aria-label="Loading"></div>
  </div>
);

const TextMarquee = dynamic(
  () => import("@/components/TextMarquee/TextMarquee"),
  {
    ssr: false, // 禁用服務器渲染
    loading: () => <LoadingSpinner />, //組件載入完成前顯示
  },
);
const Carousel = dynamic(() => import("@/components/Carousel/Carousel"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const StoreInfo = dynamic(() => import("@/components/StoreInfo/StoreInfo"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const News = dynamic(() => import("@/components/News/News"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});
const HotProducts = dynamic(
  () => import("@/components/HotProducts/HotProducts"),
  { ssr: false, loading: () => <LoadingSpinner /> },
);
const NewProducts = dynamic(
  () => import("@/components/NewProducts/NewProducts"),
  { ssr: false, loading: () => <LoadingSpinner /> },
);
const SaleProducts = dynamic(
  () => import("@/components/SaleProducts/SaleProducts"),
  { ssr: false, loading: () => <LoadingSpinner /> },
);
const Brands = dynamic(() => import("@/components/Brands/Brands"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

export default function Home() {
  // 載入 content reducer
  const isContentLoaded = useDynamicReducer(
    "content",
    () => import("@/store/contentSlice"),
  );
  const isProductLoaded = useDynamicReducer(
    "product",
    () => import("@/store/productSlice"),
  );

  return (
    <>
      <TextMarquee defaultSpeedMs={8000} isContentLoaded={isContentLoaded} />
      <Carousel isContentLoaded={isContentLoaded} />
      <StoreInfo isContentLoaded={isContentLoaded} />
      <News isContentLoaded={isContentLoaded} />
      <HotProducts isProductLoaded={isProductLoaded} />
      <NewProducts isProductLoaded={isProductLoaded} />
      <SaleProducts isProductLoaded={isProductLoaded} />
      <Brands />
    </>
  );
}
