import React, { useState, useEffect } from "react";

export type OrderFilterOptions = {
  orderStatus: string[];
  paymentStatus: string[];
  shippingStatus: string[];
  dateFrom: string;
  dateTo: string;
  customerName: string;
  memberType: string[];
};

interface OrderFilterModalProps {
  show: boolean;
  onClose: () => void;
  onApply: (options: OrderFilterOptions) => void;
  onClear: () => void;
  initialOptions: OrderFilterOptions;
  mode: "order" | "cancel" | "cancel-permit";
}

const paymentStatusOptions = [
  { label: "未付款", value: "UNPAID" },
  { label: "待確認", value: "PENDING_CONFIRMATION" },
  { label: "已付款", value: "PAID" },
  { label: "付款失敗", value: "PAYMENT_FAILED" },
];

const shippingStatusOptions = [
  { label: "未出貨", value: "UNSHIPPED" },
  { label: "備貨中", value: "PREPARING" },
  { label: "已出貨", value: "SHIPPED" },
  { label: "已送達", value: "ARRIVED" },
  // { label: "已退貨", value: "RETURNED" },
];

const memberTypeOptions = [
  { label: "個人會員", value: "個人會員" },
  { label: "企業會員", value: "企業會員" },
];

const OrderFilterModal: React.FC<OrderFilterModalProps> = ({
  show,
  onClose,
  onApply,
  onClear,
  initialOptions,
  mode,
}) => {
  const [options, setOptions] = useState<OrderFilterOptions>(initialOptions);
  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const handleCheckboxChange = (
    type: "orderStatus" | "paymentStatus" | "shippingStatus" | "memberType",
    value: string,
  ) => {
    setOptions((prev) => {
      const arr = prev[type];
      return {
        ...prev,
        [type]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };
  const handleDateChange = (type: "dateFrom" | "dateTo", value: string) => {
    setOptions((prev) => ({ ...prev, [type]: value }));
  };

  const handleTextChange = (type: "customerName", value: string) => {
    setOptions((prev) => ({ ...prev, [type]: value }));
  };

  const handleApply = () => {
    onApply(options);
    onClose();
  };

  const handleClear = () => {
    setOptions({
      orderStatus: [],
      paymentStatus: [],
      shippingStatus: [],
      dateFrom: "",
      dateTo: "",
      customerName: "",
      memberType: [],
    });
    onClear();
    onClose();
  };

  return (
    <>
      <div
        className={`modal fade ${show ? "show d-block" : ""}`}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content bg-white">
            <div className="modal-header">
              <h5 className="modal-title">進階篩選</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              {/* 客戶姓名篩選 */}
              <div className="mb-3">
                <label className="form-label">客戶姓名</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="請輸入客戶姓名"
                  value={options.customerName}
                  onChange={(e) =>
                    handleTextChange("customerName", e.target.value)
                  }
                  aria-label="客戶姓名"
                />
              </div>

              {/* 會員身分篩選 */}
              <div className="mb-3">
                <label className="form-label">會員身分</label>
                <div className="d-flex flex-wrap gap-3">
                  {memberTypeOptions.map((opt) => (
                    <div className="form-check" key={opt.value}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`member-${opt.value}`}
                        checked={options.memberType.includes(opt.value)}
                        onChange={() =>
                          handleCheckboxChange("memberType", opt.value)
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`member-${opt.value}`}
                      >
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              {mode === "order" && (
                <>
                  <div className="mb-3">
                    <label className="form-label">付款狀態</label>
                    <div className="d-flex flex-wrap gap-3">
                      {paymentStatusOptions.map((opt) => (
                        <div className="form-check" key={opt.value}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`pay-${opt.value}`}
                            checked={options.paymentStatus.includes(opt.value)}
                            onChange={() =>
                              handleCheckboxChange("paymentStatus", opt.value)
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`pay-${opt.value}`}
                          >
                            {opt.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">出貨狀態</label>
                    <div className="d-flex flex-wrap gap-3">
                      {shippingStatusOptions.map((opt) => (
                        <div className="form-check" key={opt.value}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`ship-${opt.value}`}
                            checked={options.shippingStatus.includes(opt.value)}
                            onChange={() =>
                              handleCheckboxChange("shippingStatus", opt.value)
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`ship-${opt.value}`}
                          >
                            {opt.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="mb-3 row">
                <label className="form-label col-12">訂單日期區間</label>
                <div className="col-6">
                  <input
                    type="date"
                    className="form-control"
                    value={options.dateFrom}
                    onChange={(e) =>
                      handleDateChange("dateFrom", e.target.value)
                    }
                    aria-label="起始日期"
                  />
                </div>
                <div className="col-6">
                  <input
                    type="date"
                    className="form-control"
                    value={options.dateTo}
                    onChange={(e) => handleDateChange("dateTo", e.target.value)}
                    aria-label="結束日期"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClear}
              >
                清除
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleApply}
              >
                套用
              </button>
            </div>
          </div>
        </div>
      </div>
      {show && (
        <div
          className="modal-backdrop fade show"
          style={{ zIndex: 1050 }}
        ></div>
      )}
    </>
  );
};

export default OrderFilterModal;
