"use client";
import React from "react";
import { fetchSaleProducts } from "@/store/productSlice";
import { useProductCarousel } from "@/hooks/useProductCarousel";
import ProductCard from "@/components/ProductCard/ProductCard";
import { selectSaleProducts } from "@/store/selectors/productSelector";
import LoadingLink from "@/components/LoadingLink/LoadingLink";

interface SaleProductsProps {
  isProductLoaded: boolean;
}

const SectionContainer = ({
  children,
  title = "特價商品",
}: {
  children: React.ReactNode;
  title?: string;
}) => (
  <div className="container-fluid mt-3 border border-dark py-3">
    <div className="row">
      <div className="col-12 mb-2">
        <h2 className="w-100 text-start h4">{title}</h2>
      </div>
      {children}
    </div>
  </div>
);

const SaleProducts = ({ isProductLoaded }: SaleProductsProps) => {
  const {
    cardContainerRef,
    currentPosition,
    products,
    productsLoading,
    productsError,
    needCarousel,
    handlePrev,
    handleNext,
    getMaxScroll,
  } = useProductCarousel({
    fetchProducts: fetchSaleProducts,
    productsSelector: selectSaleProducts,
  });

  if (!isProductLoaded) {
    return (
      <div
        className="container my-5 text-center"
        role="status"
        aria-label="載入中"
      >
        <div className="spinner-border text-primary" />
        <p className="mt-2 text-muted">熱門商品載入中...</p>
      </div>
    );
  }

  if (productsLoading) {
    return (
      <SectionContainer>
        <div className="col-12 text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">載入中...</span>
          </div>
        </div>
      </SectionContainer>
    );
  }

  if (productsError) {
    return (
      <SectionContainer>
        <div className="col-12 text-center py-5">
          <div className="alert alert-danger" role="alert">
            {productsError}
          </div>
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <div className="col position-relative px-1 px-sm-5">
        {needCarousel && (
          <button
            className="btn position-absolute start-0 top-50 translate-middle-y arrowBtn"
            onClick={handlePrev}
            disabled={currentPosition === 0}
            aria-label="查看上一個商品"
            type="button"
          >
            <i className="bi bi-chevron-left fs-1" aria-hidden="true"></i>
          </button>
        )}

        <div className="cardWrapper">
          <div
            ref={cardContainerRef}
            className="cardContainer"
            style={{
              transform: `translateX(${currentPosition}px)`,
            }}
          >
            {products.map((product: any) => (
              <ProductCard key={product.ORACLE_ID} product={product} />
            ))}
          </div>
        </div>

        {needCarousel && (
          <button
            className="btn position-absolute end-0 top-50 translate-middle-y arrowBtn"
            onClick={handleNext}
            disabled={currentPosition <= getMaxScroll()}
            aria-label="查看下一個商品"
            type="button"
          >
            <i className="bi bi-chevron-right fs-1" aria-hidden="true"></i>
          </button>
        )}
      </div>
      <div className="col-12 mt-4 text-center">
        <LoadingLink
          href="/products"
          className="btn btn-warning text-white fw-bold"
        >
          瀏覽更多{">"}
        </LoadingLink>
      </div>
    </SectionContainer>
  );
};

export default SaleProducts;
