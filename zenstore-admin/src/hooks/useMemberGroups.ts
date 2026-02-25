import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import {
  useGetGroupsQuery,
  useGetGroupRelationsQuery,
  useApplyGroupMutation,
} from "@/store/api/memberApi";

export const useMemberGroups = (memberId?: string | string[]) => {
  const { showToast } = useToast();

  const { data: groups } = useGetGroupsQuery();
  const { data: groupRelation } = useGetGroupRelationsQuery();
  const [applyGroup] = useApplyGroupMutation();

  const [showMemberGroupModal, setShowMemberGroupModal] =
    useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<number[]>([]);
  const [memberGroupName, setMemberGroupName] = useState<string>("");

  // 預設會員群組分類
  useEffect(() => {
    if (showMemberGroupModal && memberId) {
      const memberIds = Array.isArray(memberId) ? memberId : [memberId];
      if (memberIds.length === 1 && groupRelation) {
        const relations = groupRelation.filter(
          (rel: any) => rel.MEMBER_ID === memberIds[0],
        );
        const groupIds = relations.map((rel: any) => rel.GROUP_ID);
        // 取得該會員的群組
        setSelectedGroup(groupIds);
      } else {
        setSelectedGroup([]);
      }
    }
  }, [showMemberGroupModal, memberId, groupRelation]);

  // 記錄選擇標籤
  const handleSelectGroup = (groupId: number) => {
    if (selectedGroup.includes(groupId)) {
      setSelectedGroup(selectedGroup.filter((id) => id !== groupId));
    } else {
      setSelectedGroup([...selectedGroup, groupId]);
    }
  };

  const handleApplyGroup = async () => {
    if (!memberId) return false;

    const memberIds = Array.isArray(memberId) ? memberId : [memberId];
    const payload = {
      memberIds: memberIds,
      groupIds: selectedGroup,
    };

    try {
      await applyGroup(payload).unwrap();

      setShowMemberGroupModal(false);
      showToast({
        type: "success",
        title: "群組設定成功",
        message: `已成功設定 ${memberIds.length} 個會員的群組`,
      });

      // RTK Query 會自動因 invalidatesTags 更新資料，不需手動 fetch

      return true;
    } catch (error) {
      showToast({
        type: "error",
        title: "群組設定失敗",
        message: "操作失敗，請稍後再試",
      });

      return false;
    }
  };

  const handleOpenGroupModal = () => {
    setShowMemberGroupModal(true);
  };

  const handleCloseGroupModal = () => {
    setShowMemberGroupModal(false);
  };

  return {
    groups,
    groupRelation,
    showMemberGroupModal,
    selectedGroup,
    memberGroupName,
    setMemberGroupName,
    handleSelectGroup,
    handleApplyGroup,
    handleOpenGroupModal,
    handleCloseGroupModal,
  };
};
