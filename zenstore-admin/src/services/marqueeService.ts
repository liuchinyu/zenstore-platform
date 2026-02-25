import axios from "axios";
import { MarqueeItem } from "../types/marquee/marqueeType";

class MarqueeService {
  private readonly API_URL: string;

  constructor() {
    this.API_URL =
      process.env.NEXT_PUBLIC_API_URL + "/content/marquee" ||
      "http://localhost:8080/api/admin/content/marquee";
  }

  async getItems() {
    const response = await axios.get(this.API_URL);
    return response.data.data;
  }

  async addItem(item: Omit<MarqueeItem, "ID">) {
    const response = await axios.post(this.API_URL, { item });
    return response.data;
  }

  async updateItem(item: MarqueeItem) {
    const response = await axios.patch(`${this.API_URL}/${item.ID}`, { item });
    return response.data;
  }

  async deleteItem(id: number) {
    const response = await axios.delete(`${this.API_URL}/${id}`);
    return response.data;
  }

  async activate(id: number) {
    // 後端保證單一啟用
    const response = await axios.post(`${this.API_URL}/${id}/activate`);
    return response.data;
  }

  async deactivate(id: number) {
    const response = await axios.post(`${this.API_URL}/${id}/deactivate`);
    return response.data;
  }
}

export default new MarqueeService();
