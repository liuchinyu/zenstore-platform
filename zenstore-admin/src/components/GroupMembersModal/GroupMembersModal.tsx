import { useEffect, useState } from "react";
import { GroupMembersType } from "@/types/products/memberType";
import Modal from "@/components/ui/Modal";

interface GroupMembersModalProps {
  id: string;
  title: string;
  groups: GroupMembersType[];
  selectedGroup: number[];
  onSelectGroup: (groupId: number) => void;
  onApply: () => void;
  onClose: () => void;
  show?: boolean;
}

const GroupMembersModal = ({
  id,
  title,
  groups,
  selectedGroup,
  onSelectGroup,
  onApply,
  onClose,
  show,
}: GroupMembersModalProps) => {
  const [showGroupList, setShowGroupList] = useState(false);
  const [tempSelectedGroup, setTempSelectedGroup] = useState<number[]>([]);

  useEffect(() => {
    setTempSelectedGroup([...selectedGroup]);
  }, [selectedGroup]);

  const handleClose = () => {
    onClose();
    setShowGroupList(false);
    setTempSelectedGroup(selectedGroup);
  };

  return (
    <Modal id={id} title={title} show={!!show} onClose={handleClose}>
      <div className="mb-3">群組分類</div>
      <div className="mb-4">
        <div className="card">
          <div
            className="card-header d-flex justify-content-between"
            onClick={() => setShowGroupList(!showGroupList)}
            style={{ cursor: "pointer" }}
          >
            <span>選擇會員群組</span>
            <i
              className={`bi ${
                showGroupList ? "bi-chevron-up" : "bi-chevron-down"
              }`}
            ></i>
          </div>
          {showGroupList && (
            <div className="card-body">
              <div className="list-group">
                <div className="d-flex mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="搜尋會員群組"
                  />
                  <button
                    className="btn btn-outline-secondary ms-1"
                    type="button"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
                {groups.length > 0 ? (
                  <div className="list-group">
                    {groups.map((group) => (
                      <button
                        key={group.GROUP_ID}
                        className={`list-group-item list-group-item-action d-flex justify-content-between ${
                          tempSelectedGroup.includes(group.GROUP_ID)
                            ? "active border-2"
                            : ""
                        }`}
                        onClick={() => onSelectGroup(group.GROUP_ID)}
                        style={{
                          borderBottom: "1px solid #dee2e6",
                          textAlign: "left",
                        }}
                      >
                        {group.GROUP_NAME}
                        {tempSelectedGroup.includes(group.GROUP_ID) && (
                          <i className="bi bi-check-lg ms-2"></i>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">尚無會員群組</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="d-flex justify-content-end mt-4">
        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={handleClose}
        >
          取消
        </button>
        <button type="button" className="btn btn-primary" onClick={onApply}>
          套用
        </button>
      </div>
    </Modal>
  );
};

export default GroupMembersModal;
