import { initializeElasticsearch } from "../../../config/elasticsearch";

async function testConnection() {
  try {
    const result = await initializeElasticsearch();
    if (result) {
      console.log("Elasticsearch 連接測試成功！");
    } else {
      console.log("Elasticsearch 連接測試失敗！");
    }
  } catch (error) {
    console.error("測試過程發生錯誤：", error);
  }
}

testConnection();
