"use client";

import { useFormContext } from "react-hook-form";

type SEOForm = {
  seo_title?: string;
  seo_description?: string;
};

interface Props {
  onFieldChange?: (name: keyof SEOForm) => void;
}

export const ProductSEO = ({ onFieldChange }: Props) => {
  const { register } = useFormContext<SEOForm>();

  const handleChange =
    (field: keyof SEOForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      register(field).onChange(e);
      onFieldChange?.(field);
    };

  return (
    <div className="card mt-3">
      <div className="card-header">
        <h5 className="fw-bold m-0 h6">
          <i className="bi bi-search me-2" aria-hidden="true"></i>SEO 設定
          <small className="text-muted ms-2">(選填，用於優化搜尋引擎)</small>
        </h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <label className="form-label small">
              SEO 標題
              <small className="text-muted ms-1">(建議50-60字元)</small>
            </label>

            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="例如：10KΩ 1/4W 精密電阻器 | 高品質電子元件"
              {...register("seo_title")}
              onChange={handleChange("seo_title")}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small">
              Meta 描述{" "}
              <small className="text-muted ms-1">(建議150-160字元)</small>
            </label>
            <textarea
              className="form-control form-control-sm"
              rows={2}
              placeholder="例如：專業級10KΩ 1/4W精密電阻器，適用於電子電路設計。高精度±1%，溫度係數低，提供穩定可靠的電阻值。"
              {...register("seo_description")}
              onChange={handleChange("seo_description")}
            />
          </div>
          <div className="col-12 mt-3">
            <div className="alert alert-info mb-0">
              <i className="bi bi-info-circle me-2" aria-hidden="true"></i>
              <strong>SEO提示：</strong>
              <ul className="mb-0 mt-2">
                <li>SEO標題應包含主要關鍵字，吸引點擊</li>
                <li>Meta描述應清楚說明商品價值和特色</li>
                <li>建議定期更新SEO內容以提升搜尋效果</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


