export interface BlockMember {
  member_id: string[];
  group: number[];
  is_blocklist: number;
  block_reason?: string;
  block_date?: string;
}
