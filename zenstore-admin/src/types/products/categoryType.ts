export interface Category {
  category_name: string;
  level: number;
  parent_id: number;
}

export interface CategoryType {
  CATEGORY_ID: number;
  CATEGORY_TITLE: string;
  PARENT_ID: number;
  CATEGORY_LEVEL: number;
  CATEGORY_TYPE: string;
  CREATED_AT?: string;
  UPDATED_AT?: string;
}

export interface CategoryRelationType {
  ORACLE_ID: string;
  CATEGORY_ID: number;
}

export interface CategoryNode extends CategoryType {
  children: CategoryNode[];
}
