import axios from "axios";
import { CarouselItem } from "../types/carousel/carouselType";

interface UploadImageResponse {
  file_path: string;
  message?: string;
  success: boolean;
}

class CarouselService {
  private readonly API_URL: string;

  constructor() {
    this.API_URL =
      process.env.NEXT_PUBLIC_API_URL + "/content/carousel" ||
      "http://localhost:8080/api/admin/content/carousel";
  }

  // 上傳圖片
  async uploadImage(formData: FormData): Promise<UploadImageResponse> {
    try {
      const response = await axios.post<UploadImageResponse>(
        this.API_URL + "/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }

  // 獲取所有輪播項目
  async getCarouselItems() {
    try {
      const response = await axios.get(this.API_URL);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching carousel items:", error);
      throw error;
    }
  }

  // 新增輪播項目
  async addCarouselItem(item: Omit<CarouselItem, "id">) {
    try {
      const response = await axios.post(this.API_URL, item);
      return response.data;
    } catch (error) {
      console.error("Error adding carousel item:", error);
      throw error;
    }
  }

  // 更新輪播項目
  async updateCarouselItem(item: CarouselItem) {
    try {
      const response = await axios.put(`${this.API_URL}/${item.ID}`, item);
      return response.data;
    } catch (error) {
      console.error("Error updating carousel item:", error);
      throw error;
    }
  }

  // 更新輪播項目順序
  async updateCarouselItemOrder(
    id: number,
    display_order: number,
    change: number,
  ) {
    try {
      const response = await axios.patch(`${this.API_URL}/order/${id}`, {
        display_order,
        change,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating carousel item order:", error);
      throw error;
    }
  }
  // 刪除輪播項目
  async deleteCarouselItem(id: number, index: number) {
    try {
      const response = await axios.delete(`${this.API_URL}/${id}`, {
        data: { index },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting carousel item:", error);
      throw error;
    }
  }
}

export default new CarouselService();
