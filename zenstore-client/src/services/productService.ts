import axiosInstance, { axios } from "@/lib/axios";

class ProductService {
  private categoriesCache: any[] | null = null;
  private categoriesFetchedAt = 0;
  private categoriesPromise: Promise<{
    product: any[];
    manufacture: any[];
  }> | null = null;
  private readonly CATEGORIES_TTL = 10 * 60 * 1000; // 10 分鐘

  private productListCache: any[] | null = null;
  private productListFetchedAt = 0;
  private productListPromise: Promise<any[]> | null = null;
  private readonly PRODUCT_LIST_TTL = 10 * 60 * 1000; // 10 分鐘

  // 熱門商品
  private hotProductsCache: any[] | null = null;
  private hotProductsFetchedAt = 0;
  private hotProductsPromise: Promise<any[]> | null = null;
  private readonly HOT_PRODUCTS_TTL = 10 * 60 * 1000; // 10 分鐘

  // 最新商品
  private newProductsCache: any[] | null = null;
  private newProductsFetchedAt = 0;
  private newProductsPromise: Promise<any[]> | null = null;
  private readonly NEW_PRODUCTS_TTL = 10 * 60 * 1000; // 10 分鐘

  // 特價商品
  private saleProductsCache: any[] | null = null;
  private saleProductsFetchedAt = 0;
  private saleProductsPromise: Promise<any[]> | null = null;
  private readonly SALE_PRODUCTS_TTL = 10 * 60 * 1000; // 10 分鐘

  async getCategories(): Promise<{
    product: any[];
    manufacture: any[];
  }> {
    try {
      const now = Date.now();

      // 命中有效快取
      // if (
      //   !force &&
      //   this.categoriesCache &&
      //   now - this.categoriesFetchedAt < this.CATEGORIES_TTL
      // ) {
      //   return this.categoriesCache;
      // }

      // 如已有進行中的請求，直接共用同一個 Promise（並發合併）
      // if (!force && this.categoriesPromise) {
      //   return this.categoriesPromise;
      // }

      // 發新請求（force 或無快取/已過期）
      this.categoriesPromise = axiosInstance
        .get("/product/category")
        .then((response) => {
          const product = response.data.data.product;
          const manufacture = response.data.data.manufacture;
          const rows = [...product, ...manufacture];
          this.categoriesCache = rows;
          this.categoriesFetchedAt = Date.now();
          return { product, manufacture };
        })
        .catch((e) => {
          // 不要把錯誤結果寫進快取
          console.error("獲取分類資料異常", e);
          return { product: [], manufacture: [] };
        })
        .finally(() => {
          this.categoriesPromise = null;
        });

      return this.categoriesPromise;
    } catch (e) {
      console.error("獲取分類資料異常", e);
      return { product: [], manufacture: [] };
    }
  }

  invalidateCategoriesCache() {
    this.categoriesCache = null;
    this.categoriesFetchedAt = 0;
    this.categoriesPromise = null;
  }

  // 獲取指定產品
  async getProductByOracleId(oracleId: string) {
    try {
      const response = await axiosInstance.get(
        `/product/formatted/${oracleId}`,
      );
      return response.data;
    } catch (e) {
      return "獲取指定產品異常" + e;
    }
  }
  // 獲取指定分類的產品 (支援後端分頁)
  async getProductListByCategoryId(
    categoryId: number[],
    page: number = 1,
    pageSize: number = 25,
  ) {
    try {
      console.log("發送的categoryId___", categoryId);
      const response = await axiosInstance.get(`/product/productsByCategory`, {
        params: {
          categoryId,
          page,
          pageSize,
        },
      });

      // 回傳包含分頁資訊的完整資料
      return {
        items: response.data.data.items.rows || [],
        totalItems: response.data.data.totalItems || 0,
        totalPages: response.data.data.totalPages || 0,
        currentPage: response.data.data.currentPage || page,
      };
    } catch (e) {
      console.error("獲取指定分類的產品異常", e);
      throw e;
    }
  }

  // 分類數量對應組成
  mapCounts(rows: any[]): Record<number, number> {
    if (!Array.isArray(rows)) return {};
    return rows.reduce(
      (acc, row) => {
        const categoryId = row.CATEGORY_ID;
        const count = row["COUNT(*)"];
        acc[categoryId] = count;

        return acc;
      },
      {} as Record<number, number>,
    );
  }

  // 批次獲取多個分類的產品數量
  async getCategoryCountsBatch(
    categoryIds: number[],
  ): Promise<Record<number, number>> {
    try {
      if (!categoryIds?.length) return {};
      const response = await axiosInstance.get(
        "/product/categoryCounts/batch",
        {
          params: {
            categoryIds,
          },
        },
      );
      const rows = response.data?.data ?? [];
      return this.mapCounts(rows);
    } catch (e) {
      console.error("批次獲取分類數量異常", e);
      return {};
    }
  }

  // 取得分類關聯，用以設定篩選選單
  async getProductCategoriesRelation(category_ids?: number[]) {
    try {
      const response = await axiosInstance.get(
        `/product/productCategoriesRelation`,
        {
          params: {
            category_ids,
          },
        },
      );
      return response.data.data;
    } catch (e) {
      return "獲取指定產品異常" + e;
    }
  }

  //搜尋產品
  async searchProduct(query: string, page: number) {
    try {
      const response = await axiosInstance.get(`/product/search`, {
        params: { query, page, pageSize: 24 },
      });
      return {
        items: response.data.data.items,
        totalPages: response.data.data.totalPages,
        totalItems: response.data.data.totalItems,
        currentPage: response.data.data.currentPage,
      };
    } catch (e) {
      console.log("搜尋產品異常" + e);
    }
  }

  // 取得熱門商品
  async getHotProducts() {
    try {
      const now = Date.now();

      if (
        this.hotProductsCache &&
        now - this.hotProductsFetchedAt < this.HOT_PRODUCTS_TTL
      ) {
        return this.hotProductsCache;
      }
      if (this.hotProductsPromise) return this.hotProductsPromise;

      this.hotProductsPromise = axiosInstance
        .get("/product/hotProducts")
        .then((response) => {
          const rows = response.data?.data ?? [];
          this.hotProductsCache = rows;
          this.hotProductsFetchedAt = Date.now();
          return rows;
        })
        .catch((e) => {
          console.error("獲取熱門產品異常", e);
          return [];
        })
        .finally(() => {
          this.hotProductsPromise = null;
        });

      return this.hotProductsPromise;
    } catch (e) {
      console.error("獲取熱門產品異常", e);
      return [];
    }
  }

  // 取得最新商品
  async getNewProducts() {
    try {
      const now = Date.now();

      if (
        this.newProductsCache &&
        now - this.newProductsFetchedAt < this.NEW_PRODUCTS_TTL
      ) {
        return this.newProductsCache;
      }
      if (this.newProductsPromise) return this.newProductsPromise;

      this.newProductsPromise = axiosInstance
        .get("/product/newProducts")
        .then((response) => {
          const rows = response.data?.data ?? [];
          this.newProductsCache = rows;
          this.newProductsFetchedAt = Date.now();
          return rows;
        })
        .catch((e) => {
          console.error("獲取最新產品異常", e);
          return [];
        })
        .finally(() => {
          this.newProductsPromise = null;
        });

      return this.newProductsPromise;
    } catch (e) {
      console.error("獲取最新產品異常", e);
      return [];
    }
  }

  // 取得特價商品
  async getSaleProducts() {
    try {
      const now = Date.now();

      if (
        this.saleProductsCache &&
        now - this.saleProductsFetchedAt < this.SALE_PRODUCTS_TTL
      ) {
        return this.saleProductsCache;
      }
      if (this.saleProductsPromise) return this.saleProductsPromise;

      this.saleProductsPromise = axiosInstance
        .get("/product/saleProducts")
        .then((response) => {
          const rows = response.data?.data ?? [];
          this.saleProductsCache = rows;
          this.saleProductsFetchedAt = Date.now();
          return rows;
        })
        .catch((e) => {
          console.error("獲取特價產品異常", e);
          return [];
        })
        .finally(() => {
          this.saleProductsPromise = null;
        });

      return this.saleProductsPromise;
    } catch (e) {
      console.error("獲取特價產品異常", e);
      return [];
    }
  }
}

export default new ProductService();
