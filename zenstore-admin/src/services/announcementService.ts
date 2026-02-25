import axios from "axios";
import { Announcement } from "@/types/announcements/announcementType";

class AnnouncementService {
  private readonly API_URL: string;

  constructor() {
    this.API_URL =
      process.env.NEXT_PUBLIC_API_URL + "/content" ||
      "http://localhost:8080/api/admin/content";
  }

  // 公告API
  async getAnnouncements() {
    try {
      const response = await axios.get(this.API_URL + "/announcements");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching announcements:", error);
      throw error;
    }
  }

  async createAnnouncement(data: Announcement) {
    try {
      const response = await axios.post(this.API_URL + "/announcements", {
        data,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating announcement:", error);
      throw error;
    }
  }

  async updateAnnouncement(id: string, data: Partial<Announcement>) {
    try {
      const response = await axios.put(this.API_URL + "/announcements/" + id, {
        data,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating announcement:", error);
      throw error;
    }
  }

  async deleteAnnouncement(id: string) {
    try {
      const response = await axios.delete(
        this.API_URL + "/announcements/" + id,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting announcement:", error);
      throw error;
    }
  }
}

export default new AnnouncementService();
