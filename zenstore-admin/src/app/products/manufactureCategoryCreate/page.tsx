"use client";
import { CategoryModal } from "@/components/modal";
import ProductService from "@/services/productService";
import { CategoryNode, CategoryType } from "@/types/products/categoryType";
import { CategoryItem } from "@/components/categoryTree";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useEffect, useState } from "react";

import {
  selectProductCategories,
  selectManufactureCategories,
} from "@/store/selectors/categorySelector";

import {
  setTag,
  setTagValue,
  setTagTitle,
  setParentId,
  setLoading,
  setButtonProps,
  fetchProductCategories,
  fetchManufactureCategories,
} from "@/store/categorySlice";

export default function manufactureCategory() {
  const dispatch = useAppDispatch();
  const { tag, tagValue, tagTitle, parentId, isLoading, buttonProps } =
    useAppSelector((state) => state?.category);

  const manufacture_categories = useAppSelector(selectManufactureCategories);
  const product_categories = useAppSelector(selectProductCategories);

  const handleValueClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.dataset.bsValue; //階層Category_Level
    const title = e.currentTarget.dataset.bsTitle; //新增大分類、新增中分類、新增小分類
    const parentId = e.currentTarget
      .closest("[data-bs-parentid]")
      ?.getAttribute("data-bs-parentid"); //取得該button的parent_id
    const props = e.currentTarget.dataset.bsProps; //新增、修改、刪除

    dispatch(setTagValue(Number(value)));
    dispatch(setTag(title || ""));
    dispatch(setParentId(Number(parentId)));
    dispatch(setButtonProps(props || ""));
  };

  // 取得商品分類
  useEffect(() => {
    if (product_categories.length === 0) {
      dispatch(fetchProductCategories());
    }
  }, [product_categories]);

  useEffect(() => {
    if (manufacture_categories.length === 0 || !manufacture_categories) {
      dispatch(fetchManufactureCategories());
    }
  }, [manufacture_categories]);

  const handleSubmitClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      dispatch(setLoading(true));

      // 原有單筆新增邏輯
      let category_title = tagTitle;
      await ProductService.createCategory(
        category_title,
        parentId,
        tagValue,
        "製造商"
      );
    } catch (e) {
      console.log(e);
      dispatch(setLoading(true));
    }
  };

  const handleSubmitClickUpdate = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    try {
      // dispatch(setLoading(true));
      let category_title = tagTitle;
      await ProductService.updateCategory(parentId, category_title);
    } catch (e) {
      console.log(e);
      dispatch(setLoading(true));
    }
  };

  // 刪除分類
  const handleSubmitClickDelete = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    try {
      dispatch(setLoading(true));
      const childCount = await ProductService.checkChildCategories(parentId);
      if (childCount?.data > 0) {
        alert("該分類有子分類，無法刪除");
        return;
      }
      await ProductService.deleteCategory(parentId);
    } catch (e) {
      console.log(e);
      dispatch(setLoading(true));
    }
  };

  const handleInputTag = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setTagTitle(e.target.value));
  };

  const buildCategoryTree = (categories: CategoryType[]): CategoryNode[] => {
    const categoryMap = new Map<number, CategoryNode>();
    const roots: CategoryNode[] = [];

    // 首先創建所有節點
    categories.forEach((category) => {
      categoryMap.set(category.CATEGORY_ID, { ...category, children: [] });
    });

    // 建立父子關係
    categories.forEach((category) => {
      const node = categoryMap.get(category.CATEGORY_ID)!;
      if (category.PARENT_ID === 0) {
        roots.push(node);
      } else {
        const parent = categoryMap.get(category.PARENT_ID);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    return roots;
  };

  const categoryTree = buildCategoryTree(manufacture_categories);

  return (
    <>
      <div className="container-fluid alert alert-primary border-0">
        <div className="row p-3">
          <div className="col-sm-6 col-12">
            <h1 className="h4">製造商多層級分類設定</h1>
          </div>
          <div className="col-sm-6 col-12 text-sm-end">
            <button
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#inputTag"
              data-bs-value={1}
              data-bs-title="新增大分類"
              data-bs-parentid={0}
              data-bs-props="create"
              onClick={handleValueClick}
            >
              新增大分類
            </button>
          </div>
          <div className="card bg-light rounded-0 mt-3 p-0">
            <span className="p-3 bg-secondary">分類設定</span>
            <div className="card-body">
              <div className="mx-0">
                {/* 資料載入中 */}
                {isLoading ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">載入中...</span>
                    </div>
                  </div>
                ) : manufacture_categories.length > 0 ? (
                  categoryTree.map((category) => (
                    <CategoryItem
                      key={category.CATEGORY_ID}
                      category={category}
                      level={1}
                      handleValueClick={handleValueClick}
                    />
                  ))
                ) : (
                  <div className="alert alert-warning">
                    目前尚無分類，請點擊「新增規則」按鈕新增分類
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* modal */}
      <CategoryModal id="inputTag" title={tag}>
        <form action="">
          <label htmlFor="" className="form-label">
            類別標題
          </label>
          {buttonProps != "delete" ? ( //修改標題
            <input
              type="text"
              className="form-control main-tag"
              onChange={handleInputTag}
              value={tagTitle}
            />
          ) : (
            <div className="alert alert-danger">確定要刪除嗎？</div>
          )}
          {/* 提交選項 */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              取消
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={
                buttonProps == "create"
                  ? handleSubmitClick
                  : buttonProps == "update"
                  ? handleSubmitClickUpdate
                  : handleSubmitClickDelete
              }
            >
              儲存
            </button>
          </div>
        </form>
      </CategoryModal>
    </>
  );
}
