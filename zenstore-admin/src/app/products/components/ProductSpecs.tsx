"use client";

import { useFormContext } from "react-hook-form";

type SpecsForm = {
  high_voltage: string;
  low_voltage: string;
  high_temp: string;
  low_temp: string;
  product_application: string;
};

interface Props {
  onFieldChange?: (name: keyof SpecsForm) => void;
}

export const ProductSpecs = ({ onFieldChange }: Props) => {
  const { register } = useFormContext<SpecsForm>();

  const specs: Array<{ id: keyof SpecsForm; label: string }> = [
    { id: "high_voltage", label: "高電壓" },
    { id: "low_voltage", label: "低電壓" },
    { id: "high_temp", label: "高溫度" },
    { id: "low_temp", label: "低溫度" },
    { id: "product_application", label: "商品應用" },
  ];

  const handleChange =
    (field: keyof SpecsForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      register(field).onChange(e);
      onFieldChange?.(field);
    };

  return (
    <div className="card h-100">
      <div className="card-header">
        <h5 className="fw-bold m-0 h6">規格與應用</h5>
      </div>
      <div className="card-body">
        {specs.map((spec) => (
          <div className="row mb-2" key={spec.id}>
            <div className="col-4">
              <label htmlFor={spec.id} className="col-form-label-sm">
                {spec.label} :
              </label>
            </div>
            <div className="col-8">
              <input
                type="text"
                className="form-control form-control-sm"
                id={spec.id}
                {...register(spec.id)}
                onChange={handleChange(spec.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


