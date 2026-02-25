import { useState, useEffect, useMemo } from "react";
import { Category } from "../../types/category";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { setIsMobile } from "../../store/homeProductSlice";
import { setShowManufactureMenu } from "@/store/headerSlice";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useDynamicReducer } from "@/hooks/useDynamicReducer";
import LoadingLink from "@/components/LoadingLink/LoadingLink";
import { selectIsMobile } from "@/store/selectors/homeProductSelectors";

interface MultiManufactureLevel {
  categories: any[];
  parentId: number;
  showManufactureMenu?: boolean; //顯示子類別
  onBack?: (level: number) => void;
  setShowOption?: (value: boolean) => void;
}

const MultiManufactureLevel = ({
  categories,
  parentId,
  showManufactureMenu = false,
  onBack,
  setShowOption,
}: MultiManufactureLevel) => {
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [firstLine, setFirstLine] = useState(true);
  const [level, setLevel] = useState(1);

  // Mobile navigation state
  const [mobileViewItems, setMobileViewItems] = useState<any[]>([]);
  const [mobileHistory, setMobileHistory] = useState<any[][]>([]);

  const dispatch = useAppDispatch();

  const isHomeProductLoaded = useDynamicReducer(
    "homeProduct",
    () => import("@/store/homeProductSlice")
  );

  // 使用記憶化選擇器
  const isMobile = useAppSelector(selectIsMobile);

  const buildTree = (categories: any[]) => {
    // 含製造商的分類
    const manufactureMap = new Map<number, any[]>();
    categories.forEach((row) => {
      const id = row.MANUFACTURE_CATEGORYID;
      if (!manufactureMap.has(id)) {
        manufactureMap.set(id, []);
      }
      manufactureMap.get(id)!.push(row);
    });

    const result: any[] = [];

    // 子分類
    manufactureMap.forEach((manufactureRows) => {
      if (manufactureRows.length === 0) {
        return;
      }
      const categoryMap = new Map<number, any>();

      manufactureRows.forEach((row) => {
        const catId = row.PRODUCT_CATEGORY_ID;
        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, {
            category_id: catId,
            title: row.PRODUCT_CATEGORY_TITLE,
            level: row.CATEGORY_LEVEL,
            parentId:
              row.CATEGORY_LEVEL === 1
                ? row.MANUFACTURE_CATEGORYID
                : row.PARENT_ID,
            manufactureId: manufactureRows[0].MANUFACTURE_CATEGORYID,
            children: [],
          });
        }
      });

      // 儲存節點
      const roots: any[] = [];

      manufactureRows.forEach((row) => {
        const node = categoryMap.get(row.PRODUCT_CATEGORY_ID);
        if (!node) {
          return;
        }
        // 表第一層商品
        if (row.PARENT_ID === 0) {
          roots.push(node);
          return;
        }

        const parentNode = categoryMap.get(row.PARENT_ID);
        if (!parentNode) {
          roots.push(node);
          return;
        }

        parentNode.children.push(node);
      });
      const sample = manufactureRows[0];
      result.push({
        category_id: sample.MANUFACTURE_CATEGORYID,
        title: sample.MANUFACTURE_CATEGORY_TITLE,
        manufactureId: sample.MANUFACTURE_CATEGORYID,
        children: roots,
      });
    });
    return result;
  };

  const tree = useMemo(() => buildTree(categories), [categories]);

  useEffect(() => {
    if (isMobile) {
      setMobileViewItems(tree);
      setMobileHistory([]);
    }
  }, [tree, isMobile]);

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

  // 取得製造商
  const filteredSubCategories = useMemo(() => {
    if (!categories?.length) return [];

    const seen = new Set<string>();

    const uniqueManufactures = categories.reduce((acc, item) => {
      const id = item.MANUFACTURE_CATEGORYID;
      const title = item.MANUFACTURE_CATEGORY_TITLE;
      if (!id || !title) return acc;

      const key = `${id}::${title}`;
      if (seen.has(key)) return acc;

      seen.add(key);
      acc.push({
        MANUFACTURE_CATEGORYID: id,
        MANUFACTURE_CATEGORY_TITLE: title,
      });
      return acc;
    }, [] as { MANUFACTURE_CATEGORYID: number; MANUFACTURE_CATEGORY_TITLE: string }[]);

    return uniqueManufactures;
  }, [categories, parentId]);

  // 更新子類別狀態
  useEffect(() => {
    setSubCategories(filteredSubCategories);
  }, [filteredSubCategories]);

  const handleMobileExpand = (item: any) => {
    if (item.children && item.children.length > 0) {
      setMobileHistory((prev) => [...prev, mobileViewItems]);
      setMobileViewItems(item.children);
    }
  };

  const handleMobileBack = () => {
    if (mobileHistory.length > 0) {
      const prevItems = mobileHistory[mobileHistory.length - 1];
      setMobileViewItems(prevItems);
      setMobileHistory((prev) => prev.slice(0, -1));
    } else {
      dispatch(setShowManufactureMenu(false));
      if (onBack) onBack(1);
    }
  };

  const MenuItem = ({ item, isMobile, onAction, manufactureId }: any) => {
    const hasChildren = item.children && item.children.length > 0;

    return (
      <li className="submenuItem" style={{ margin: "0px" }}>
        <div className="d-flex justify-content-between align-items-center">
          <LoadingLink
            href={`/products/${item.title}?id=${item.category_id}&manufactureId=${manufactureId}`}
            onClick={() => {
              if (onAction) onAction();
              // Close menu on link click if needed
              dispatch(setShowManufactureMenu(false));
              if (isMobile && setShowOption) {
                setShowOption(true);
              }
            }}
          >
            {item.title}
          </LoadingLink>

          {/* Mobile Expand Button */}
          {isMobile && hasChildren && (
            <button
              className="btn btn-link border-0 m-0 p-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMobileExpand(item);
              }}
            >
              <i className="bi bi-chevron-right text-white fa-xs"></i>
            </button>
          )}

          {/* Desktop Arrow (visual only, hover handles expand) */}
          {!isMobile && hasChildren && (
            <i className="bi bi-chevron-right text-white fa-xs"></i>
          )}
        </div>

        {/* Desktop Recursive Rendering */}
        {!isMobile && hasChildren && (
          <ul className="nestedSubmenu">
            {item.children.map((child: any) => (
              <MenuItem
                key={child.category_id}
                item={child}
                isMobile={isMobile}
                onAction={onAction}
                manufactureId={manufactureId}
              />
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <ul
      className={`submenuLevel1 ${showManufactureMenu ? "show" : ""}`}
      style={{ padding: "0px" }}
    >
      {/* Mobile Back Button */}
      {isMobile && (
        <li className="submenuItem">
          <div>
            <a
              className="d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer" }}
              onClick={handleMobileBack}
            >
              返回
            </a>
            <hr className="border-white border" style={{ marginTop: "5px" }} />
          </div>
        </li>
      )}

      {/* Render Items */}
      {(isMobile ? mobileViewItems : tree).map((item) => (
        <MenuItem
          key={item.category_id}
          item={item}
          isMobile={isMobile}
          manufactureId={item.manufactureId}
        />
      ))}
    </ul>
  );
};

export default MultiManufactureLevel;
