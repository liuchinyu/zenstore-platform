"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
// import { selectWishlistItems, fetchWishlist } from "@/store/wishlistSlice";
import { useAppSelector } from "@/hooks/redux";
import styles from "./AccountMenu.module.scss";

const AccountMenu: React.FC = () => {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  //   const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  //   const wishlistItems = useAppSelector((state) => state.wishlist.items);
  //   const user = useAppSelector((state) => state.auth.user);
  //   const member_id = user?.MEMBER_ID;
  //   useEffect(() => {
  //     if (isAuthenticated) {
  //       dispatch(fetchWishlist(member_id));
  //     }
  //   }, [isAuthenticated]);

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
      title: "追蹤清單",
      icon: "fa-regular fa-heart",
      path: "/account/wishlist",
      //   badge: wishlistItems.length > 0 ? wishlistItems.length : null,
    },
    {
      id: 6,
      title: "優惠券",
      icon: "fa-solid fa-ticket",
      path: "/account/coupons",
      badge: null,
    },
    {
      id: 7,
      title: "訊息中心",
      icon: "fa-regular fa-lightbulb",
      path: "/account/messages",
      badge: null,
    },
  ];

  return (
    <div className={`${styles.accountMenu} mb-4`}>
      {menuItems.map((item) => (
        <Link
          href={item.path}
          key={item.id}
          className={`${
            styles.menuItem
          } d-flex align-items-center border-bottom py-3 text-decoration-none ${
            pathname == item.path ? styles.activeBackground : ""
          }`}
          aria-label={item.title}
          tabIndex={0}
        >
          <div className="d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center">
              <div className={`${styles.iconContainer} me-3 text-center`}>
                <i className={`${item.icon} ${styles.icon}`}></i>
              </div>
              <span className="text-dark">{item.title}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default AccountMenu;
