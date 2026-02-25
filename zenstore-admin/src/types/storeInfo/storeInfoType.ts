export interface StoreInfo {
  ID?: number;
  TITLE: string;
  CONTENT: string;
  TITLE_COLOR: string;
  TITLE_FONT_SIZE: number;
  CONTENT_COLOR: string;
  CONTENT_FONT_SIZE: number;
  IMAGE_URL?: string;
  IS_ACTIVE: number; // 0/1
  CREATED_AT?: string;
  UPDATED_AT?: string;
}

export interface StoreInfoState {
  items: StoreInfo[];
  loading: boolean;
  error: string | null;
}

export interface UploadImageResponse {
  success: boolean;
  file_path?: string;
  message?: string;
}
