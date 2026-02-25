export interface Announcement {
  ANNOUNCEMENTS_ID?: string;
  TITLE: string;
  CATEGORY: string;
  CONTENT: string;
  STATUS: number;
  PUBLISH_DATE?: string;
  END_DATE?: string;
}

export interface AnnouncementState {
  announcements: Announcement[];
  isLoading: boolean;
  error: string | null;
  activeRequests: number;
}
