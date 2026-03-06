"use client";
// 點進會員資料後的左側下拉選單，不是在Header區塊呈現的選單
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/hooks/redux";
import { fetchWishlist } from "@/store/wishlistSlice";
import { useAppSelector } from "@/hooks/redux";
import { useDynamicReducer } from "@/hooks/useDynamicReducer";
import { ExtendedRootState } from "@/store/store";
import LoadingLink from "@/components/LoadingLink";
import { selectMemberId } from "@/store/selectors/authSelectors";

const AccountMenu = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(
    (state) => state.auth?.isAuthenticated,
  );
  const member_id = useAppSelector(selectMemberId);

  const wishlistItems = useAppSelector(
    (state: ExtendedRootState) => state.wishlist?.items || [],
  );

  const isInitialized = useAppSelector(
    (state: ExtendedRootState) => state.wishlist?.isInitialized,
  );

  // 僅負責初始化抓取收藏清單（增加初始化檢查防止重複抓取）
  useEffect(() => {
    if (isAuthenticated && member_id && !isInitialized) {
      dispatch(fetchWishlist(member_id));
    }
  }, [isAuthenticated, member_id, isInitialized, dispatch]);

  const menuItems = [
    {
      id: 1,
      title: "帳號資料",
      icon: "fa-regular fa-user",
      path: "/account/profile",
      badge: null,
    },
    {
      id: 2,
      title: "修改密碼",
      icon: "fa-solid fa-key",
      path: "/account/updatePassword",
      badge: null,
    },
    {
      id: 3,
      title: "收貨人資料管理",
      icon: "fa-solid fa-truck",
      path: "/account/addresses",
      badge: null,
    },
    {
      id: 4,
      title: "訂購紀錄",
      icon: "fa-regular fa-clipboard",
      path: "/account/orders",
      badge: null,
    },
    {
      id: 5,
      title: "收藏清單",
      icon: "fa-regular fa-heart",
      path: "/account/wishlist",
      badge: wishlistItems.length > 0 ? wishlistItems.length : null,
    },
    {
      id: 6,
      title: "優惠券",
      icon: "fa-solid fa-ticket",
      path: "/account/coupons",
      badge: null,
    },
    // {
    //   id: 7,
    //   title: "訊息中心",
    //   icon: "fa-regular fa-lightbulb",
    //   path: "/account/messages",
    //   badge: null,
    // },
  ];

  return (
    <div className="accountMenu mb-4">
      {menuItems.map((item) => (
        <LoadingLink
          href={item.path}
          key={item.id}
          className={`menuItem d-flex align-items-center border-bottom py-3 text-decoration-none ${
            pathname == item.path ? "activeBackground" : ""
          }`}
          aria-label={item.title}
          tabIndex={0}
        >
          <div className="d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center">
              <div className="iconContainer me-3 text-center">
                <i className={`${item.icon} icon`}></i>
              </div>
              <span className="text-dark">{item.title}</span>
            </div>
          </div>
        </LoadingLink>
      ))}
    </div>
  );
};

export default AccountMenu;
