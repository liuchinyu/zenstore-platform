import React, { useMemo } from "react";
import LoadingLink from "@/components/LoadingLink/LoadingLink";
import { Category } from "@/types";

interface CategoryListProps {
  category: Category;
  subCategories: Category[]; //接收整個商品分類 || 製造商分類
  categoryCounts: Record<number, number>;
  manufactureId: number;
}

const CategoryList = React.memo(
  ({
    category,
    subCategories,
    categoryCounts,
    manufactureId,
  }: CategoryListProps) => {
    // 取得第二階層分類
    const filteredSubCategories = useMemo(
      () =>
        subCategories.filter((sub) => sub.PARENT_ID === category.CATEGORY_ID),
      [subCategories, category.CATEGORY_ID]
    );
    // console.log("category", category); //大類別
    // console.log("filteredSubCategories", filteredSubCategories); //大類別底下中分類
    return (
      <div
        className="categorySection"
        role="region"
        aria-label={`${category.CATEGORY_TITLE}分類區塊`}
      >
        <LoadingLink
          href={`/products/${category.CATEGORY_TITLE}?id=${category.CATEGORY_ID}`}
          className="fw-bold h4 text-decoration-none categoryTitle"
          aria-label={`查看${category.CATEGORY_TITLE}所有產品`}
        >
          {category.CATEGORY_TITLE}
        </LoadingLink>
        <hr />
        <div className="subcategoriesContainer">
          {filteredSubCategories.map((subCategory) => {
            //取得對應分類的數量
            const count = categoryCounts[subCategory.CATEGORY_ID];
            return (
              <div
                key={subCategory.CATEGORY_ID}
                className="subcategoryItem"
                role="listitem"
              >
                <LoadingLink
                  href={`/products/${subCategory.CATEGORY_TITLE}?id=${subCategory.CATEGORY_ID}&manufactureId=${manufactureId}`}
                  className="h6 subcategoryLink"
                  aria-label={`查看${subCategory.CATEGORY_TITLE}產品`}
                >
                  {subCategory.CATEGORY_TITLE}
                </LoadingLink>
                <span className="categoryCount">
                  {typeof count === "number" ? `(${count}項)` : `(0項)`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

CategoryList.displayName = "CategoryList";

export default CategoryList;
