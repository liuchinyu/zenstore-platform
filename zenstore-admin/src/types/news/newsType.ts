export interface News {
  NEWS_ID?: string;
  TITLE: string;
  CATEGORY: string;
  DESCRIPTION: string;
  URL: string;
  UPLOAD_DATE?: string;
}

export interface NewsState {
  news: News[];
  isLoading: boolean;
  error: string | null;
  activeRequests: number;
}
