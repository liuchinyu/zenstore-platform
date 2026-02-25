import axios from "axios";
import { News } from "@/types/news/newsType";

class NewsService {
  private readonly API_URL: string;

  constructor() {
    this.API_URL =
      process.env.NEXT_PUBLIC_API_URL + "/content" ||
      "http://localhost:8080/api/admin/content";
  }

  // 新聞API
  async getNews() {
    try {
      const response = await axios.get(this.API_URL + "/news");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching news:", error);
      throw error;
    }
  }

  async createNews(data: News) {
    try {
      const response = await axios.post(this.API_URL + "/news", {
        data,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating news:", error);
      throw error;
    }
  }

  async updateNews(id: string, data: Partial<News>) {
    try {
      const response = await axios.put(this.API_URL + "/news/" + id, {
        data,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating news:", error);
      throw error;
    }
  }

  async deleteNews(id: string) {
    try {
      const response = await axios.delete(this.API_URL + "/news/" + id);
      return response.data;
    } catch (error) {
      console.error("Error deleting news:", error);
      throw error;
    }
  }
}

export default new NewsService();
