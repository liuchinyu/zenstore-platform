"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Category } from "@/types";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { fetchProductCategoriesRelation } from "@/store/headerSlice";
import {
  selectManufactureCategories,
  selectProductCategoriesRelation,
} from "@/store/selectors/headerSelectors";

interface ProductFilterProps {
  onFilterChange?: (filterData: {
    displayFirstCategories: Category[]; //大分類
    secondCategories: Category[]; //大類別底下的中分類
    filterCategoryIds: number[]; //傳遞總篩選分類
  }) => void;
  // Filter拋回給產品列表(categories_title)的篩選ID屬性
  onCategoryIdChange?: (category_id: number[]) => void;
  // 產品列表拋給左側篩選的ID屬性
  propCategoryId?: number[];
}

const ProductFilter = ({
  onFilterChange,
  onCategoryIdChange,
  propCategoryId, //從CatrgoryTitle page傳遞的麵包屑正向排序陣列
}: ProductFilterProps) => {
  const dispatch = useAppDispatch();
  const productCategoriesRelation = useAppSelector(
    selectProductCategoriesRelation
  );
  const { categories, manufactureCategories } = useAppSelector(
    (state) => state.header //categories, manufactureCategories在Header.tsx中設定
  );

  const isFirstRender = useRef(true); //是否是第一次渲染

  const onFilterChangeRef = useRef(onFilterChange);
  const onCategoryIdChangeRef = useRef(onCategoryIdChange);
  const hasFetchedRelation = useRef(false);

  // 更新 ref 的值，確保始終使用最新的回調函數
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
    onCategoryIdChangeRef.current = onCategoryIdChange;
  }, [onFilterChange, onCategoryIdChange]);

  // 取得原始的商品第一階層分類
  const firstCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    return categories.filter((category: any) => category.PARENT_ID === 0);
  }, [categories]);

  const allCategoryCounts = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    return categories.map((category: any) => category.CATEGORY_ID);
  }, [categories]);

  // 製造商第一階層分類
  const firstManufactureCategories = useMemo(() => {
    if (!manufactureCategories || manufactureCategories.length === 0) return [];
    const seen = new Set<string>();

    const uniqueManufactures = manufactureCategories.reduce((acc, item) => {
      const id = item.MANUFACTURE_CATEGORYID;
      const title = item.MANUFACTURE_CATEGORY_TITLE;
      if (!id || !title) return acc;

      const key = `${id}::${title}`;
      if (seen.has(key)) return acc;

      seen.add(key);
      acc.push({
        CATEGORY_ID: id,
        CATEGORY_TITLE: title,
      });
      return acc;
    }, [] as { CATEGORY_ID: number; CATEGORY_TITLE: string }[]);
    return uniqueManufactures;
  }, [manufactureCategories]);

  // 篩選後的製造商第一階層分類
  const [
    firstManufactureCategoriesFiltered,
    setFirstManufactureCategoriesFiltered,
  ] = useState<any[]>([]);

  // 篩選後的商品第一階層分類,做為依類別選取裡的大類別的選單呈現
  const [firstCategoriesFiltered, setFirstCategoriesFiltered] = useState<
    Category[]
  >([]);

  // 篩選後的商品第二階層分類
  const [secondCategoriesFiltered, setSecondCategoriesFiltered] = useState<
    Category[]
  >([]);

  // 下拉選單選擇的值
  const [selectedManufacture, setSelectedManufacture] = useState<number>(0);
  const [selectedMainCategory, setSelectedMainCategory] = useState<number>(0);
  const [selectedMidCategory, setSelectedMidCategory] = useState<number>(0);
  // const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  useEffect(() => {
    // 若有從下拉選單選擇製造商,則以製造商過濾產品大類別
    if (selectedManufacture > 0 && isFirstRender.current) {
      const mainCategory = manufactureCategories.filter(
        (item) => item.PARENT_ID === selectedManufacture
      );
      if (mainCategory && mainCategory.length > 0) {
        setFirstCategoriesFiltered(mainCategory);
        return;
      }
    }
    // 若沒有選擇製造商，則以商品分類作為主選單
    if (
      firstCategories &&
      firstCategories.length > 0 &&
      isFirstRender.current
    ) {
      setFirstCategoriesFiltered(firstCategories);
      setFirstManufactureCategoriesFiltered(firstManufactureCategories);
    }
  }, [firstCategories, selectedManufacture, firstManufactureCategories]);
  // 只在初次渲染定義預設資料
  useEffect(() => {
    if (firstCategoriesFiltered.length > 0 && isFirstRender.current) {
      onFilterChangeRef.current?.({
        displayFirstCategories: firstCategoriesFiltered,
        secondCategories: categories,
        filterCategoryIds: allCategoryCounts,
      });
    }
  }, [firstCategoriesFiltered, categories, allCategoryCounts]);

  // 設定從導覽列、所有產品頁拋轉進來帶出的篩選資料
  useEffect(() => {
    if (
      !propCategoryId ||
      propCategoryId.length === 0 ||
      (categories.length === 0 && manufactureCategories.length === 0) ||
      !isFirstRender.current
    ) {
      return;
    }

    const all = [...categories, ...manufactureCategories];
    let isManufacture = false;

    propCategoryId.forEach((item, index) => {
      const category = all.find((c) => c.CATEGORY_ID === item);
      if (!category) return;

      // 第一層:製造商 or 產品第一階層分類
      if (index === 0) {
        if (category.CATEGORY_TYPE === "製造商") {
          setSelectedManufacture(category.CATEGORY_ID);
          isManufacture = true;
        } else {
          setSelectedMainCategory(category.CATEGORY_ID);
          let midOptions = categories.filter(
            (item) => item.PARENT_ID === category.CATEGORY_ID
          );
          setSecondCategoriesFiltered(midOptions);
        }
      }
      // 第二層:製造商下第一層分類 or 產品第二階層分類
      else if (index === 1) {
        if (isManufacture) {
          setSelectedMainCategory(category.CATEGORY_ID);
          let midOptions = manufactureCategories.filter(
            (item) => item.PARENT_ID === category.CATEGORY_ID
          );
          setSecondCategoriesFiltered(midOptions);
        } else {
          setSelectedMidCategory(category.CATEGORY_ID);
        }
      }
      // 第三層:製造商下第二階層分類
      else if (isManufacture) {
        setSelectedMidCategory(category.CATEGORY_ID);
      }
    });
  }, [propCategoryId, categories, manufactureCategories]);

  // 依照選擇的製造商呈現對應的子類別
  const handleManufactureChange = useCallback(
    async (manufactureId: number) => {
      let firstLayer: Category[];
      let categoriesRelation; //篩選結果
      let filterCategoryIds: number[] = []; //計算分類來源

      // 若三階層都有選擇，則篩選出符合的商品
      if (
        manufactureId > 0 &&
        selectedMainCategory !== 0 &&
        selectedMidCategory !== 0
      ) {
        categoriesRelation = await dispatch(
          fetchProductCategoriesRelation([
            manufactureId,
            selectedMainCategory,
            selectedMidCategory,
          ])
        ).unwrap();
        filterCategoryIds = [
          manufactureId,
          selectedMainCategory,
          selectedMidCategory,
        ];
        firstLayer = categoriesRelation.filter(
          (item: any) =>
            item.CATEGORY_LEVEL === 1 && item.CATEGORY_TYPE === "產品"
        );
        setFirstCategoriesFiltered(firstLayer);

        const secondLayer = categoriesRelation.filter(
          (item: any) =>
            item.CATEGORY_LEVEL === 2 && item.CATEGORY_TYPE === "產品"
        );
        setSecondCategoriesFiltered(secondLayer);
      }
      // 若只有兩階層有選擇，則篩選出符合的商品
      else if (manufactureId > 0 && selectedMainCategory !== 0) {
        categoriesRelation = await dispatch(
          fetchProductCategoriesRelation([manufactureId, selectedMainCategory])
        ).unwrap();
        filterCategoryIds = [manufactureId, selectedMainCategory];
        firstLayer = categoriesRelation.filter(
          (item: any) =>
            item.CATEGORY_LEVEL === 1 && item.CATEGORY_TYPE === "產品"
        );
        setFirstCategoriesFiltered(firstLayer);

        // 更新中類別選項
        const secondLayer = categoriesRelation.filter(
          (item: any) =>
            item.CATEGORY_LEVEL === 2 && item.CATEGORY_TYPE === "產品"
        );
        setSecondCategoriesFiltered(secondLayer);
      } else if (manufactureId > 0) {
        // 若只有一階層有選擇，則篩選出符合的商品
        categoriesRelation = await dispatch(
          fetchProductCategoriesRelation([manufactureId])
        ).unwrap();
        filterCategoryIds = [manufactureId];
        firstLayer = categoriesRelation.filter(
          (item: any) =>
            item.CATEGORY_LEVEL === 1 && item.CATEGORY_TYPE === "產品"
        );
        setFirstCategoriesFiltered(firstLayer);
        setSecondCategoriesFiltered([]);
      } else {
        // 清除製造商:顯示所有產品第一階層分類
        firstLayer = categories.filter((item) => item.CATEGORY_LEVEL === 1);
        setFirstCategoriesFiltered(firstLayer);
        categoriesRelation = categories;
        filterCategoryIds = allCategoryCounts;
        // setSelectedCategoryIds(
        //   selectedCategoryIds.filter((id) => id !== manufactureId)
        // );
      }
      onFilterChangeRef.current?.({
        displayFirstCategories: firstLayer,
        secondCategories: categoriesRelation,
        filterCategoryIds: filterCategoryIds,
      });
      onCategoryIdChangeRef.current?.(filterCategoryIds);

      if (isFirstRender.current) {
        isFirstRender.current = false;
      }
    },
    [
      categories,
      manufactureCategories,
      selectedMainCategory,
      selectedMidCategory,
    ]
  );

  // 大類別選單變更處理
  const handleMainCategoryChange = useCallback(
    async (mainCategoryId: number, manufactureId: number) => {
      let displayCategories: Category[];
      let allCategories: Category[];
      let categoryId: number; //設定選擇的大分類
      let categoriesRelation; //篩選結果
      let filterCategoryIds: number[] = []; //計算分類來源

      if (manufactureId > 0) {
        // 有選擇製造商
        if (mainCategoryId === 0) {
          // 清除大類別:列表顯示該製造商的所有子分類

          categoriesRelation = await dispatch(
            fetchProductCategoriesRelation([manufactureId])
          ).unwrap();
          filterCategoryIds = [manufactureId];
          displayCategories = categoriesRelation.filter(
            (item: any) =>
              item.CATEGORY_LEVEL === 1 && item.CATEGORY_TYPE === "產品"
          );
          categoryId = manufactureId;
          setSecondCategoriesFiltered([]);
          // 重置製造商選單
          setFirstManufactureCategoriesFiltered(firstManufactureCategories);
          // 重置大類別選單為該製造商的大分類
          setFirstCategoriesFiltered(displayCategories);
        } else {
          // 選擇大類別:顯示該大類別
          categoriesRelation = await dispatch(
            fetchProductCategoriesRelation([manufactureId, mainCategoryId])
          ).unwrap();
          filterCategoryIds = [manufactureId, mainCategoryId];
          displayCategories = categoriesRelation.filter(
            (item: any) =>
              item.CATEGORY_LEVEL === 1 && item.CATEGORY_TYPE === "產品"
          );
          const manuFactureLayer = categoriesRelation.filter(
            (item: any) =>
              item.CATEGORY_LEVEL === 1 && item.CATEGORY_TYPE === "製造商"
          );
          const secondLayer = categoriesRelation.filter(
            (item: any) =>
              item.CATEGORY_LEVEL === 2 && item.CATEGORY_TYPE === "產品"
          );
          setFirstManufactureCategoriesFiltered(manuFactureLayer);
          categoryId = mainCategoryId;
          setSecondCategoriesFiltered(secondLayer);
        }
      } else {
        // 沒有選擇製造商
        if (mainCategoryId === 0) {
          displayCategories = [...firstCategories];
          filterCategoryIds = allCategoryCounts;
          setSecondCategoriesFiltered([]);
          // 將製造商恢復為所有製造商
          setFirstManufactureCategoriesFiltered(firstManufactureCategories);
          categoriesRelation = categories;
        } else {
          // 取得資料來源
          categoriesRelation = await dispatch(
            fetchProductCategoriesRelation([mainCategoryId])
          ).unwrap();
          filterCategoryIds = [mainCategoryId];

          // 篩選出該符合商品分類的製造商
          const firstManufactureCategories = categoriesRelation.filter(
            (item: any) =>
              item.CATEGORY_LEVEL === 1 && item.CATEGORY_TYPE === "製造商"
          );
          setFirstManufactureCategoriesFiltered(firstManufactureCategories);

          displayCategories = firstCategories.filter(
            (item) => item.CATEGORY_ID === mainCategoryId
          );
          let secondCategoriesOptions = categories.filter(
            (item) => item.PARENT_ID === mainCategoryId
          );
          setSecondCategoriesFiltered(secondCategoriesOptions);
        }
        categoryId = mainCategoryId;
      }
      allCategories = categories;
      //  (categoryId);
      onFilterChangeRef.current?.({
        displayFirstCategories: displayCategories,
        secondCategories: categoriesRelation,
        filterCategoryIds: filterCategoryIds,
      });
      onCategoryIdChangeRef.current?.(filterCategoryIds);
      if (isFirstRender.current) {
        isFirstRender.current = false;
      }
    },
    [
      firstCategories,
      categories,
      manufactureCategories,
      firstCategoriesFiltered,
    ]
  );
  // 中類別選單變更處理
  const handleMidCategoryChange = useCallback(
    async (midCategoryId: number, mainCategoryId: number) => {
      let displayCategories: Category[];
      let categoryId: number;
      let categoriesRelation;
      let filterCategoryIds: number[] = [];

      if (midCategoryId > 0) {
        // 選擇中類別:顯示該中類別
        displayCategories = secondCategoriesFiltered.filter(
          (item) => item.CATEGORY_ID === midCategoryId
        );
        categoryId = midCategoryId;

        if (selectedManufacture > 0) {
          filterCategoryIds = [
            selectedManufacture,
            selectedMainCategory,
            midCategoryId,
          ];
          categoriesRelation = await dispatch(
            fetchProductCategoriesRelation([
              selectedManufacture,
              selectedMainCategory,
              midCategoryId,
            ])
          ).unwrap();
        } else {
          filterCategoryIds = [selectedMainCategory, midCategoryId];
          categoriesRelation = await dispatch(
            fetchProductCategoriesRelation([
              selectedMainCategory,
              midCategoryId,
            ])
          ).unwrap();
        }
        // 將製造商篩選符合選取的中類別
        const firstManufactureCategories = categoriesRelation.filter(
          (item: any) =>
            item.CATEGORY_LEVEL === 1 && item.CATEGORY_TYPE === "製造商"
        );
        setFirstManufactureCategoriesFiltered(firstManufactureCategories);
      } else {
        // 清除中類別:回到大類別

        // 呈現該大類別
        displayCategories = categories.filter(
          (item) => item.CATEGORY_ID === mainCategoryId
        );

        categoryId = mainCategoryId;
        if (selectedManufacture > 0) {
          filterCategoryIds = [selectedManufacture, mainCategoryId];
          categoriesRelation = await dispatch(
            fetchProductCategoriesRelation([
              selectedManufacture,
              mainCategoryId,
            ])
          ).unwrap();
        } else {
          // 將製造商恢復為選擇的大分類
          categoriesRelation = await dispatch(
            fetchProductCategoriesRelation([mainCategoryId])
          ).unwrap();
          filterCategoryIds = [mainCategoryId];
        }

        const firstManufactureCategories = categoriesRelation.filter(
          (item: any) =>
            item.CATEGORY_LEVEL === 1 && item.CATEGORY_TYPE === "製造商"
        );
        setFirstManufactureCategoriesFiltered(firstManufactureCategories);
      }
      onFilterChangeRef.current?.({
        displayFirstCategories: displayCategories,
        secondCategories: categoriesRelation,
        filterCategoryIds: filterCategoryIds,
      });
      onCategoryIdChangeRef.current?.(filterCategoryIds);
      if (isFirstRender.current) {
        isFirstRender.current = false;
      }
    },
    [
      secondCategoriesFiltered,
      categories,
      manufactureCategories,
      selectedManufacture,
    ]
  );

  return (
    <div className="col-md-2 bg-secondary bg-opacity-25 pb-3">
      <div className="mt-4">
        <h4 className="h6 fw-bold">篩選條件</h4>
      </div>
      <div className="mt-4 d-flex flex-wrap">
        <label htmlFor="manufacturer" className="h6 fw-bold w-100">
          依製造商選取
        </label>
        <select
          name="manufacturer"
          id="manufacturer"
          className="w-90 form-select"
          value={selectedManufacture}
          style={{
            height: "32px",
            paddingTop: "3.5px",
          }}
          onChange={(e) => {
            const manufactureId = Number(e.target.value);
            handleManufactureChange(manufactureId);
            setSelectedManufacture(manufactureId);
          }}
        >
          <option value="0"></option>
          {/* 下拉選單:第一階層的製造商 */}
          {firstManufactureCategoriesFiltered &&
            firstManufactureCategoriesFiltered.length > 0 &&
            firstManufactureCategoriesFiltered.map((category: any) => (
              <option
                key={category.CATEGORY_ID}
                value={category.CATEGORY_ID}
                className="pb-2"
              >
                {category.CATEGORY_TITLE}
              </option>
            ))}
        </select>
      </div>

      <div className="mt-4 d-flex flex-wrap">
        <label htmlFor="mainCategory" className="h6 fw-bold w-100">
          依類別選取
        </label>

        <select
          name="mainCategory"
          id="mainCategory"
          className="w-90 form-select"
          value={selectedMainCategory}
          style={{
            height: "32px",
            paddingTop: "3.5px",
            ...(selectedMainCategory === 0 && {
              color: "gray",
            }),
          }}
          onChange={(e) => {
            const mainCategoryId = Number(e.target.value);
            handleMainCategoryChange(mainCategoryId, selectedManufacture);
            setSelectedMainCategory(mainCategoryId);
          }}
        >
          <option value="0">大類別</option>
          {firstCategoriesFiltered &&
            firstCategoriesFiltered.length > 0 &&
            firstCategoriesFiltered.map((category) => (
              <option
                key={category.CATEGORY_ID}
                value={category.CATEGORY_ID}
                style={{ color: "black" }}
              >
                {category.CATEGORY_TITLE}
              </option>
            ))}
        </select>
      </div>

      <div className="mt-4 d-flex flex-wrap">
        <select
          name="midCategory"
          id="midCategory"
          className="w-90 form-select"
          value={selectedMidCategory}
          style={{
            height: "32px",
            paddingTop: "3.5px",
            ...(selectedMainCategory === 0 && {
              color: "gray",
            }),
          }}
          onChange={(e) => {
            const midCategoryId = Number(e.target.value);
            handleMidCategoryChange(midCategoryId, selectedMainCategory);
            setSelectedMidCategory(midCategoryId);
          }}
        >
          <option value="0">中類別</option>
          {secondCategoriesFiltered &&
            secondCategoriesFiltered.length > 0 &&
            secondCategoriesFiltered.map((category) => (
              <option
                key={category.CATEGORY_ID}
                value={category.CATEGORY_ID}
                style={{ color: "black" }}
              >
                {category.CATEGORY_TITLE}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

export default ProductFilter;
