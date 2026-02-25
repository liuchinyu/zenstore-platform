"use client";

import { useFormContext } from "react-hook-form";

type SidebarForm = {
  is_published: number | string;
  inventory: number;
  vendor_lead_time: number;
  tags: number[];
};

interface Props {
  tags: any[];
  selectedTags: number[];
  onTagChange: (id: number) => void;
  onFieldChange?: (name: keyof SidebarForm) => void;
  publishOptions?: Array<{ value: number | string; label: string }>;
  valueAsNumberForPublish?: boolean;
}

export const ProductSidebar = ({
  tags,
  selectedTags,
  onTagChange,
  onFieldChange,
  publishOptions = [
    { value: 1, label: "上架" },
    { value: 0, label: "下架" },
  ],
  valueAsNumberForPublish = true,
}: Props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<SidebarForm>();

  const handleChange =
    (field: keyof SidebarForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      register(field).onChange(e);
      onFieldChange?.(field);
    };

  return (
    <div className="col-12">
      <div className="card mb-3">
        <div className="card-header fw-bold">發佈狀態</div>
        <div className="card-body">
          {publishOptions.map((option) => (
            <div className="form-check" key={option.value}>
              <input
                className="form-check-input"
                type="radio"
                id={`publish-${option.value}`}
                value={option.value}
                {...register("is_published", {
                  required: true,
                  ...(valueAsNumberForPublish ? { valueAsNumber: true } : {}),
                })}
                onChange={handleChange("is_published")}
              />
              <label
                className="form-check-label"
                htmlFor={`publish-${option.value}`}
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 庫存、交期 */}
      <div className="card mb-3">
        <div className="card-header fw-bold">
          庫存管理 <span className="text-danger">*</span>
        </div>
        <div className="card-body">
          <label htmlFor="inventory" className="form-label">
            庫存
          </label>
          <input
            type="number"
            className={`form-control form-control-sm mb-2 ${
              errors.inventory ? "is-invalid" : ""
            }`}
            id="inventory"
            {...register("inventory", {
              required: "庫存為必填",
              valueAsNumber: true,
              min: { value: 0, message: "庫存不可為負數" },
            })}
            onChange={handleChange("inventory")}
          />
          {errors.inventory && (
            <div className="invalid-feedback">{errors.inventory.message}</div>
          )}
          <label htmlFor="vendor_lead_time" className="form-label mt-2">
            Vendor Lead time
          </label>
          <input
            type="number"
            className={`form-control form-control-sm ${
              errors.vendor_lead_time ? "is-invalid" : ""
            }`}
            id="vendor_lead_time"
            {...register("vendor_lead_time", {
              required: "Vendor Lead time 為必填",
              valueAsNumber: true,
              min: { value: 0, message: "Lead time 不可為負數" },
            })}
            onChange={handleChange("vendor_lead_time")}
          />
          {errors.vendor_lead_time && (
            <div className="invalid-feedback">
              {errors.vendor_lead_time.message}
            </div>
          )}
        </div>
      </div>

      {/* 標籤 */}
      <div className="card">
        <div className="card-header fw-bold">商品標籤</div>
        <div className="card-body py-2">
          {tags.map((tag) => (
            <div className="form-check" key={tag.TAG_ID}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`tag-${tag.TAG_ID}`}
                value={tag.TAG_ID}
                checked={selectedTags.includes(tag.TAG_ID)}
                onChange={() => {
                  onTagChange(tag.TAG_ID);
                  onFieldChange?.("tags");
                }}
              />
              <label className="form-check-label" htmlFor={`tag-${tag.TAG_ID}`}>
                {tag.TAG_NAME}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
