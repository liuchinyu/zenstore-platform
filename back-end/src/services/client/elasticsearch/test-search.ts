// services/elasticsearch/test-search.ts
import { searchProducts } from "./product.elastic";

async function testSearch() {
  try {
    console.log("開始搜尋測試...\n");

    // 測試 1: 基本搜尋
    console.log('測試 1: 基本搜尋 "ROHM"');
    const basicResult = await searchProducts("ROHM", 0, 10);
    console.log("基本搜尋結果：", JSON.stringify(basicResult, null, 2), "\n");

    // 測試 2: 帶價格範圍的搜尋
    // console.log('測試 2: 搜尋價格在 100-2000 之間的 "藍牙耳機"');
    // const priceFilterResult = await searchProducts("藍牙耳機", 0, 10, {
    //   minPrice: 1300,
    //   maxPrice: 2000,
    // });
    // console.log(
    //   "價格過濾搜尋結果：",
    //   JSON.stringify(priceFilterResult, null, 2),
    //   "\n"
    // );

    // 測試 3: 搜尋相機相關產品
    // console.log('測試 3: 搜尋 "相機"');
    // const cameraResult = await searchProducts("相機");
    // console.log("相機搜尋結果：", JSON.stringify(cameraResult, null, 2));
  } catch (error) {
    console.error("搜尋測試失敗：", error);
  }
}

testSearch();
