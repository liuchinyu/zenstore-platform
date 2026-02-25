"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./SidebarMenu.module.scss";
import clsx from "clsx";

const SidebarMenu: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<number[]>([]);

  // 切換子菜單展開/收起狀態
  const toggleSubmenu = (id: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setExpandedMenus((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // 導航到指定路徑
  const navigateTo = (path: string, event: React.MouseEvent) => {
    event.preventDefault();
    router.push(path);
  };

  // 判斷菜單項是否為當前路徑或其子路徑
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      id: 1,
      title: "首頁",
      path: "/",
      highlight: true,
      icon: "bi-house-door",
    },
    {
      id: 2,
      title: "主畫面設定",
      path: "/content",
      highlight: true,
      icon: "bi-database",
      hasSubmenu: true,
      submenuItems: [
        {
          id: 21,
          title: "跑馬燈",
          path: "/content/marquee",
          icon: "bi-sliders",
        },
        {
          id: 22,
          title: "技術資源",
          path: "/content/technical-resources",
          icon: "bi-diagram-3",
        },
        {
          id: 23,
          title: "輪播圖",
          path: "/content/carousel",
          icon: "bi-images",
        },
        {
          id: 24,
          title: "商場資訊",
          path: "/content/store-info",
          icon: "bi-building",
        },
        {
          id: 25,
          title: "最新消息",
          path: "/content/news",
          icon: "bi-newspaper",
        },
        {
          id: 26,
          title: "公告欄",
          path: "/content/announcements",
          icon: "bi-megaphone",
        },
      ],
    },
    {
      id: 3,
      title: "商品管理",
      path: "/products/management",
      highlight: true,
      icon: "bi-box-seam",
      hasSubmenu: true,
      submenuItems: [
        {
          id: 31,
          title: "商品分類樹",
          path: "/products/productCategoryCreate",
          icon: "bi-diagram-3",
        },
        {
          id: 32,
          title: "製造商分類樹",
          path: "/products/manufactureCategoryCreate",
          icon: "bi-building",
        },
        {
          id: 33,
          title: "標籤列表",
          path: "/products/tags",
          icon: "bi-tags",
        },
      ],
    },
    {
      id: 7,
      title: "訂單管理",
      path: "/orders",
      highlight: true,
      icon: "bi-cart",
      hasSubmenu: true,
      submenuItems: [
        {
          id: 71,
          title: "退貨申請單(待處理)",
          path: "/orders/cancelPending",
          icon: "bi-shield-slash",
        },
        {
          id: 72,
          title: "退貨單(已審核)",
          path: "/orders/canceled",
          icon: "bi-ban",
        },
      ],
    },
    {
      id: 8,
      title: "物流管理",
      path: "/logistics",
      highlight: true,
      icon: "bi-truck",
    },
    {
      id: 9,
      title: "財務管理",
      path: "/finance",
      highlight: true,
      icon: "bi-cash-stack",
    },
    {
      id: 10,
      title: "客戶管理",
      path: "/customers/members",
      highlight: true,
      icon: "bi-people",
      hasSubmenu: true,
      submenuItems: [
        {
          id: 101,
          title: "會員群組設定",
          path: "/customers/groups",
          icon: "bi-person-add",
        },
        {
          id: 102,
          title: "訊息中心",
          path: "http://localhost:3002/",
          icon: "bi-chat-square-text",
        },
      ],
    },
  ];

  const renderMenuItem = (item: any) => {
    // 有子菜單的項目
    if (item.hasSubmenu) {
      const isExpanded = expandedMenus.includes(item.id);

      return (
        <div key={item.id} className={styles.menuItemContainer}>
          <div
            className={clsx(
              styles.menuItem,
              isActive(item.path) && styles.active,
              item.highlight && styles.highlighted,
              isExpanded && styles.expanded,
            )}
            tabIndex={0}
            role="button"
            aria-expanded={isExpanded}
            aria-label={item.title}
            onClick={(e) => navigateTo(item.path, e)}
          >
            <div className={styles.itemContent}>
              <i className={clsx("bi", item.icon, styles.menuIcon)}></i>
              <span>{item.title}</span>
              <div
                className={styles.toggleButton}
                onClick={(e) => toggleSubmenu(item.id, e)}
              >
                <i
                  className={clsx(
                    "bi",
                    isExpanded ? "bi-chevron-down" : "bi-chevron-right",
                    styles.submenuIcon,
                  )}
                ></i>
              </div>
            </div>
          </div>

          {isExpanded && (
            <div className={styles.submenuContainer}>
              {item.submenuItems.map((subItem: any) => (
                <Link
                  href={subItem.path}
                  key={subItem.id}
                  className={clsx(
                    styles.submenuItem,
                    isActive(subItem.path) && styles.active,
                  )}
                  aria-label={subItem.title}
                  tabIndex={0}
                >
                  <div className={styles.itemContent}>
                    <i
                      className={clsx("bi", subItem.icon, styles.menuIcon)}
                    ></i>
                    <span>{subItem.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    // 沒有子菜單的普通項目
    return (
      <Link
        href={item.path}
        key={item.id}
        className={clsx(
          styles.menuItem,
          isActive(item.path) && styles.active,
          item.highlight && styles.highlighted,
        )}
        aria-label={item.title}
        tabIndex={0}
      >
        <div className={styles.itemContent}>
          <i className={clsx("bi", item.icon, styles.menuIcon)}></i>
          <span>{item.title}</span>
        </div>
      </Link>
    );
  };

  return (
    <div
      className={clsx(styles.sidebarMenu, isCollapsed && styles.collapsed)}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      {menuItems.map(renderMenuItem)}
    </div>
  );
};

export default SidebarMenu;
