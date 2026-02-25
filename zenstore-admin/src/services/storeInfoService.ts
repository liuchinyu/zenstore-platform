import axios from "axios";
import {
  StoreInfo,
  UploadImageResponse,
} from "../types/storeInfo/storeInfoType";

class StoreInfoService {
  private readonly API_URL: string;

  constructor() {
    this.API_URL =
      process.env.NEXT_PUBLIC_API_URL + "/content/store-info" ||
      "http://localhost:8080/api/admin/content/store-info";
  }

  // 獲取所有商場資訊
  async getItems() {
    const response = await axios.get(this.API_URL);
    return response.data.data;
  }

  // 新增商場資訊
  async addItem(data: Omit<StoreInfo, "ID">) {
    const response = await axios.post(this.API_URL, { data });
    return response.data;
  }

  // 更新商場資訊
  async updateItem(data: StoreInfo) {
    const response = await axios.patch(`${this.API_URL}/${data.ID}`, { data });
    return response.data;
  }

  // 刪除商場資訊
  async deleteItem(id: number) {
    const response = await axios.delete(`${this.API_URL}/${id}`);
    return response.data;
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

  // 刪除圖片
  async deleteImage(imageUrl: string) {
    const response = await axios.delete(`${this.API_URL}/image`, {
      data: { imageUrl },
    });
    return response.data;
  }

  // 啟用商場資訊
  async activate(id: number) {
    const response = await axios.post(`${this.API_URL}/${id}/activate`);
    return response.data;
  }

  // 停用商場資訊
  async deactivate(id: number) {
    const response = await axios.post(`${this.API_URL}/${id}/deactivate`);
    return response.data;
  }
}

export default new StoreInfoService();
