// 產品多分類階層組件
import { useState, useEffect, useMemo } from "react";
import { Category } from "../../types/category";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { setIsMobile } from "../../store/homeProductSlice";
import { setShowSubOptions } from "@/store/headerSlice";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useDynamicReducer } from "@/hooks/useDynamicReducer";
import LoadingLink from "@/components/LoadingLink/LoadingLink";
import { selectIsMobile } from "@/store/selectors/homeProductSelectors";

interface MultiLevelMenuProps {
  categories: Category[];
  parentId: number;
  showSubOptions?: boolean; //顯示子類別
  onBack?: (level: number) => void;
  setShowOption?: (value: boolean) => void; //是否顯示主選單
}

const MultiLevelMenu = ({
  categories, //初次接收所有的產品分類
  parentId, //初次指定0，表取得第一階層分類
  showSubOptions = false,
  onBack,
  setShowOption,
}: MultiLevelMenuProps) => {
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [level, setLevel] = useState(1); //定義商品階層

  const dispatch = useAppDispatch();

  // 動態載入 homeProduct reducer
  const isHomeProductLoaded = useDynamicReducer(
    "homeProduct",
    () => import("@/store/homeProductSlice")
  );

  // 使用記憶化選擇器
  const isMobile = useAppSelector(selectIsMobile);

  // 確認螢幕寬度
  useIsMobile({
    breakpoint: 768,
    onChange: (v) => {
      // 確保 homeProduct reducer 已載入
      if (isHomeProductLoaded) {
        dispatch(setIsMobile(v));
      }
    },
  });

  // 第一次會取得第一階層的商品資料，後續取得當前元素的子元素
  const filteredSubCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    return categories.filter((category) => category.PARENT_ID === parentId);
  }, [categories, parentId]);

  // 更新子類別狀態
  useEffect(() => {
    setSubCategories(filteredSubCategories);
  }, [filteredSubCategories]);

  // 判斷當前商品是否有子元素
  const hasChildrenCheck = useMemo(() => {
    // categoryId第一次會先傳遞第一階的商品資料ID
    return (categoryId: number) => {
      // PARENT_ID === categoryId表取得當前元素的下一階層
      return categories.some((cat) => cat.PARENT_ID === categoryId);
    };
  }, [categories]);

  const handleButtonClick = (categoryId: number) => {
    if (isMobile) {
      // 取得當前元素的子元素
      const filteredCategories = categories.filter(
        (category) => category.PARENT_ID === categoryId
      );
      if (filteredCategories.length > 0) {
        setLevel(filteredCategories[0].CATEGORY_LEVEL);
        setSubCategories(filteredCategories);
        showSubOptions = true;
      }
    }
  };

  const handleBack = (parentId: number) => {
    if (isMobile) {
      let filteredCategories: Category[] = [];
      if (level == 2) {
        parentId = 0;
        const filteredCategories = categories.filter(
          (category) => category.PARENT_ID === parentId
        );
        showSubOptions = true;
        if (filteredCategories.length > 0) {
          setLevel(filteredCategories[0].CATEGORY_LEVEL);
          setSubCategories(filteredCategories);
        }
      } else if (level == 3) {
        // 取得父元素編號的產品，再取得跟父元素同階層的產品
        filteredCategories = categories.filter(
          (category) => category.CATEGORY_ID === parentId
        );
        if (filteredCategories.length > 0) {
          let last_parentId = filteredCategories[0].PARENT_ID;
          filteredCategories = categories.filter(
            (category) => category.PARENT_ID === last_parentId
          );
          showSubOptions = true;
          setLevel(filteredCategories[0].CATEGORY_LEVEL);
          setSubCategories(filteredCategories);
        }
      }
    }
  };

  return (
    <ul
      className={`submenuLevel1 ${showSubOptions ? "show" : ""}`}
      style={{ padding: "0px" }}
    >
      {/* 手機樣式 */}
      {isMobile && subCategories.length > 0 && (
        <li className="submenuItem">
          <div>
            <a
              className="d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer" }}
              onClick={() => {
                dispatch(setShowSubOptions(false));
                onBack && onBack(subCategories[0].CATEGORY_LEVEL);
                handleBack(subCategories[0].PARENT_ID);
              }}
            >
              返回
            </a>
            <hr className="border-white border" style={{ marginTop: "5px" }} />
          </div>
        </li>
      )}
      {subCategories.map((category) => {
        // 判斷當前商品是否有子元素
        const hasChildren = hasChildrenCheck(category.CATEGORY_ID);

        return (
          <li key={category.CATEGORY_ID} className="submenuItem">
            <div className="d-flex justify-content-between align-items-center">
              <LoadingLink
                href={`/products/${category.CATEGORY_TITLE}?id=${category.CATEGORY_ID}`}
                onClick={() => {
                  // 點了連結後關閉子選單
                  dispatch(setShowSubOptions(false));
                  // 保持主選單開啟
                  if (isMobile && setShowOption) {
                    setShowOption(true);
                  }
                }}
              >
                {category.CATEGORY_TITLE}
              </LoadingLink>
              {/* 如果有子類別，則顯示按鈕 ">" */}
              {hasChildren && (
                <button
                  className="btn btn-link border-0 m-0 p-0"
                  onClick={() => handleButtonClick(category.CATEGORY_ID)}
                >
                  <i className="bi bi-chevron-right text-white fa-xs"></i>
                </button>
              )}
            </div>

            {hasChildren && (
              <div className="nestedSubmenu" style={{ padding: "0px" }}>
                <MultiLevelMenu
                  categories={categories}
                  parentId={category.CATEGORY_ID}
                  showSubOptions={showSubOptions}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default MultiLevelMenu;
