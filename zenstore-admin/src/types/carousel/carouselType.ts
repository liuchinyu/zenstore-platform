export interface CarouselItem {
  ID?: number;
  TITLE: string;
  DESCRIPTION: string;
  IMAGE_URL: string;
  BUTTON_TEXT: string;
  BUTTON_LINK: string;
  TEXT_COLOR: string;
  BACKGROUND_COLOR: string;
  POSITION: "left" | "right";
  DISPLAY_ORDER: number;
  CREATED_AT: string;
  UPDATED_AT?: string;
  IS_ACTIVE: number;
}

export interface CarouselState {
  items: CarouselItem[];
  loading: boolean;
  error: string | null;
}
