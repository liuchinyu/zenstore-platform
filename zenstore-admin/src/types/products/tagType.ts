export interface TagType {
  TAG_ID: number;
  TAG_NAME: string;
  PRODUCT_COUNT: number; // 關聯的商品數量
  CREATD_AT?: string;
  UPDATED_AT?: string;
}

export interface TagState {
  tags: TagType[]; // 使用陣列存儲所有標籤
  selectedTags: string[]; // 用於存儲選中的標籤ID
  tagRelation: TagRelationType[];
  isLoading: boolean;
  error: string | null;
  activeRequests: number;
}

export interface TagRelationType {
  ORACLE_ID: string;
  TAG_ID: number;
}
