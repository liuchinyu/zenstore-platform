export interface MarqueeItem {
  ID?: number;
  TEXT: string;
  SPEED_MS: number; // 滾動速度（毫秒）
  TEXT_COLOR: string;
  BACKGROUND_COLOR: string;
  PUBLISH_DATE?: string; // 啟用日期（由狀態維護）
  END_DATE?: string; // 停用日期（由狀態維護）
  IS_ACTIVE: number; // 0/1
}

export interface MarqueeState {
  items: MarqueeItem[];
  loading: boolean;
  error: string | null;
}
