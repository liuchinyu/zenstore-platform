export interface TechResource {
  TECH_ID?: string;
  TITLE: string;
  CATEGORY: string;
  DESCRIPTION: string;
  URL: string;
  UPLOAD_DATE?: string;
}

export interface TechResourceState {
  resources: TechResource[];
  isLoading: boolean;
  error: string | null;
  activeRequests: number;
}
