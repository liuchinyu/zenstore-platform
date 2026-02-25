"use client";

import { useFormContext } from "react-hook-form";

type PriceRangeField = {
  minQuantity: number | string;
  maxQuantity: number | string;
  unit: string;
  unitPrice: number | string;
};

type PriceRangeFormValues = {
  priceRanges: PriceRangeField[];
};

interface Props {
  fields: any[];
  onAppend: () => void;
  onRemove: (index: number) => void;
  onFieldChange?: (name: string) => void;
  showValidation?: boolean;
}

export const PriceRangeTable = ({
  fields,
  onAppend,
  onRemove,
  onFieldChange,
  showValidation = true,
}: Props) => {
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext<PriceRangeFormValues>();

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      register(field as any).onChange(e);
      onFieldChange?.("priceRanges");
    };

  const errorAt = (index: number, key: keyof PriceRangeField) =>
    showValidation ? (errors as any)?.priceRanges?.[index]?.[key] : undefined;

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="fw-bold m-0 h6">
          價格表設定 <span className="text-danger">*</span>
        </h5>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={onAppend}
        >
          <i className="bi bi-plus" aria-hidden="true"></i> 新增區間
        </button>
      </div>
      <div className="card-body">
        <table className="table table-sm table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: "40px" }}></th>
              <th>最小數量</th>
              <th>最大數量</th>
              <th>單位</th>
              <th>單價 (TWD)</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((range, index) => (
              <tr key={range.id}>
                <td>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-link text-danger p-0"
                      onClick={() => onRemove(index)}
                      aria-label="移除區間"
                    >
                      <i className="bi bi-x-lg" aria-hidden="true"></i>
                    </button>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    className={`form-control form-control-sm ${
                      errorAt(index, "minQuantity") ? "is-invalid" : ""
                    }`}
                    min={1}
                    {...register(`priceRanges.${index}.minQuantity` as const, {
                      required: showValidation && "此欄位為必填",
                      valueAsNumber: true,
                      min: showValidation
                        ? { value: 1, message: "不可小於1" }
                        : undefined,
                    })}
                    onChange={handleChange(`priceRanges.${index}.minQuantity`)}
                  />
                  {errorAt(index, "minQuantity") && (
                    <div className="invalid-feedback d-block">
                      {(errorAt(index, "minQuantity") as any)?.message as string}
                    </div>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    className={`form-control form-control-sm ${
                      errorAt(index, "maxQuantity") ? "is-invalid" : ""
                    }`}
                    {...register(`priceRanges.${index}.maxQuantity` as const, {
                      required: showValidation && "此欄位為必填",
                      valueAsNumber: true,
                      min: showValidation
                        ? { value: 1, message: "不可小於1" }
                        : undefined,
                      validate: showValidation
                        ? (value) => {
                            const minQuantity =
                              getValues(`priceRanges.${index}.minQuantity`) ?? 0;
                            return (
                              Number(value) >= Number(minQuantity) ||
                              "最大數量必須大於等於最小數量"
                            );
                          }
                        : undefined,
                    })}
                    onChange={handleChange(`priceRanges.${index}.maxQuantity`)}
                  />
                  {errorAt(index, "maxQuantity") && (
                    <div className="invalid-feedback d-block">
                      {(errorAt(index, "maxQuantity") as any)?.message as string}
                    </div>
                  )}
                </td>
                <td>
                  <input
                    type="text"
                    className={`form-control form-control-sm ${
                      errorAt(index, "unit") ? "is-invalid" : ""
                    }`}
                    {...register(`priceRanges.${index}.unit` as const, {
                      required: showValidation && "此欄位為必填",
                    })}
                    onChange={handleChange(`priceRanges.${index}.unit`)}
                  />
                  {errorAt(index, "unit") && (
                    <div className="invalid-feedback d-block">
                      {(errorAt(index, "unit") as any)?.message as string}
                    </div>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    className={`form-control form-control-sm ${
                      errorAt(index, "unitPrice") ? "is-invalid" : ""
                    }`}
                    {...register(`priceRanges.${index}.unitPrice` as const, {
                      required: showValidation && "此欄位為必填",
                      valueAsNumber: true,
                      min: showValidation
                        ? { value: 0, message: "不可為負數" }
                        : undefined,
                    })}
                    onChange={handleChange(`priceRanges.${index}.unitPrice`)}
                  />
                  {errorAt(index, "unitPrice") && (
                    <div className="invalid-feedback d-block">
                      {(errorAt(index, "unitPrice") as any)?.message as string}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {showValidation && (errors as any)?.priceRanges?.root && (
          <div className="text-danger small">
            {(errors as any).priceRanges.root.message}
          </div>
        )}
      </div>
    </div>
  );
};


