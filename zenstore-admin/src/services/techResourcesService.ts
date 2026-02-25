import axios from "axios";

class TechResourcesService {
  private readonly API_URL: string;

  constructor() {
    this.API_URL =
      process.env.NEXT_PUBLIC_API_URL + "/content" ||
      "http://localhost:8080/api/admin/content";
  }

  // 技術文章API
  async getTechResources() {
    try {
      const response = await axios.get(this.API_URL + "/tech-resources");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching tech resources:", error);
      throw error;
    }
  }

  async createTechResource(data: any) {
    try {
      const response = await axios.post(this.API_URL + "/tech-resources", {
        data,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating tech resource:", error);
      throw error;
    }
  }

  async updateTechResource(id: string, data: any) {
    try {
      const response = await axios.put(this.API_URL + "/tech-resources/" + id, {
        data,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating tech resource:", error);
      throw error;
    }
  }

  async deleteTechResource(id: string) {
    try {
      const response = await axios.delete(
        this.API_URL + "/tech-resources/" + id,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting tech resource:", error);
      throw error;
    }
  }
}

export default new TechResourcesService();
