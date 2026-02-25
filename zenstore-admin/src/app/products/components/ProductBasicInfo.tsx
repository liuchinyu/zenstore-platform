"use client";

import { useFormContext } from "react-hook-form";

type BasicInfoForm = {
  oracle_id: string;
  product_id: string;
  description: string;
  fixed_lot_multiplier: number;
  unit_weight: number;
  price?: number;
};

interface Props {
  onFieldChange?: (name: keyof BasicInfoForm) => void;
  disableOracleId?: boolean;
  showPriceField?: boolean;
  minFixedLot?: number;
  minUnitWeight?: number;
  minPrice?: number;
}

export const ProductBasicInfo = ({
  onFieldChange,
  disableOracleId = false,
  showPriceField = false,
  minFixedLot = 0,
  minUnitWeight = 0,
  minPrice = 0,
}: Props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<BasicInfoForm>();

  const handleChange =
    (field: keyof BasicInfoForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      register(field).onChange(e);
      onFieldChange?.(field);
    };

  return (
    <div className="row">
      <div className="col-6">
        <div className="my-2">
          <label htmlFor="oracle_id">
            物件編號 <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.oracle_id ? "is-invalid" : ""}`}
            id="oracle_id"
            {...register("oracle_id", { required: "此欄位為必填" })}
            onChange={handleChange("oracle_id")}
            disabled={disableOracleId}
          />
          {errors.oracle_id && (
            <div className="invalid-feedback">{errors.oracle_id.message}</div>
          )}
        </div>
        <div className="my-2">
          <label htmlFor="product_id">
            零件編號 <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.product_id ? "is-invalid" : ""}`}
            id="product_id"
            {...register("product_id", { required: "此欄位為必填" })}
            onChange={handleChange("product_id")}
          />
          {errors.product_id && (
            <div className="invalid-feedback">{errors.product_id.message}</div>
          )}
        </div>
        <div className="mb-2">
          <label htmlFor="description">
            規格說明 <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.description ? "is-invalid" : ""}`}
            id="description"
            {...register("description", { required: "此欄位為必填" })}
            onChange={handleChange("description")}
          />
          {errors.description && (
            <div className="invalid-feedback">{errors.description.message}</div>
          )}
        </div>
      </div>
      <div className="col-6">
        <div className="my-2">
          <label htmlFor="fixed_lot_multiplier">
            最小包裝量 <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            className={`form-control ${
              errors.fixed_lot_multiplier ? "is-invalid" : ""
            }`}
            id="fixed_lot_multiplier"
            min={minFixedLot}
            {...register("fixed_lot_multiplier", {
              required: "此欄位為必填",
              valueAsNumber: true,
              min: { value: minFixedLot, message: "不可小於最小值" },
            })}
            onChange={handleChange("fixed_lot_multiplier")}
          />
          {errors.fixed_lot_multiplier && (
            <div className="invalid-feedback">
              {errors.fixed_lot_multiplier.message}
            </div>
          )}
        </div>
        <div className="mb-2">
          <label htmlFor="unit_weight">
            單位淨重-克 <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            className={`form-control ${errors.unit_weight ? "is-invalid" : ""}`}
            id="unit_weight"
            min={minUnitWeight}
            {...register("unit_weight", {
              required: "此欄位為必填",
              valueAsNumber: true,
              min: { value: minUnitWeight, message: "不可小於最小值" },
            })}
            onChange={handleChange("unit_weight")}
          />
          {errors.unit_weight && (
            <div className="invalid-feedback">{errors.unit_weight.message}</div>
          )}
        </div>
        {showPriceField && (
          <div className="mb-2">
            <label htmlFor="price">
              單價 <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className={`form-control ${errors.price ? "is-invalid" : ""}`}
              id="price"
              min={minPrice}
              {...register("price" as const, {
                required: "此欄位為必填",
                valueAsNumber: true,
                min: { value: minPrice, message: "不可小於最小值" },
              })}
              onChange={handleChange("price")}
            />
            {errors.price && (
              <div className="invalid-feedback">{errors.price.message}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


