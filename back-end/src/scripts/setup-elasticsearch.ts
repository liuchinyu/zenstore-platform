import { createProductIndex } from "../services/client/elasticsearch/product.elastic";

async function setup() {
  try {
    const result = await createProductIndex();
    console.log("索引創建結果:", result);
  } catch (error) {
    console.error("設置索引時發生錯誤:", error);
  }
}

setup();
