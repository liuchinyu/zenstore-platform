"use client";
import { StatsCard } from "../components/content/StatsCard";
import { ChartCard } from "../components/content/ChartCard";
import { useContent } from "@/hooks/useContent";

export default function Home() {
  const {
    unshippedOrderCount,
    unpaidOrderCount,
    lowStockProductCount,
    salesFigures,
    ordersLength,
  } = useContent();

  return (
    <div className="content-container p-4">
      {/* 頁面標題 */}
      <h1 className="mb-4 fw-bold">總覽</h1>

      {/* 歡迎區域 */}
      <div className="welcome-section bg-light p-4 rounded-3 mb-4">
        <h2 className="mb-1">歡迎回來，</h2>
        <p className="text-muted mb-3">查看目前的業務情形</p>

        <div className="row g-4">
          {/* 訂單未出貨統計卡片 */}
          <div className="col-md-4">
            <StatsCard
              title="訂單未出貨"
              value={unshippedOrderCount}
              icon="box"
              iconBg="primary"
            />
          </div>

          {/* 訂單未付款統計卡片 */}
          <div className="col-md-4">
            <StatsCard
              title="訂單未付款"
              value={unpaidOrderCount}
              icon="wallet"
              iconBg="info"
            />
          </div>

          {/* 商品需補貨統計卡片 */}
          <div className="col-md-4">
            <StatsCard
              title="商品需補貨"
              value={lowStockProductCount}
              icon="tag"
              iconBg="danger"
            />
          </div>
        </div>
      </div>

      {/* 時間選擇器 */}
      <div className="time-filter mb-4">
        <select className="form-select w-auto">
          <option value="30">30天內</option>
          <option value="60">60天內</option>
          <option value="90">90天內</option>
        </select>
      </div>

      {/* 圖表區域 */}
      <div className="row g-4">
        {/* 總銷售額圖表 */}
        <div className="col-md-4">
          <ChartCard
            title="總銷售額"
            value={"$" + salesFigures.toLocaleString("TW") + " NTD"}
            moreLink="/orders"
          />
        </div>

        {/* 訂單數圖表 */}
        <div className="col-md-4">
          <ChartCard
            title="訂單數"
            value={ordersLength + "筆訂單"}
            moreLink="/orders"
          />
        </div>

        {/* 網站訪客數圖表 */}
        <div className="col-md-4">
          <ChartCard title="網站訪客數" value="0訪客數" moreLink="/visitors" />
        </div>
      </div>
    </div>
  );
}
