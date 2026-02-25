"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import BlockMemberModal from "@/components/BlockMemberModal/BlockMemberModal";
import GroupMembersModal from "@/components/GroupMembersModal/GroupMembersModal";
import MemberFilterModal from "@/components/MemberFilterModal/MemberFilterModal";
import PaginationComponent from "@/components/ui/Pagination/PaginationComponent";
import { useMemberGroups } from "@/hooks/useMemberGroups";
import { useMember } from "@/hooks/useMember";

const MembersPage = () => {
  const searchParams = useSearchParams();
  const {
    totalPages, // 總頁數
    memberList,
    searchTerm,
    setSearchTerm,
    filterOptions,
    selectedMembers,
    setSelectedMembers,
    currentPage,
    handlePageChange,
    applyFilters,
    resetFilters,
    handleSearch,
  } = useMember();

  console.log("memberList", memberList);

  // 篩選 Modal 狀態
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [showBlockMemberModal, setShowBlockMemberModal] =
    useState<boolean>(false);
  const { showToast } = useToast();
  const [modalOperation, setModalOperation] = useState<"block" | "unblock">(
    "block",
  );

  // 使用 custom hook 處理會員群組
  const {
    groups,
    groupRelation,
    showMemberGroupModal,
    selectedGroup,
    handleSelectGroup,
    handleApplyGroup,
    handleOpenGroupModal,
    handleCloseGroupModal,
  } = useMemberGroups(selectedMembers);

  // 群組url導覽
  useEffect(() => {
    const lastPageUrl = localStorage.getItem("lastPageUrl");
    const currentUrl = window.location.href;
    if (lastPageUrl === currentUrl) {
      window.history.replaceState({}, "", window.location.pathname);
    } else {
      const group = searchParams.get("group");
      if (group) {
        setSearchTerm(group);
      }
    }
    localStorage.setItem("lastPageUrl", currentUrl);
  }, [searchParams]);

  // 選取/取消選取所有會員
  const handleSelectAll = () => {
    if (selectedMembers.length === memberList.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(memberList.map((member: any) => member.MEMBER_ID));
    }
  };

  // 選取/取消選取單一會員
  const handleSelectMember = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  // 處理套用群組後的額外操作
  const handleApplyGroupWithRefresh = async () => {
    const success = await handleApplyGroup();
  };

  const handleImportExcel = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  // 定義一個隱藏的檔案輸入元素的引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 處理檔案選擇
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("excelFile", file);

      try {
        // 顯示載入中提示
        showToast({
          type: "info",
          title: "檔案上傳中",
          message: "正在上傳並處理 Excel 檔案...",
        });

        // const result = await productService.importExcel(formData);

        // 重新載入產品列表
        // dispatch(fetchProducts());

        // 顯示成功訊息
        showToast({
          type: "success",
          title: "匯入成功",
          message: "Excel 檔案已成功匯入",
        });
      } catch (error) {
        console.error("匯入失敗:", error);
        showToast({
          type: "error",
          title: "匯入失敗",
          message: "無法匯入 Excel 檔案，請檢查檔案格式是否正確",
        });
      } finally {
        // 重置檔案輸入
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleBlockMembers = () => {
    setModalOperation("block");
    setShowBlockMemberModal(true);
  };

  const handleUnblockMembers = () => {
    setModalOperation("unblock");
    setShowBlockMemberModal(true);
  };

  return (
    <div className="container-fluid p-4">
      <h1 className="mb-4">會員列表</h1>

      {/* 隱藏的檔案輸入 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        style={{ display: "none" }}
      />

      {/* 搜尋欄 */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="搜尋"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={handleSearch}
            >
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>
        <div className="col-md-4 text-end">
          <button
            className="btn btn-primary me-2"
            onClick={() => setShowFilterModal(true)}
          >
            篩選
          </button>
          <div className="dropdown d-inline-block">
            <button
              className="btn btn-primary me-2"
              id="exportImportDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-three-dots"></i>
            </button>
            <ul
              className="dropdown-menu"
              aria-labelledby="exportImportDropdown"
            >
              <li>
                <button
                  className="dropdown-item"
                  disabled={true}
                  onClick={handleImportExcel}
                >
                  <i className="bi bi-file-earmark-arrow-up me-2"></i>匯入 Excel
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => {}}
                  disabled={true}
                >
                  <i className="bi bi-file-earmark-arrow-down me-2"></i>匯出
                  Excel
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      {selectedMembers.length > 0 && (
        <div className="row mb-3">
          <div className="col-12 d-flex justify-content-start">
            <button
              className="btn btn-secondary me-2"
              onClick={handleOpenGroupModal}
            >
              <i className="bi bi-people me-1"></i> 會員分組
            </button>
            <button
              className="btn btn-danger me-2"
              onClick={handleBlockMembers}
              disabled={selectedMembers.length === 0}
            >
              <i className="bi bi-ban me-1"></i> 停權
            </button>
            <button
              className="btn btn-success me-2"
              onClick={handleUnblockMembers}
              disabled={selectedMembers.length === 0}
            >
              <i className="bi bi-person-circle me-1"></i> 解封
            </button>
            {/* <button
              className="btn btn-primary me-2"
              onClick={() => {}}
              disabled={selectedMembers.length === 0}
            >
              <i className="bi bi-chat-text me-1"></i> 發送訊息
            </button> */}
            {/* <button
              className="btn btn-danger ms-auto"
              onClick={() => {}}
              disabled={selectedMembers.length === 0}
            >
              <i className="bi bi-trash3 me-1"></i> 刪除
            </button> */}
          </div>
        </div>
      )}
      {/* 提示訊息 */}
      <div className="row mb-3">
        <div className="col-12">
          <ul className="nav nav-tabs">
            {selectedMembers.length === 0 && (
              <li className="nav-item">
                <span className="text-danger">勾選會員後再執行操作</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      {/* 會員表格 */}
      <div className="row">
        <div className="col-12">
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="form-check-input text-center"
                      checked={
                        selectedMembers.length === memberList.length &&
                        memberList.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>姓名</th>
                  <th>會員身分</th>
                  <th>電子信箱</th>
                  <th>連絡電話</th>
                  <th>信箱驗證狀態</th>
                  <th>會員群組</th>
                  <th>累積消費總額</th>
                  <th>註冊日期</th>
                  <th>帳號狀態</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member: any) => (
                  <tr key={member.MEMBER_ID}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedMembers.includes(member.MEMBER_ID)}
                        onChange={() => handleSelectMember(member.MEMBER_ID)}
                      />
                    </td>
                    <td>
                      <Link
                        style={{ textDecoration: "none" }}
                        href={`/customers/members/${member.MEMBER_ID}`}
                      >
                        {member.USER_NAME}
                      </Link>
                    </td>
                    <td>{member.MEMBER_TYPE}</td>
                    <td>{member.EMAIL}</td>
                    <td>{member.MOBILE_PHONE}</td>

                    <td>{member.ISVERIFIED ? "已驗證" : "未驗證"}</td>
                    <td>{member.GROUP_NAME}</td>
                    <td>
                      NT$
                      {member.TOTAL_AMOUNT
                        ? member.TOTAL_AMOUNT.toLocaleString()
                        : "0"}
                    </td>
                    <td>{member.CREATED_AT}</td>
                    <td>
                      {member.IS_BLOCKLIST ? (
                        <span className="text-danger fw-bold">停權</span>
                      ) : (
                        "正常"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {/* 會員操作 Modal */}
      <BlockMemberModal
        id="blockMemberModal"
        title={modalOperation === "block" ? "停權會員" : "解封會員"}
        members={selectedMembers}
        show={showBlockMemberModal}
        onClose={() => setShowBlockMemberModal(false)}
        operation={modalOperation}
      />
      <GroupMembersModal
        id="groupMembersModal"
        title="會員群組設定"
        groups={groups || []}
        selectedGroup={selectedGroup}
        onSelectGroup={handleSelectGroup}
        onApply={handleApplyGroupWithRefresh}
        onClose={handleCloseGroupModal}
        show={showMemberGroupModal}
      />
      <MemberFilterModal
        id="filterModal"
        title="篩選會員"
        show={showFilterModal}
        groups={groups || []}
        initialFilters={filterOptions}
        onApply={applyFilters}
        onReset={resetFilters}
        onClose={() => setShowFilterModal(false)}
      />
    </div>
  );
};

export default MembersPage;
