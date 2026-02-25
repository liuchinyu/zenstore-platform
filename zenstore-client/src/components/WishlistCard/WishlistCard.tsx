import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { removeFromWishlist } from "@/store/wishlistSlice";
import { WishlistItem } from "@/types";
import { ProductListSkeleton } from "@/components/ProductSkeleton/ProductSkeleton";
import { useToast } from "@/hooks/useToast";
import ConfirmModal, {
  ConfirmModalRef,
} from "@/components/ConfirmModal/ConfirmModal";
import { useCart } from "@/hooks/useCart";
import LoadingLink from "@/components/LoadingLink/LoadingLink";

interface WishlistCardProps {
  wishlistItems: WishlistItem[];
  member_id: string;
}

const WishlistCard = ({ wishlistItems, member_id }: WishlistCardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const { handleSingleAddToCart } = useCart();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    product_id: string;
  } | null>(null);

  const confirmModalRef = useRef<ConfirmModalRef>(null);

  // 確認資料載入
  useEffect(() => {
    if (wishlistItems && wishlistItems.length > 0) {
      setIsLoading(false);
    }
  }, [wishlistItems]);

  const openDeleteConfirmModal = (wishlistId: number, productId: string) => {
    setItemToDelete({ id: wishlistId, product_id: productId });
    confirmModalRef.current?.open();
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await dispatch(
        removeFromWishlist({
          member_id: member_id,
          wishlist_id: itemToDelete.id,
        })
      );
      showToast(`已從收藏清單中移除「${itemToDelete.product_id}」`, "success");
    } catch (error) {
      showToast(`移除失敗：${error}`, "error");
    }
  };

  const handleAddToCart = async (item: any) => {
    try {
      const cartItem = {
        ORACLE_ID: item.ORACLE_ID,
        ORIGINAL_QUANTITY: item.FIXED_LOT_MULTIPLIER,
      };

      const emptyRef = { current: null };
      const result = await handleSingleAddToCart(
        cartItem,
        emptyRef,
        item.IMAGE_URL
      );

      if (result.success) {
        showToast(`已將「${item.PRODUCT_ID}」添加到購物車`, "success");
      }
    } catch (error) {
      console.error("加入購物車失敗:", error);
      showToast("加入購物車失敗，請稍後再試", "error");
    }
  };

  return (
    <>
      {/* 桌面版表格 */}
      <div className="d-none d-lg-block">
        <div className="table-responsive">
          <table
            className="table table-bordered text-center align-middle w-100"
            style={{ minWidth: "600px" }}
          >
            <thead className="table-secondary">
              <tr>
                <th style={{ width: "120px" }}>圖像</th>
                <th>零件編號</th>
                <th style={{ minWidth: "170px" }}>說明</th>
                <th style={{ width: "100px" }}>製造商</th>
                <th style={{ width: "90px" }}>單價</th>
                <th style={{ width: "100px" }}>庫存量</th>
                <th style={{ width: "150px" }}>最小包裝量(MPQ)</th>
                <th style={{ width: "100px" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <ProductListSkeleton count={3} />
              ) : (
                <>
                  {wishlistItems.map((item: any) => (
                    <tr key={item.WISHLIST_ID}>
                      <td>
                        <LoadingLink
                          href={`/products/${item.BRAND}/${item.ORACLE_ID}`}
                        >
                          <Image
                            src={item.IMAGE_URL}
                            alt={item.PRODUCT_ID}
                            width={100}
                            height={100}
                            style={{ width: "100%", height: "auto" }}
                            className="object-fit-contain"
                          />
                        </LoadingLink>
                      </td>
                      <td
                        style={{ fontSize: "13px", whiteSpace: "nowrap" }}
                        className="text-center"
                      >
                        <LoadingLink
                          href={`/products/${item.BRAND}/${item.ORACLE_ID}`}
                        >
                          {item.PRODUCT_ID}
                        </LoadingLink>
                      </td>
                      <td style={{ fontSize: "12px" }} className="text-start">
                        {item.DESCRIPTION}
                      </td>
                      <td>{item.BRAND}</td>
                      <td style={{ fontSize: "14px" }}>
                        NT${item.PRICE.toLocaleString("zh-TW")}
                      </td>
                      <td>{item.INVENTORY}</td>
                      <td>{item.FIXED_LOT_MULTIPLIER}</td>
                      <td>
                        <div className="d-flex justify-content-around">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleAddToCart(item)}
                            aria-label="添加到購物車"
                            tabIndex={0}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-cart-plus"
                              viewBox="0 0 16 16"
                            >
                              <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9z" />
                              <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 0h7a2 2 0 1 0 0 0h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zm3.915 10L3.102 4h10.796l-1.313 7zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                            </svg>
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              openDeleteConfirmModal(
                                item.WISHLIST_ID,
                                item.PRODUCT_ID
                              )
                            }
                            aria-label="從收藏清單移除"
                            tabIndex={0}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-trash"
                              viewBox="0 0 16 16"
                            >
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 手機版卡片 */}
      <div className="d-block d-lg-none">
        {wishlistItems.map((item: any) => (
          <div key={item.WISHLIST_ID} className="card mb-3">
            <div className="card-body">
              <div className="row">
                <div className="col-4">
                  <LoadingLink
                    href={`/products/${item.BRAND}/${item.ORACLE_ID}`}
                  >
                    <Image
                      src={item.IMAGE_URL}
                      alt={item.PRODUCT_ID}
                      width={120}
                      height={120}
                      className="img-fluid rounded"
                      style={{ objectFit: "contain" }}
                    />
                  </LoadingLink>
                </div>
                <div className="col-8">
                  <h6 className="card-title mb-1">
                    <LoadingLink
                      href={`/products/${item.BRAND}/${item.ORACLE_ID}`}
                    >
                      {item.PRODUCT_ID}
                    </LoadingLink>
                  </h6>
                  <p className="card-text small mb-1">{item.DESCRIPTION}</p>
                  <p className="card-text small text-muted mb-1">
                    製造商: {item.BRAND}
                  </p>
                  <p className="card-text small mb-2">
                    <strong>NT${item.PRICE.toLocaleString("zh-TW")}</strong>
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="small text-muted">
                      <div>庫存: {item.INVENTORY}</div>
                      <div>MPQ: {item.FIXED_LOT_MULTIPLIER}</div>
                    </div>
                    <div className="btn-group" role="group">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleAddToCart(item)}
                        aria-label="添加到購物車"
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9z" />
                          <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 0h7a2 2 0 1 0 0 0h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zm3.915 10L3.102 4h10.796l-1.313 7zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                        </svg>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() =>
                          openDeleteConfirmModal(
                            item.WISHLIST_ID,
                            item.PRODUCT_ID
                          )
                        }
                        aria-label="從收藏清單移除"
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 0 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        ref={confirmModalRef}
        title="確認刪除"
        message={
          itemToDelete
            ? `確定要從收藏清單中刪除「${itemToDelete.product_id}」嗎？`
            : ""
        }
        confirmBtnText="刪除"
        cancelBtnText="取消"
        onConfirm={handleConfirmDelete}
        onClose={() => setItemToDelete(null)}
      />
    </>
  );
};

export default WishlistCard;
