import React, { useState } from "react";
import { GroupMembersType } from "@/types/products/memberType";

export interface MemberFilterOptions {
  registrationDateStart: string;
  registrationDateEnd: string;
  memberType: string;
  verificationStatus: "" | "1" | "0";
  accountStatus: "" | "1" | "0";
  memberGroup: string | null;
}

interface MemberFilterModalProps {
  id: string;
  title: string;
  show: boolean;
  groups: GroupMembersType[];
  initialFilters: MemberFilterOptions;
  onApply: (filters: MemberFilterOptions) => void;
  onReset: () => void;
  onClose: () => void;
}

const MemberFilterModal: React.FC<MemberFilterModalProps> = ({
  id,
  title,
  show,
  groups,
  initialFilters,
  onApply,
  onReset,
  onClose,
}) => {
  if (!show) {
    return null;
  }
  const [filters, setFilters] = useState<MemberFilterOptions>(initialFilters);

  // 套用篩選
  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  // 註冊日期篩選
  const handleDateChange = (
    type: "registrationDateStart" | "registrationDateEnd",
    value: string,
  ) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  // 會員身分篩選
  const handleMemberTypeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, memberType: value }));
  };

  // 信箱驗證狀態篩選
  const handleVerificationStatusChange = (value: "" | "1" | "0") => {
    setFilters((prev) => ({ ...prev, verificationStatus: value }));
  };

  // 帳號狀態篩選
  const handleAccountStatusChange = (value: "" | "1" | "0") => {
    setFilters((prev) => ({ ...prev, accountStatus: value }));
  };

  // 會員群組篩選
  const handleMemberGroupChange = (value: string | null) => {
    setFilters((prev) => ({ ...prev, memberGroup: value }));
  };

  // 清除篩選
  const handleClear = () => {
    setFilters({
      registrationDateStart: "",
      registrationDateEnd: "",
      memberType: "",
      verificationStatus: "",
      accountStatus: "",
      memberGroup: null,
    });
    onReset();
    onClose();
  };

  return (
    <div
      className="modal fade show"
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}Label`}
      aria-hidden="true"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={`${id}Label`}>
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {/* Registration Date */}
            <div className="mb-3">
              <label className="form-label">註冊日期</label>
              <div className="input-group">
                <input
                  type="date"
                  className="form-control"
                  value={filters.registrationDateStart}
                  onChange={(e) =>
                    handleDateChange("registrationDateStart", e.target.value)
                  }
                />
                <span className="input-group-text">至</span>
                <input
                  type="date"
                  className="form-control"
                  value={filters.registrationDateEnd}
                  onChange={(e) =>
                    handleDateChange("registrationDateEnd", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Member Type */}
            <div className="mb-3">
              <label htmlFor="memberTypeFilter" className="form-label">
                會員身分
              </label>
              <select
                id="memberTypeFilter"
                className="form-select"
                value={filters.memberType}
                onChange={(e) => handleMemberTypeChange(e.target.value)}
              >
                <option value="">所有身分</option>
                <option key={1} value={"企業會員"}>
                  企業會員
                </option>
                <option key={2} value={"個人會員"}>
                  個人會員
                </option>
              </select>
            </div>

            {/* Email Verification Status */}
            <div className="mb-3">
              <label htmlFor="verificationStatusFilter" className="form-label">
                信箱驗證狀態
              </label>
              <select
                id="verificationStatusFilter"
                className="form-select"
                value={filters.verificationStatus}
                onChange={(e) =>
                  handleVerificationStatusChange(e.target.value as any)
                }
              >
                <option value="">全部</option>
                <option value="1">已驗證</option>
                <option value="0">未驗證</option>
              </select>
            </div>

            {/* Account Status */}
            <div className="mb-3">
              <label htmlFor="accountStatusFilter" className="form-label">
                帳號狀態
              </label>
              <select
                id="accountStatusFilter"
                className="form-select"
                value={filters.accountStatus}
                onChange={(e) =>
                  handleAccountStatusChange(e.target.value as any)
                }
              >
                <option value="">全部</option>
                <option value="0">正常</option>
                <option value="1">停權</option>
              </select>
            </div>

            {/* Member Group */}
            <div className="mb-3">
              <label htmlFor="memberGroupFilter" className="form-label">
                會員群組
              </label>
              <select
                id="memberGroupFilter"
                className="form-select"
                value={filters.memberGroup ?? ""}
                onChange={(e) => handleMemberGroupChange(e.target.value)}
              >
                <option value="">所有群組</option>
                {groups.map((group) => (
                  <option key={group.GROUP_ID} value={group.GROUP_NAME}>
                    {group.GROUP_NAME}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleClear}
            >
              重設
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
  );
};

export default MemberFilterModal;
