import { Router, RequestHandler } from "express";
import fs from "fs";
import path from "path";
import {
  getOrderById,
  getOrderList,
  updateOrderStatus,
  getExcelExportData,
  getCancelOrder,
  getCancelPermitOrder,
  orderCancelUpdatePermit,
  getOrderLog,
  orderCancelUpdate,
} from "@/models/admin/order/order.model";
import Excel from "exceljs";

const router = Router();

// 取得訂單資料
router.get("/", (async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 100;
    const filters = req.query.filters;
    const result = await getOrderList(page, pageSize, filters);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "獲取訂單資訊失敗",
    });
  }
}) as RequestHandler);

// 訂單資料(取消待處理)
router.get("/cancel", (async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 100;
    const filters = req.query.filters;
    const result = await getCancelOrder(page, pageSize, filters);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "獲取訂單資訊失敗",
    });
  }
}) as RequestHandler);

// 訂單資料(取消已核准)
router.get("/cancel-permit", (async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 100;
    const filters = req.query.filters;
    const result = await getCancelPermitOrder(page, pageSize, filters);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "獲取訂單資訊失敗",
    });
  }
}) as RequestHandler);

// 核准取消訂單/回復正常狀態
router.patch("/cancel-update", (async (req, res) => {
  try {
    const { cancelUpdateStatus } = req.body;
    const result = await orderCancelUpdatePermit(cancelUpdateStatus);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "獲取訂單資訊失敗",
    });
  }
}) as RequestHandler);

// 更新訂單狀態
router.patch("/status", (async (req, res) => {
  const { updateStatus } = req.body;
  const result = await updateOrderStatus(updateStatus);
  res.send(result);
}) as RequestHandler);

// 取消訂單(待核准)
router.patch("/cancel-status", (async (req, res) => {
  const { cancelUpdateStatus } = req.body;
  const result = await orderCancelUpdate(cancelUpdateStatus);
  res.send(result);
}) as RequestHandler);

// 匯出訂單資訊
router.get("/export-excel", (async (req, res) => {
  try {
    const selectedOrders = req.query.selectedOrders as string[] | null;
    const result = await getExcelExportData(selectedOrders);
    if (!result || !result.success) {
      res.status(500).json({ success: false, message: "獲取訂單資訊失敗" });
      return;
    }
    const main_order = result.data.main_order;
    const detail_order = result.data.detail_order;

    // 創建新的Excel工作簿
    const workbook = new Excel.Workbook();
    const orderSheet = workbook.addWorksheet("訂單主檔");

    const mainOrderColumnMapping: Record<string, string> = {
      0: "訂單編號",
      1: "會員姓名",
      2: "訂單狀態",
      3: "付款狀態",
      4: "配送狀態",
      5: "訂單日期",
      6: "上次異動日期",
      7: "商品總金額",
      8: "運費",
      9: "折扣金額",
      10: "訂單總金額",
      11: "收件者姓名",
      12: "收件者電話",
      13: "收件者手機",
      14: "收件者信箱",
      15: "郵遞區號",
      16: "地區",
      17: "城市",
      18: "地址",
      19: "運送時間",
      20: "運送方式",
      21: "備註",
    };

    // 如果有產品數據，設置表頭
    if (main_order && main_order.length > 0) {
      // 從第一筆數據獲取列名，使用類型斷言
      const orderKeys = Object.keys(main_order[0] as Record<string, any>);
      const orderColumns = orderKeys.map((key, index) => ({
        header: mainOrderColumnMapping[index] || key, // 使用映射的標題或原始鍵名
        key: key,
        width: 20,
      }));

      orderSheet.columns = orderColumns;
      // 添加數據行
      orderSheet.addRows(main_order);
    }

    const orderDetailSheet = workbook.addWorksheet("訂單明細檔");

    const detailOrderColumnMapping: Record<string, string> = {
      0: "訂單編號",
      1: "訂單明細",
      2: "物件編號",
      3: "零件編號",
      4: "數量",
      5: "單價",
      6: "小記",
      7: "建立時間",
    };

    if (detail_order && detail_order.length > 0) {
      const orderDetailKeys = Object.keys(detail_order[0]);
      const orderDetailColumns = orderDetailKeys.map((key, index) => ({
        header: detailOrderColumnMapping[index] || key,
        key: key,
        width: 20,
      }));

      orderDetailSheet.columns = orderDetailColumns;
      // 添加數據行
      orderDetailSheet.addRows(detail_order);
    }

    // 設置輸出路徑
    const outputDir = "\\\\10.1.1.12\\機密文件\\MIS\\67_Jerry";
    // 產生格式為: 商品資料轉出_20250728_095455.xlsx
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const fileName = `訂單資料轉出_${year}${month}${day}_${hours}${minutes}${seconds}.xlsx`;
    const outputPath = path.join(outputDir, fileName);

    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
    } catch (mkdirError) {
      console.error("創建目錄時出錯:", mkdirError);
      res
        .status(500)
        .json({ success: false, message: "伺服器無法建立儲存目錄" });
      return;
    }

    // 寫入Excel文件
    await workbook.xlsx.writeFile(outputPath);

    res.json({
      success: true,
      message: "Excel匯出成功",
      filePath: outputPath,
    });
  } catch (error) {
    console.log("error", error);
  }
}) as RequestHandler);

// 查詢指定訂單
router.get("/:order_id", (async (req, res) => {
  try {
    const { order_id } = req.params;
    const result = await getOrderById(order_id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "獲取訂單資訊失敗",
    });
  }
}) as RequestHandler);

// 查詢訂單流程
router.get("/:order_id/status-logs", (async (req, res) => {
  const { order_id } = req.params;
  const result = await getOrderLog(order_id);
  res.send(result);
}) as RequestHandler);

export default router;
