// services/elasticsearch/product.elastic.ts
import { elasticClient } from "../../../config/elasticsearch";

// 產品索引名稱
const PRODUCT_INDEX = "products";

// 創建產品索引
export async function createProductIndex() {
  try {
    const indexExists = await elasticClient.indices.exists({
      index: PRODUCT_INDEX,
    });
    if (indexExists) {
      await elasticClient.indices.delete({
        index: PRODUCT_INDEX,
      });
      console.log(`刪除了已存在的索引: ${PRODUCT_INDEX}`);
    }

    // 創建新的索引並定義映射
    await elasticClient.indices.create({
      index: PRODUCT_INDEX,
      body: {
        mappings: {
          properties: {
            PRODUCT_ID: {
              type: "text",
              analyzer: "product_id_analyzer",
              search_analyzer: "product_id_analyzer",
              fields: {
                keyword: { type: "keyword" },
                ngram: {
                  type: "text",
                  analyzer: "product_id_ngram_analyzer",
                },
                prefix: {
                  type: "text",
                  analyzer: "product_id_prefix_analyzer",
                },
              },
            },
            DESCRIPTION: {
              type: "text",
              analyzer: "ik_max_word",
              search_analyzer: "ik_smart",
            },
            BRAND: { type: "keyword" },
            INVENTORY: { type: "integer" },
            FIXED_LOT_MULTIPLIER: { type: "integer" },
            IMAGE_URL: { type: "keyword" },
            PRICE: { type: "float" },
            ORACLE_ID: { type: "keyword" },
            // 新增專門用於搜尋的欄位
            category_names: {
              type: "text",
              analyzer: "ik_max_word",
              search_analyzer: "ik_smart",
            },
            // 新的類別映射結構
            categories: {
              type: "object",
              dynamic: true,
              properties: {
                // 動態映射所有類別名稱
                "*": {
                  properties: {
                    ids: { type: "keyword" },
                    type: { type: "keyword" },
                    parent_id: { type: "keyword" },
                  },
                },
              },
            },
          },
        },
        settings: {
          // 設置 ngram 差值上限
          "index.max_ngram_diff": 10,
          analysis: {
            analyzer: {
              ik_smart: {
                type: "custom",
                tokenizer: "ik_smart",
              },
              ik_max_word: {
                type: "custom",
                tokenizer: "ik_max_word",
              },
              // 產品ID專用分析器 - 標準分詞
              product_id_analyzer: {
                type: "custom",
                tokenizer: "standard",
                filter: ["lowercase"],
              },
              // 產品ID的ngram分析器 - 支持部分匹配
              product_id_ngram_analyzer: {
                type: "custom",
                tokenizer: "product_id_ngram_tokenizer",
                filter: ["lowercase"],
              },
              // 產品ID的前綴分析器 - 支持前綴匹配
              product_id_prefix_analyzer: {
                type: "custom",
                tokenizer: "standard",
                filter: ["lowercase", "product_id_edge_ngram_filter"],
              },
            },
            tokenizer: {
              product_id_ngram_tokenizer: {
                type: "ngram",
                min_gram: 2,
                max_gram: 10,
                token_chars: ["letter", "digit"],
              },
            },
            filter: {
              product_id_edge_ngram_filter: {
                type: "edge_ngram",
                min_gram: 2,
                max_gram: 20,
              },
            },
          },
        },
      },
    });

    console.log(`成功創建索引: ${PRODUCT_INDEX}`);
    return true;
  } catch (error) {
    console.error(`創建索引失敗: ${PRODUCT_INDEX}`, error);
    return false;
  }
}

// 將產品數據同步到 Elasticsearch
export async function syncProductsToElasticsearch(products: any[]) {
  try {
    if (!products || products.length === 0) {
      console.log("沒有產品數據需要同步");
      return true;
    }

    // 預處理資料，添加 category_names 欄位
    const processedProducts = products.map((product) => {
      // 從 categories 物件中提取所有類別名稱
      const categoryNames = Object.keys(product.categories || {}).join(" ");
      // console.log("categoryNames", categoryNames);
      return {
        ...product,
        category_names: categoryNames,
      };
    });

    const bulkOperations = processedProducts.flatMap((product) => [
      { index: { _index: PRODUCT_INDEX, _id: product.PRODUCT_ID } },
      product,
    ]);

    const result = await elasticClient.bulk({
      refresh: true,
      operations: bulkOperations,
    });

    if (result.errors) {
      console.error("產品批量導入存在錯誤:", result.errors);
      return false;
    }

    console.log(`成功同步 ${products.length} 個產品到 Elasticsearch`);
    return true;
  } catch (error) {
    console.error("同步產品到 Elasticsearch 失敗:", error);
    return false;
  }
}

// 搜索產品
export async function searchProducts(
  query: string,
  from: number = 0,
  size: number,
  filters?: any,
) {
  try {
    const searchQuery: any = {
      bool: {
        should: [
          // 搜尋基本欄位
          {
            multi_match: {
              query: query,
              fields: ["DESCRIPTION^3", "BRAND", "category_names^2"],
              type: "best_fields",
            },
          },
          // PRODUCT_ID 精確匹配 - 最高權重
          {
            term: {
              "PRODUCT_ID.keyword": {
                value: query,
                boost: 10.0,
              },
            },
          },
          // PRODUCT_ID 前綴匹配 - 較高權重
          {
            prefix: {
              "PRODUCT_ID.keyword": {
                value: query,
                boost: 5.0,
              },
            },
          },
          // 使用前綴匹配而不是部分匹配
          {
            match_phrase_prefix: {
              PRODUCT_ID: {
                query: query,
                boost: 4.0,
              },
            },
          },
        ],
        minimum_should_match: 1,
      },
    };
    console.log("filters", filters);
    // 添加過濾條件
    if (filters) {
      if (filters.categoryId) {
        searchQuery.bool.filter = searchQuery.bool.filter || [];
        searchQuery.bool.filter.push({
          term: { CATEGORY_IDS: filters.categoryId },
        });
      }

      if (filters.minPrice || filters.maxPrice) {
        const priceRange: any = { range: { PRICE: {} } };
        if (filters.minPrice) priceRange.range.PRICE.gte = filters.minPrice;
        if (filters.maxPrice) priceRange.range.PRICE.lte = filters.maxPrice;

        searchQuery.bool.filter = searchQuery.bool.filter || [];
        searchQuery.bool.filter.push(priceRange);
      }
    }

    const result = await elasticClient.search({
      index: PRODUCT_INDEX,
      body: {
        query: searchQuery,
        from: from,
        size: size,
        sort: [{ _score: { order: "desc" } }, { PRICE: { order: "asc" } }],
        highlight: {
          fields: {
            DESCRIPTION: {},
            PRODUCT_ID: {},
          },
        },
      },
    });

    return {
      total: result.hits.total,
      hits: result.hits.hits.map((hit) => ({
        ...((hit._source as Record<string, any>) || {}),
        score: hit._score,
        highlight: hit.highlight,
      })),
    };
  } catch (error) {
    console.error("搜索產品失敗:", error);
    throw error;
  }
}
