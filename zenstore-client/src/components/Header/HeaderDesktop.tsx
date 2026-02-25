"use client";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";

import LoadingLink from "../LoadingLink";
import { Search } from "../Search";

// 匯入Header選擇器
import {
  selectShowSubOptions,
  selectShowTechMenu,
  selectShowManufactureMenu,
  selectShowAccountMenu,
  selectShowOffcanvas,
  selectCategories,
  selectManufactureCategories,
} from "@/store/selectors/headerSelectors";

// 匯入auth選擇器
import { selectIsAuthenticated } from "@/store/selectors/authSelectors";

// 匯入Content選擇器
import { selectContentTechResources } from "@/store/selectors/contentSelector";

// 匯入headerSlice
import {
  setShowOffcanvas,
  setShowSubOptions,
  setShowTechMenu,
  setShowManufactureMenu,
  setShowAccountMenu,
} from "../../store/headerSlice";

// 匯入cartSlice
import { toggleCartModal } from "@/store/cartSlice";

// 匯入Components
import AccountMenu from "@/components/Header/AccountOptions";
import CartButton from "@/components/Header/CartButton";
import NavigationItemDesktop from "@/components/Header/NavigationItemDesktop";

// 匯入組件
import MultiLevelMenu from "../MultiLevelMenu/MultiLevelMenu";
import MultiManufactureLevel from "../MultiManufactureLevel/MultiManufactureLevel";

// 匯入hooks
import { useToast } from "@/hooks/useToast";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { useNavigationDesktop } from "@/hooks/useNavigationDesktop";

const HeaderDesktop = () => {
  const dispatch = useAppDispatch();

  // 從selector取得資料
  const showSubOptions = useAppSelector(selectShowSubOptions);
  const showTechMenu = useAppSelector(selectShowTechMenu);
  const showManufactureMenu = useAppSelector(selectShowManufactureMenu);
  const showAccountMenu = useAppSelector(selectShowAccountMenu);
  const showOffcanvas = useAppSelector(selectShowOffcanvas);
  const categories = useAppSelector(selectCategories);
  const manufactureCategories = useAppSelector(selectManufactureCategories);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const techResources = useAppSelector(selectContentTechResources);

  const { showToast } = useToast();

  // state
  const [showOption, setShowOption] = useState(true); //控制導覽列選單是否呈現

  const { redirectWithLoading } = useGlobalLoading(); // 使用全域等待動畫
  const { handleNavigationClick, handleBack } = useNavigationDesktop({
    setShowOption,
  });

  const menuStatesRef = useRef({
    showSubOptions,
    showTechMenu,
    showManufactureMenu,
    showOffcanvas,
    showAccountMenu,
  });

  // 每次狀態變化時更新 ref
  useEffect(() => {
    menuStatesRef.current = {
      showSubOptions,
      showTechMenu,
      showManufactureMenu,
      showOffcanvas,
      showAccountMenu,
    };
  }, [
    showSubOptions,
    showTechMenu,
    showManufactureMenu,
    showOffcanvas,
    showAccountMenu,
  ]);

  // useEffect
  // 點擊監聽器
  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      const states = menuStatesRef.current;
      // 檢查點擊的目標是否是漢堡選單按鈕
      const target = e.target as HTMLElement;
      const hamburgerButton = target.closest(
        '[data-bs-target="#offcanvasExample"]',
      );
      if (hamburgerButton) {
        return;
      }
      const accountRoot = target.closest("[data-account-menu-root]");
      if (accountRoot) {
        return;
      }
      let closed = false;
      if (states.showSubOptions) {
        dispatch(setShowSubOptions(false));
        setShowOption(true);
        closed = true;
      }
      if (states.showTechMenu) {
        dispatch(setShowTechMenu(false));
        setShowOption(true);
        closed = true;
      }
      if (states.showManufactureMenu) {
        dispatch(setShowManufactureMenu(false));
        setShowOption(true);
        closed = true;
      }
      if (states.showOffcanvas) {
        dispatch(setShowOffcanvas(false));
        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("padding-right");
        closed = true;
      }
      if (states.showAccountMenu) {
        dispatch(setShowAccountMenu(false));
        closed = true;
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dispatch]);

  //內部函數
  //內部聯絡資訊
  const ContactInfo = () => (
    <div className="row g-0">
      <div className="col-5"></div>
      <div className="col-7 d-flex d-none d-md-block">
        <div className="d-flex align-items-center">
          <i className="bi bi-envelope-plus fa-1x me-2 icon-sm"></i>
          <small className="icon-sm">ztstore_service@zenitron.com.tw</small>
        </div>
      </div>
      <div className="col-5"></div>
      <div className="col-7 d-flex d-none d-md-block">
        <div className="d-flex align-items-center">
          <i className="bi bi-telephone-fill fa-1x me-2 icon-sm"></i>
          <small className="icon-sm">(02)2792-8788#502</small>
        </div>
      </div>
      <div className="col-5"></div>
      <div className="col-7 d-flex d-none d-md-block">
        <button
          className="btn p-0 d-flex align-items-center"
          onClick={handleChatwootToggle}
          aria-label="開啟線上客服"
        >
          <i className="bi bi-chat-text fa-1x me-2 icon-sm"></i>
          <small className="icon-sm">線上即時客服</small>
        </button>
      </div>
    </div>
  );

  const handleChatwootToggle = () => {
    if (!isAuthenticated) {
      showToast("請先登入再使用客服功能", "info");
      return;
    }

    if (window.$chatwoot?.toggle) {
      window.$chatwoot.toggle("open");
    }
  };

  const handleAccountMenuToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(setShowAccountMenu(!showAccountMenu));
    },
    [dispatch, showAccountMenu],
  );

  const handleProductClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleNavigationClick("products", "/products");
    },
    [handleNavigationClick],
  );

  const handleManufactureClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleNavigationClick("manufacture", "/manufacture");
    },
    [handleNavigationClick],
  );

  const handleTechClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleNavigationClick("tech", "#");
    },
    [handleNavigationClick],
  );

  //產品hover行為
  const handleProductMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(setShowSubOptions(true)); //呈現產品選單
      dispatch(setShowTechMenu(false));
      dispatch(setShowOffcanvas(false));
      dispatch(setShowManufactureMenu(false));
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    },
    [dispatch],
  );

  //技術文章hover行為
  const handleTechMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(setShowSubOptions(false));
      dispatch(setShowTechMenu(true)); //呈現技術資源選單
      dispatch(setShowOffcanvas(false));
      dispatch(setShowManufactureMenu(false));
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    },
    [dispatch],
  );

  //製造商hover行為
  const handleManufactureMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(setShowSubOptions(false));
      dispatch(setShowTechMenu(false));
      dispatch(setShowOffcanvas(false));
      dispatch(setShowManufactureMenu(true)); //呈現製造商選單
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    },
    [dispatch],
  );

  return (
    <>
      <header className="header">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-md-3 d-flex align-self-end justify-content-center">
              <div className="position-relative ms-4">
                <LoadingLink href="/">
                  <Image
                    className="me-3"
                    src="/logo3.png"
                    alt="增你強線上商城"
                    width={300}
                    height={100}
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </LoadingLink>
              </div>
            </div>
            <div className="col-12 col-md-5 d-flex border-dark mb-2 position-relative">
              <Search />
            </div>
            <div className="col-4">
              <ContactInfo />
              <div
                className="d-none justify-content-between align-items-center d-md-flex"
                style={{ marginTop: "-10px" }}
              >
                <div
                  className="d-flex align-items-center position-relative"
                  data-account-menu-root
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="btn m-0 p-0 shadow-none border-0"
                    onClick={handleAccountMenuToggle}
                  >
                    <i className="bi bi-person fa-3x"></i>
                  </button>
                  <h4
                    className="h6 m-0 d-none d-md-block"
                    onClick={handleAccountMenuToggle}
                    style={{ cursor: "pointer" }}
                  >
                    我的帳號
                  </h4>
                  <AccountMenu isMobile={false} />
                </div>
                <div className="d-flex align-items-center">
                  <CartButton />
                  <button
                    onClick={() => dispatch(toggleCartModal())}
                    className="h6 m-0 d-none d-md-block text-decoration-none btn p-0"
                  >
                    購物車
                  </button>
                </div>

                <div className="d-flex align-items-center">
                  <LoadingLink
                    href="/account/wishlist"
                    className="text-dark text-decoration-none d-flex align-items-center"
                    aria-label="查看收藏清單"
                  >
                    {/* 圖標：移除 button 外層，改用間距控制 */}
                    <i className="fa-brands fa-gratipay fa-2x me-1"></i>

                    {/* 文字：h4 樣式保持，但結構更簡潔 */}
                    <span className="h6 m-0 d-none d-md-block">收藏清單</span>
                  </LoadingLink>
                </div>
              </div>
            </div>
          </div>
        </div>
        <nav
          className="navbar navbar-expand-md bg-body-tertiary mt-2 bgColor"
          data-bs-theme="dark"
        >
          <div className="container-fluid position-relative justify-content-start">
            <div className="nav-md-1">
              <button
                className="navbar-brand btn d-none d-md-block"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasExample"
                data-bs-backdrop="false"
                role="button"
                aria-controls="offcanvasExample"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  dispatch(setShowOffcanvas(true));
                }}
              >
                <i className="fa-solid fa-bars"></i>
              </button>

              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>

            {/* 側邊選單 */}
            <div
              className={`offcanvas offcanvas-start position-absolute start-0 min-vh-70 submenuLevel1 ${
                showOffcanvas ? `${"show"} top-3` : ""
              }`}
              tabIndex={-1}
              id="offcanvasExample"
              aria-labelledby="offcanvasExampleLabel"
              data-bs-backdrop="false"
              onClick={(e) => {
                e.stopPropagation();
              }}
              style={{
                // 添加調試樣式
                backgroundColor: showOffcanvas ? "red" : "blue",
                border: "2px solid yellow",
                zIndex: 9999,
              }}
            >
              <div className="offcanvas-body d-block ps-3">
                <div className="ps-2">
                  <LoadingLink
                    href="/"
                    onClick={() => {
                      dispatch(setShowOffcanvas(false));
                      document.body.style.removeProperty("overflow");
                      document.body.style.removeProperty("padding-right");
                    }}
                  >
                    其他功能一
                  </LoadingLink>
                  <hr />
                </div>
                <div className="ps-2">
                  <LoadingLink
                    href="/"
                    onClick={() => {
                      dispatch(setShowOffcanvas(false));
                      document.body.style.removeProperty("padding-right");
                    }}
                  >
                    其他功能二
                  </LoadingLink>
                  <hr />
                </div>
              </div>
            </div>

            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                {/* 產品導航 */}
                <li className="nav-item position-relative">
                  {/* 透過NavigationItem 調整class類別 */}
                  <NavigationItemDesktop
                    onClick={handleProductClick}
                    onMouseEnter={handleProductMouseEnter}
                    iconOnClick={(e) => {
                      e.preventDefault();
                      dispatch(setShowSubOptions(!showSubOptions));
                      setShowOption(false);
                    }}
                  >
                    產品
                  </NavigationItemDesktop>

                  <MultiLevelMenu
                    categories={categories}
                    parentId={0}
                    showSubOptions={showSubOptions} //顯示子類別
                    onBack={(level: number) => handleBack(level, "products")}
                    setShowOption={setShowOption} // 主導覽選單(產品、製造商、技術文章)是否顯示
                  />
                </li>

                {/* 製造商導航 */}
                <li className="nav-item position-relative">
                  <NavigationItemDesktop
                    onClick={handleManufactureClick}
                    onMouseEnter={handleManufactureMouseEnter}
                    iconOnClick={(e) => {
                      e.preventDefault();
                      dispatch(setShowManufactureMenu(!showManufactureMenu));
                      setShowOption(false);
                    }}
                  >
                    製造商
                  </NavigationItemDesktop>

                  <MultiManufactureLevel
                    categories={manufactureCategories}
                    parentId={0}
                    showManufactureMenu={showManufactureMenu}
                    onBack={(level: number) => handleBack(level, "manufacture")}
                    setShowOption={setShowOption} // 主導覽選單(產品、製造商、技術文章)是否顯示
                  />
                </li>

                {/* 技術資源導航 */}
                <li className="nav-item position-relative">
                  <NavigationItemDesktop
                    onClick={handleTechClick}
                    onMouseEnter={handleTechMouseEnter}
                    iconOnClick={(e) => {
                      e.preventDefault();
                      dispatch(setShowTechMenu(!showTechMenu));
                      setShowOption(false);
                    }}
                  >
                    技術資源
                  </NavigationItemDesktop>

                  {/* 技術資源下拉選單 */}
                  <ul
                    className={`${"submenuLevel1"} ${
                      showTechMenu ? "show" : ""
                    }`}
                    style={{ backgroundColor: "#1f4e79 !important" }}
                  >
                    {techResources &&
                      techResources.map((resource: any) => (
                        <li className="submenuItem" key={resource.TECH_ID}>
                          <a
                            className="dropdown-item"
                            href={resource.URL}
                            onClick={() => dispatch(setShowTechMenu(false))}
                          >
                            {resource.TITLE}
                          </a>
                        </li>
                      ))}
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
      {/* <CartModal /> */}
    </>
  );
};
export default HeaderDesktop;
