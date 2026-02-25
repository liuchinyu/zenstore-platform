import axios from "axios";
import { CategoryType } from "../types/products/categoryType";
// const API_URL = "http://localhost:8080/api/admin/product";

// const Category = require("../../../types/product").category;

class ProductService {
  private readonly API_URL: string;

  constructor() {
    this.API_URL =
      process.env.NEXT_PUBLIC_API_URL + "/product" ||
      "http://localhost:8080/api/admin/product";
  }

  //獲取所有產品(有分頁)
  async getProductListByPage(page: number, pageSize: number, filters: any) {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/admin/product/productListByPage",
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
      const response = await axios.get(this.API_URL + "/productCategory");
      return response.data.data;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  //取得製造商分類
  async getManufactureCategory() {
    try {
      const response = await axios.get(this.API_URL + "/manufactureCategory");
      return response.data.data;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  // 取得商品、製造商所有分類
  async getAllCategory() {
    try {
      const response = await axios.get(this.API_URL + "/allCategory");
      return response.data.data;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  // 取得分類關聯
  async getCategoryRelation() {
    try {
      const response = await axios.get(this.API_URL + "/categoryRelation");
      return response.data;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  // 套用分類
  async applyCategory(payload: any) {
    try {
      const response = await axios.post(this.API_URL + "/applyCategory", {
        payload,
      });
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
      return axios.post(this.API_URL + "/category", {
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
      return axios.patch(this.API_URL + "/category", {
        category_id,
        category_title,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async checkChildCategories(category_id: number) {
    try {
      return axios.get(this.API_URL + "/checkChildCategories/" + category_id);
    } catch (e) {
      console.log(e);
    }
  }

  // 刪除分類
  async deleteCategory(category_id: number) {
    try {
      return axios.delete(this.API_URL + "/category", {
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
      const response = await axios.post(this.API_URL, payload);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // 取得指定ID商品
  async getProductById(oracle_id: string) {
    try {
      const response = await axios.get(this.API_URL + "/" + oracle_id);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // 更新產品
  async updateProduct(payload: any) {
    try {
      const response = await axios.patch(this.API_URL, payload);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // 創建標籤
  async createTag(tag_name: string) {
    try {
      const response = await axios.post(this.API_URL + "/tag", {
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
      const response = await axios.get(this.API_URL + "/tag");
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
  // 更新標籤
  async updateTag(tag_id: number, tag_name: string) {
    try {
      const response = await axios.patch(this.API_URL + "/tag", {
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
      const response = await axios.delete(this.API_URL + "/tag", {
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
      const response = await axios.get(this.API_URL + "/tagRelation");
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }
  // 套用標籤
  async applyTag(payload: any) {
    try {
      const response = await axios.post(this.API_URL + "/applyTag", {
        payload,
      });
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
      const response = await axios.patch(this.API_URL + "/updateTagCount", {});
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
      const response = await axios.post(this.API_URL + "/upload", formData);
      return response.data;
    } catch (e) {
      console.log(e);
    }
  }
  // 刪除圖片
  async deleteImage(payload: any) {
    const response = await axios.delete(this.API_URL + "/delete", {
      data: payload,
    });
    return response.data;
  }
  // 匯出excel
  async exportExcel(selectedProducts: string[]) {
    try {
      const response = await axios.get(this.API_URL + "/export-excel", {
        params: {
          selectedProducts,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  // 匯入Excel
  async importExcel(formData: FormData) {
    try {
      const response = await axios.post(
        this.API_URL + "/import-excel",
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
    const response = await axios.patch(this.API_URL + "/publish", {
      oracle_id,
      is_published,
    });
    return response.data;
  }
}

export default new ProductService();
