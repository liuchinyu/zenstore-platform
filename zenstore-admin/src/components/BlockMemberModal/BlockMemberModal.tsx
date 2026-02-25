import React, { useState } from "react";
import { useOperateMemberMutation } from "@/store/api/memberApi";
import { useToast } from "@/components/ui/Toast";

interface BlockMemberModalProps {
  id: string;
  title: string;
  members: string[];
  show: boolean;
  onClose: () => void;
  operation: "block" | "unblock";
  onSuccess?: () => void;
}

const BlockMemberModal: React.FC<BlockMemberModalProps> = ({
  id,
  title,
  members,
  show,
  onClose,
  operation,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [operateMember] = useOperateMemberMutation();
  const [blockReason, setBlockReason] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [blockDate, setBlockDate] = useState(today);

  const handleSubmit = async () => {
    try {
      // 根據操作類型設置不同的參數
      const blockMemberData = {
        member_id: members,
        is_blocklist: operation === "block" ? 1 : 0,
        ...(operation === "block" && { block_reason: blockReason }),
        ...(operation === "block" && { block_date: blockDate }),
        group_id: [],
      };

      const response = await operateMember(blockMemberData).unwrap();

      if (response && response.success) {
        showToast({
          type: "success",
          title: operation === "block" ? "停權成功" : "解封成功",
          message:
            operation === "block" ? "已成功停權所選會員" : "已成功解封所選會員",
        });
        if (onSuccess) onSuccess();
      }
      onClose();
      // 清空表單
      setBlockReason("");
      setBlockDate("");
    } catch (error) {
      showToast({
        type: "error",
        title: "操作失敗",
        message: `${operation === "block" ? "停權" : "解封"}會員時發生錯誤`,
      });
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}Label`}
      style={{
        display: show ? "block" : "none",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      <div className="modal-dialog">
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
            <p>已選擇 {members.length} 位會員</p>

            {operation === "block" ? (
              <div className="mb-3">
                <label htmlFor="blockReason" className="form-label">
                  停權原因
                </label>
                <textarea
                  className="form-control"
                  id="blockReason"
                  rows={3}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  required
                ></textarea>
              </div>
            ) : (
              <p>確定要解封所選會員嗎？</p>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              確認
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockMemberModal;
