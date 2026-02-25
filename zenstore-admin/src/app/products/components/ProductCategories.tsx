"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { CategoryType } from "@/types/products/categoryType";

type CategoriesForm = {
  brand_id: string;
  brand: string;
  package_method: string;
  main_product_category: string;
  second_product_category?: string;
  third_product_category?: string;
};

interface Props {
  manufactureCategory: CategoryType[];
  productCategory: CategoryType[];
  onFieldChange?: (name: keyof CategoriesForm) => void;
}

export const ProductCategories = ({
  manufactureCategory,
  productCategory,
  onFieldChange,
}: Props) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CategoriesForm>();

  const selectedMain = watch("main_product_category");
  const selectedSecond = watch("second_product_category");
  const selectedBrandId = watch("brand_id");

  useEffect(() => {
    if (selectedBrandId) {
      const brand = manufactureCategory.find(
        (m) => m.CATEGORY_ID.toString() === selectedBrandId
      );
      if (brand) {
        setValue("brand", brand.CATEGORY_TITLE);
        return;
      }
    }
    setValue("brand", "");
  }, [selectedBrandId, manufactureCategory, setValue]);

  useEffect(() => {
    setValue("second_product_category", "");
    setValue("third_product_category", "");
  }, [selectedMain, setValue]);

  useEffect(() => {
    setValue("third_product_category", "");
  }, [selectedSecond, setValue]);

  const handleChange =
    (field: keyof CategoriesForm) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      register(field).onChange(e);
      onFieldChange?.(field);
    };

  return (
    <div className="row">
      <div className="col-6">
        <div className="my-2">
          <label htmlFor="brand_id">
            品牌 <span className="text-danger">*</span>
          </label>
          <select
            id="brand_id"
            className={`form-select ${errors.brand_id ? "is-invalid" : ""}`}
            {...register("brand_id", { required: "品牌為必填" })}
            onChange={handleChange("brand_id")}
          >
            <option value="">請選擇品牌</option>
            {manufactureCategory.map((manufacturer) => (
              <option
                key={manufacturer.CATEGORY_ID}
                value={manufacturer.CATEGORY_ID}
              >
                {manufacturer.CATEGORY_TITLE}
              </option>
            ))}
          </select>
          {errors.brand_id && (
            <div className="invalid-feedback">{errors.brand_id.message}</div>
          )}
        </div>
        <div className="mb-2">
          <label htmlFor="package_method">
            包裝方式 <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${
              errors.package_method ? "is-invalid" : ""
            }`}
            id="package_method"
            {...register("package_method", { required: "包裝為必填" })}
            onChange={handleChange("package_method")}
          />
          {errors.package_method && (
            <div className="invalid-feedback">
              {errors.package_method.message}
            </div>
          )}
        </div>
      </div>
      <div className="col-6">
        <div className="mb-2">
          <label htmlFor="main_product_category">
            商品大分類 <span className="text-danger">*</span>
          </label>
          <select
            id="main_product_category"
            className={`form-select ${
              errors.main_product_category ? "is-invalid" : ""
            }`}
            {...register("main_product_category", {
              required: "商品大分類為必填",
            })}
            onChange={handleChange("main_product_category")}
          >
            <option value="">請選擇商品大分類</option>
            {productCategory
              .filter((product) => product.CATEGORY_LEVEL === 1)
              .map((product) => (
                <option key={product.CATEGORY_ID} value={product.CATEGORY_ID}>
                  {product.CATEGORY_TITLE}
                </option>
              ))}
          </select>
        </div>
        <div className="mb-2">
          <label htmlFor="second_product_category">商品中分類</label>
          <select
            id="second_product_category"
            className="form-select"
            {...register("second_product_category")}
            disabled={!selectedMain}
            onChange={handleChange("second_product_category")}
          >
            <option value="">請先選擇商品大分類</option>
            {productCategory
              .filter((p) => p.PARENT_ID === parseInt(selectedMain || "0", 10))
              .map((product) => (
                <option key={product.CATEGORY_ID} value={product.CATEGORY_ID}>
                  {product.CATEGORY_TITLE}
                </option>
              ))}
          </select>
        </div>
        <div className="mb-2">
          <label htmlFor="third_product_category">商品小分類</label>
          <select
            id="third_product_category"
            className="form-select"
            {...register("third_product_category")}
            disabled={!selectedSecond}
            onChange={handleChange("third_product_category")}
          >
            <option value="">請先選擇商品中分類</option>
            {productCategory
              .filter(
                (p) => p.PARENT_ID === parseInt(selectedSecond || "0", 10)
              )
              .map((product) => (
                <option key={product.CATEGORY_ID} value={product.CATEGORY_ID}>
                  {product.CATEGORY_TITLE}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
};
