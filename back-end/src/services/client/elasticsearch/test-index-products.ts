// test-index-products.ts
import { syncProductsToElasticsearch } from "./product.elastic";

const testProducts = [
  {
    PRODUCT_ID: "P001",
    DESCRIPTION: "高品質藍牙耳機，無線連接，降噪功能",
    BRAND: "SoundMaster",
    INVENTORY: 100,
    FIXED_LOT_MULTIPLIER: 1,
    IMAGE_URL: "http://example.com/images/headphones.jpg",
    PRICE: 1299.99,
    CATEGORY_IDS: ["C001", "C002"],
  },
  {
    PRODUCT_ID: "P002",
    DESCRIPTION: "專業級攝影相機，4K解析度，光學變焦",
    BRAND: "PhotoPro",
    INVENTORY: 50,
    FIXED_LOT_MULTIPLIER: 1,
    IMAGE_URL: "http://example.com/images/camera.jpg",
    PRICE: 15999.99,
    CATEGORY_IDS: ["C003"],
  },
];

async function indexTestProducts() {
  try {
    const result = await syncProductsToElasticsearch(testProducts);
    console.log("測試產品索引結果:", result);
  } catch (error) {
    console.error("索引測試產品時發生錯誤:", error);
  }
}

indexTestProducts();
