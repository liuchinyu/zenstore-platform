import React from "react";
import LoadingLink from "@/components/LoadingLink/LoadingLink";

const EmptyWishlist = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="mb-4 text-center"></div>
      <h3 className="mb-3 text-center">您的收藏清單目前沒有商品</h3>
      <p className="text-muted mb-4 text-center">
        瀏覽我們的產品並將您喜歡的商品添加到收藏清單中
      </p>
      <LoadingLink href="/products" passHref>
        <button className="btn btn-primary">
          <i className="bi bi-shop me-2"></i>瀏覽商品
        </button>
      </LoadingLink>
    </div>
  );
};

export default EmptyWishlist;
