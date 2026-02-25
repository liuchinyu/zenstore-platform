// src/hooks/useProductCarousel.ts
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "./redux";
import { useIsMobile } from "./useIsMobile";
import { ExtendedRootState } from "@/store/store";
import { shallowEqual } from "react-redux";

interface UseProductCarouselOptions {
  fetchProducts: () => void;
  productsSelector: (state: ExtendedRootState) => {
    products: any[];
    productsLoading: boolean;
    productsError: string | null;
  };
}

export function useProductCarousel({
  fetchProducts,
  productsSelector,
}: UseProductCarouselOptions) {
  const dispatch = useAppDispatch();

  // 使用 shallowEqual 作為比較函數，確保只有當選擇器結果實際變化時才重新渲染
  const productData = useAppSelector(productsSelector, shallowEqual);
  const { products, productsLoading, productsError } = productData;

  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts() as any);
    }
  }, [dispatch, products, fetchProducts]);

  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [cardWidth, setCardWidth] = useState<number>(0);

  const handleResize = useCallback(() => {
    if (!cardContainerRef.current) return;
    const newCardWidth =
      cardContainerRef.current.offsetWidth / (window.innerWidth < 768 ? 3 : 6);
    setCardWidth(newCardWidth);

    if (!products) return;

    const newMaxScroll = -(
      newCardWidth *
      (products.length - (window.innerWidth < 768 ? 3 : 6))
    );
    setCurrentPosition((position) =>
      Math.max(newMaxScroll, Math.min(0, position))
    );
  }, [products]);

  const isMobile = useIsMobile({
    breakpoint: 768,
    onResize: handleResize,
  });

  const recalculate = useCallback(() => {
    if (!cardContainerRef.current) return;

    const newCardWidth =
      cardContainerRef.current.offsetWidth / (window.innerWidth < 768 ? 3 : 6);
    setCardWidth(newCardWidth);

    if (!products) return;

    // 計算滾動距離
    const newMaxScroll = -(
      newCardWidth *
      (products.length - (window.innerWidth < 768 ? 3 : 6))
    );
    setCurrentPosition((position) =>
      Math.max(newMaxScroll, Math.min(0, position))
    );
  }, [products]);

  useEffect(() => {
    recalculate();
  }, [recalculate]);

  const needCarousel = useMemo(() => {
    return products && products.length > (isMobile ? 3 : 6);
  }, [products, isMobile]);

  const getMaxScroll = useCallback(() => {
    if (!products) return 0;
    return -(cardWidth * (products.length - (isMobile ? 3 : 6)));
  }, [products, cardWidth, isMobile]);

  const handlePrev = useCallback(() => {
    const newPosition = Math.min(currentPosition + cardWidth, 0);
    setCurrentPosition(newPosition);
  }, [currentPosition, cardWidth]);

  const handleNext = useCallback(() => {
    const maxScroll = getMaxScroll();
    const newPosition = Math.max(currentPosition - cardWidth, maxScroll);
    setCurrentPosition(newPosition);
  }, [currentPosition, cardWidth, getMaxScroll]);

  // 使用 useMemo 記憶化返回值，避免不必要的重新渲染
  return useMemo(
    () => ({
      cardContainerRef,
      currentPosition,
      products,
      productsLoading,
      productsError,
      needCarousel,
      handlePrev,
      handleNext,
      getMaxScroll,
    }),
    [
      currentPosition,
      products,
      productsLoading,
      productsError,
      needCarousel,
      handlePrev,
      handleNext,
      getMaxScroll,
    ]
  );
}
