import axios from "axios";
import { CategoryType } from "../types/products/categoryType";
import axiosInstance from "../lib/axiosInstance";

class ProductService {
  private readonly RESOURCE_PATH = "/product";

  //獲取所有產品(有分頁)
  async getProductListByPage(page: number, pageSize: number, filters: any) {
    try {
      const response = await axiosInstance.get(
        this.RESOURCE_PATH + "/productListByPage",
        {
          params: { page, pageSize, filters },
        },
      );
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }

  //取得商品分類
  async getProductCategory() {
    try {
      const response = await axiosInstance.get(
        this.RESOURCE_PATH + "/productCategory",
      );
      return response.data.data;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  //取得製造商分類
  async getManufactureCategory() {
    try {
      const response = await axiosInstance.get(
        this.RESOURCE_PATH + "/manufactureCategory",
      );
      return response.data.data;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  // 取得商品、製造商所有分類
  async getAllCategory() {
    try {
      const response = await axiosInstance.get(
        this.RESOURCE_PATH + "/allCategory",
      );
      return response.data.data;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  // 取得分類關聯
  async getCategoryRelation() {
    try {
      const response = await axiosInstance.get(
        this.RESOURCE_PATH + "/categoryRelation",
      );
      return response.data;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  // 套用分類
  async applyCategory(payload: any) {
    try {
      const response = await axiosInstance.post(
        this.RESOURCE_PATH + "/applyCategory",
        {
          payload,
        },
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // 新增分類
  async createCategory(
    category_title: string,
    parent_id: number,
    category_level: number,
    category_type: string,
    extraAttributes: any = {},
  ) {
    try {
      return axiosInstance.post(this.RESOURCE_PATH + "/category", {
        category_title,
        parent_id,
        category_level,
        category_type,
        ...extraAttributes,
      });
    } catch (e) {
      console.log(e);
    }
  }
  // 修改分類
  async updateCategory(category_id: number, category_title: string) {
    try {
      return axiosInstance.patch(this.RESOURCE_PATH + "/category", {
        category_id,
        category_title,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async checkChildCategories(category_id: number) {
    try {
      return axiosInstance.get(
        this.RESOURCE_PATH + "/checkChildCategories/" + category_id,
      );
    } catch (e) {
      console.log(e);
    }
  }

  // 刪除分類
  async deleteCategory(category_id: number) {
    try {
      return axiosInstance.delete(this.RESOURCE_PATH + "/category", {
        data: {
          category_id,
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  // 創建產品
  async createProduct(payload: any) {
    try {
      const response = await axiosInstance.post(this.RESOURCE_PATH, payload);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // 取得指定ID商品
  async getProductById(oracle_id: string) {
    try {
      const response = await axiosInstance.get(
        this.RESOURCE_PATH + "/" + oracle_id,
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // 更新產品
  async updateProduct(payload: any) {
    try {
      const response = await axiosInstance.patch(this.RESOURCE_PATH, payload);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // 創建標籤
  async createTag(tag_name: string) {
    try {
      const response = await axiosInstance.post(this.RESOURCE_PATH + "/tag", {
        tag_name,
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }
  // 取得標籤資料
  async getTags() {
    try {
      const response = await axiosInstance.get(this.RESOURCE_PATH + "/tag");
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
  // 更新標籤
  async updateTag(tag_id: number, tag_name: string) {
    try {
      const response = await axiosInstance.patch(this.RESOURCE_PATH + "/tag", {
        tag_id,
        tag_name,
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }
  // 刪除標籤
  async deleteTag(tag_id: number) {
    try {
      const response = await axiosInstance.delete(this.RESOURCE_PATH + "/tag", {
        data: {
          tag_id,
        },
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  // 取得標籤關聯資料
  async getTagRelation() {
    try {
      const response = await axiosInstance.get(
        this.RESOURCE_PATH + "/tagRelation",
      );
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }
  // 套用標籤
  async applyTag(payload: any) {
    try {
      const response = await axiosInstance.post(
        this.RESOURCE_PATH + "/applyTag",
        {
          payload,
        },
      );
      if (response.data && response.data.success) {
        await this.updateTagProductCount();
      }
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
  // 更新標籤產品數量
  async updateTagProductCount() {
    try {
      const response = await axiosInstance.patch(
        this.RESOURCE_PATH + "/updateTagCount",
        {},
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // 上傳圖片
  async uploadImage(
    formData: FormData,
    type: string,
    oracle_id: string,
    brand: string,
  ) {
    try {
      formData.append("type", type);
      formData.append("oracle_id", oracle_id);
      formData.append("brand", brand);
      const response = await axiosInstance.post(
        this.RESOURCE_PATH + "/upload",
        formData,
      );
      return response.data;
    } catch (e) {
      console.log(e);
    }
  }
  // 刪除圖片
  async deleteImage(payload: any) {
    const response = await axiosInstance.delete(
      this.RESOURCE_PATH + "/delete",
      {
        data: payload,
      },
    );
    return response.data;
  }
  // 匯出excel
  async exportExcel(selectedProducts: string[]) {
    try {
      const response = await axiosInstance.get(
        this.RESOURCE_PATH + "/export-excel",
        {
          params: {
            selectedProducts,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // 匯入Excel
  async importExcel(formData: FormData) {
    try {
      const response = await axiosInstance.post(
        this.RESOURCE_PATH + "/import-excel",
        formData,
      );
      console.log("improt_response", response);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: error.response.data.success,
          message: error.response.data.message,
        };
      }
      console.log("improt_error", error);
      return { success: false, message: "系統錯誤，請稍後再試" };
    }
  }

  // 上下架
  async publishProduct(oracle_id: string[], is_published: number) {
    const response = await axiosInstance.patch(
      this.RESOURCE_PATH + "/publish",
      {
        oracle_id,
        is_published,
      },
    );
    return response.data;
  }
}

export default new ProductService();
