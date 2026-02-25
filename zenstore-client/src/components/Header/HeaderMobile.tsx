import { useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import LoadingLink from "../LoadingLink";
import Image from "next/image";
import { Search } from "../Search";

import {
  setShowSubOptions,
  setShowTechMenu,
  setShowManufactureMenu,
  setShowAccountMenu,
} from "../../store/headerSlice";

import {
  selectShowSubOptions,
  selectShowTechMenu,
  selectShowManufactureMenu,
  selectShowAccountMenu,
  selectShowOffcanvas,
  selectCategories,
  selectManufactureCategories,
} from "@/store/selectors/headerSelectors";

import { selectContentTechResources } from "@/store/selectors/contentSelector";

import MultiLevelMenu from "../MultiLevelMenu/MultiLevelMenu";
import MultiManufactureLevel from "../MultiManufactureLevel/MultiManufactureLevel";
import AccountMenu from "@/components/Header/AccountOptions";
import CartButton from "@/components/Header/CartButton";
import NavigationItemMobile from "@/components/Header/NavigationItemMobile";
import { useNavigationMobile } from "@/hooks/useNavigationMobile";

const HeaderMobile = () => {
  const dispatch = useAppDispatch();

  const showSubOptions = useAppSelector(selectShowSubOptions);
  const showTechMenu = useAppSelector(selectShowTechMenu);
  const showManufactureMenu = useAppSelector(selectShowManufactureMenu);
  const showAccountMenu = useAppSelector(selectShowAccountMenu);
  const categories = useAppSelector(selectCategories);
  const manufactureCategories = useAppSelector(selectManufactureCategories);
  const techResources = useAppSelector(selectContentTechResources);
  const [showOption, setShowOption] = useState(true); //控制導覽列選單是否呈現

  const handleAccountMenuToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(setShowAccountMenu(!showAccountMenu));
    },
    [dispatch, showAccountMenu],
  );

  const { handleNavigationClick, handleBack } = useNavigationMobile({
    showOption,
    setShowOption,
  });

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
          </div>
        </div>
        <nav
          className="navbar navbar-expand-md bg-body-tertiary mt-2 bgColor"
          data-bs-theme="dark"
        >
          <div className="container-fluid position-relative justify-content-start">
            <div className="nav-md-1">
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

            {/* 手機版用戶操作區域 會員、購物車、收藏清單按鈕*/}
            <div className="nav-md-3 d-flex justify-content-end align-items-center">
              <div
                className="position-relative"
                data-account-menu-root
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="btn p-0 pe-1"
                  onClick={handleAccountMenuToggle}
                >
                  <i className="bi bi-person fa-2x"></i>
                </button>
                <AccountMenu isMobile={true} />
              </div>

              <CartButton isMobile={true} />

              <button className="btn p-0">
                <LoadingLink
                  href="/account/wishlist"
                  // className="text-dark text-decoration-none"
                >
                  <i className="fa-brands fa-gratipay fa-2x text-white"></i>
                </LoadingLink>
              </button>
            </div>

            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                {/* 產品導航 */}
                <li className="nav-item position-relative">
                  {/* 透過NavigationItem 調整class類別 */}
                  <NavigationItemMobile
                    showOption={showOption}
                    onClick={handleProductClick}
                    iconOnClick={(e) => {
                      e.preventDefault();
                      dispatch(setShowSubOptions(!showSubOptions));
                      setShowOption(false);
                    }}
                  >
                    產品
                  </NavigationItemMobile>

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
                  <NavigationItemMobile
                    showOption={showOption}
                    onClick={handleManufactureClick}
                    iconOnClick={(e) => {
                      e.preventDefault();
                      dispatch(setShowManufactureMenu(!showManufactureMenu));
                      setShowOption(false);
                    }}
                  >
                    製造商
                  </NavigationItemMobile>

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
                  <NavigationItemMobile
                    showOption={showOption}
                    onClick={handleTechClick}
                    iconOnClick={(e) => {
                      e.preventDefault();
                      dispatch(setShowTechMenu(!showTechMenu));
                      setShowOption(false);
                    }}
                  >
                    技術資源
                  </NavigationItemMobile>

                  {/* 技術資源下拉選單 */}
                  <ul
                    className={`${"submenuLevel1"} ${
                      showTechMenu ? "show" : ""
                    }`}
                    style={{ backgroundColor: "#1f4e79 !important" }}
                  >
                    <li className="submenuItem">
                      <a
                        className="dropdown-item"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          dispatch(setShowTechMenu(false));
                          setShowOption(true);
                        }}
                      >
                        返回
                      </a>
                      <hr
                        className="border-white border"
                        style={{ marginTop: "5px" }}
                      />
                    </li>

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
    </>
  );
};

export default HeaderMobile;
