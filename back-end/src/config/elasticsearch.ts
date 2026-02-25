// config/elasticsearch.ts
import { Client } from "@elastic/elasticsearch";

const elasticClient = new Client({
  node: "http://localhost:9200",
  auth: {
    // 如果設置了用戶名密碼，請取消註釋以下行
    username: "test1",
    password: "test0001",
  },
  tls: {
    // 如果您使用 HTTPS，請設置為 true
    rejectUnauthorized: false,
  },
});

// 初始化 Elasticsearch 連接
async function initializeElasticsearch() {
  try {
    const info = await elasticClient.info();
    console.log("Elasticsearch 連接成功");
    // console.log("Elasticsearch 信息:", info);
    return true;
  } catch (error) {
    console.error("Elasticsearch 連接失敗:", error);
    return false;
  }
}
initializeElasticsearch();

export { elasticClient, initializeElasticsearch };
