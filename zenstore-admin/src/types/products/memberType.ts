export interface BlockMember {
  member_id: string[];
  group_id: number[];
  is_blocklist: number;
  block_reason?: string;
  block_date?: string;
}

export interface GroupMembersType {
  GROUP_ID: number;
  GROUP_NAME: string;
  GROUP_COUNT: number;
}
