import { Request, Response, Router, RequestHandler } from "express";
import { authenticateToken } from "@/middlewares/authMiddleware";
import {
  createOrder,
  getOrder,
  getOrderDetail,
} from "@/models/client/orders/orders.model";

const router = Router();

// 創建訂單
router.post("/", authenticateToken, (async (req: Request, res: Response) => {
  try {
    const orderData = req.body;

    // 解構並儲存 shippingInfo
    const {
      shippingInfo,
      paymentInfo,
      items,
      totalAmount,
      member_id,
      shippingFee,
    } = orderData;

    // 處理訂單項目
    const orderItems = items.map((item: any) => {
      const {
        MEMBER_ID,
        ORACLE_ID,
        PRODUCT_ID,
        QUANTITY,
        PRICE,
        FIXED_LOT_MULTIPLIER,
        BRAND,
        IMAGE_URL,
      } = item;

      return {
        MEMBER_ID,
        ORACLE_ID,
        PRODUCT_ID,
        QUANTITY,
        PRICE,
        FIXED_LOT_MULTIPLIER,
        BRAND,
        IMAGE_URL,
        subtotal: PRICE * QUANTITY,
      };
    });

    const result = await createOrder(
      shippingInfo,
      paymentInfo,
      orderItems,
      totalAmount,
      member_id,
      shippingFee,
    );

    if (!result.success) {
      return res.status(422).json({
        success: false,
        message: result.message,
      });
    }
    return res.status(201).json({
      success: true,
      message: "訂單已成功創建",
      orderId: "ORD-" + Date.now(), // 實際應用中應使用數據庫生成的ID
    });
  } catch (error) {
    console.error("創建訂單時發生錯誤:", error);
    res.status(500).json({
      success: false,
      message: "創建訂單時發生錯誤",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}) as RequestHandler);

// 讀取訂單
router.get("/", authenticateToken, (async (req: Request, res: Response) => {
  try {
    const member_id = req.query.member_id as string;
    const filters = req.query.filters;
    const order_master = await getOrder(member_id, filters);
    if (order_master.success) {
      res.status(200).json({
        success: true,
        message: "訂單已成功讀取",
        order_master: order_master.order_master_integrate,
      });
    } else {
      res.status(500).json({
        success: false,
        message: order_master.message,
      });
    }
  } catch (error) {
    console.log("讀取訂單時發生錯誤:", error);
    res.status(500).json({
      success: false,
      message: "讀取訂單時發生錯誤",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}) as RequestHandler);

// 讀取訂單明細
router.get("/:order_id", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const order_id = req.params.order_id;
    const order_detail = await getOrderDetail(order_id);
    if (order_detail.success) {
      res.status(200).json({
        success: true,
        message: "訂單明細已成功讀取",
        order_detail: order_detail.order_detail,
      });
    } else {
      res.status(500).json({
        success: false,
        message: order_detail.message,
      });
    }
  } catch (error) {
    console.log("讀取訂單明細時發生錯誤:", error);
    res.status(500).json({
      success: false,
      message: "讀取訂單明細時發生錯誤",
    });
  }
}) as RequestHandler);
export default router;
