// import {
//   getProductList,
//   getProductCategories,
// } from "../models/client/product/product.model";

// import {
//   syncProductsToElasticsearch,
//   createProductIndex,
// } from "../services/client/elasticsearch/product.elastic";

// import { Product } from "../types/product";

// async function syncAllProductsToElasticsearch() {
//   try {
//     console.log("開始將產品數據同步到Elasticsearch...");

//     // 第一步：確保產品索引存在
//     console.log("檢查並創建產品索引...");
//     const indexResult = await createProductIndex();
//     if (!indexResult) {
//       throw new Error("創建產品索引失敗");
//     }

//     // 第二步：從資料庫獲取所有產品
//     console.log("從資料庫獲取產品數據...");
//     const productsResult = await getProductList();
//     if (!productsResult || !productsResult.rows) {
//       throw new Error("獲取產品數據失敗");
//     }

//     // 將資料庫結果轉換為產品對象
//     const products: Product[] = [];
//     // let i = 1;
//     for (const row of productsResult.rows as any[]) {
//       // 基本產品資訊
//       const product: Product = {
//         PRODUCT_ID: row[0],
//         DESCRIPTION: row[1],
//         BRAND: row[2],
//         INVENTORY: row[3],
//         FIXED_LOT_MULTIPLIER: row[4],
//         IMAGE_URL: row[5],
//         PRICE: row[6],
//         ORACLE_ID: row[7],
//         categories: {}, // 初始化空物件，取代原來的 CATEGORY_ID 數組
//       };

//       // 獲取產品類別資訊
//       try {
//         product.categories = await getProductCategories(product.ORACLE_ID);
//         // console.log("product_categories", product);
//         // i++;
//         // if (i == 2) break;
//       } catch (error) {
//         console.error(`獲取產品 ${product.ORACLE_ID} 的類別信息失敗:`, error);
//         // 即使類別獲取失敗，也繼續處理其他產品
//       }

//       products.push(product);
//     }

//     console.log(`轉換了 ${products.length} 個產品數據`);

//     // 第三步：同步到Elasticsearch
//     const syncResult = await syncProductsToElasticsearch(products);
//     if (syncResult) {
//       console.log(`成功將 ${products.length} 個產品同步到Elasticsearch`);
//     } else {
//       throw new Error("同步產品數據失敗");
//     }

//     return true;
//   } catch (error) {
//     console.error("產品數據同步失敗:", error);
//     return false;
//   }
// }

// // 執行同步
// syncAllProductsToElasticsearch()
//   .then((success) => {
//     console.log(`同步過程 ${success ? "成功完成" : "失敗"}`);
//     process.exit(success ? 0 : 1);
//   })
//   .catch((err) => {
//     console.error("同步過程發生未處理錯誤:", err);
//     process.exit(1);
//   });
