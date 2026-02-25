import e, { Request, Response, Router, RequestHandler } from "express";
import { authenticateToken } from "@/middlewares/authMiddleware";
import {
  creareShippingAddress,
  deleteShippingAddress,
  getShippingAddress,
  updateShippingAddress,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  addToCart,
  getCart,
  checkCart,
  updateCart,
  deleteCart,
  guestAddToCart,
} from "@/models/client/account/acocunt.model";

const router = Router();

// 創建收件地址
router.post("/shipping-address", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { member_id, address } = req.body;
    const shippingAddress = await creareShippingAddress(member_id, address);
    if (shippingAddress) {
      res.status(200).json({
        message: "收件地址創建成功",
      });
    } else {
      res.status(400).json({
        message: "收件地址創建失敗",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "系統異常，請聯絡相關人員",
      error,
    });
  }
}) as RequestHandler);

// 取得收件地址
router.get("/shipping-address", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { member_id } = req.query;
    const result = await getShippingAddress(member_id as string);
    if (result?.success) {
      return res.status(200).json({
        success: result?.success,
        shippingData: result?.shippingData,
      });
    } else {
      return res.status(400).json({
        success: result?.success,
        message: "目前尚無儲存收件地址",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "系統發生錯誤" + error,
    });
  }
}) as RequestHandler);

// 更新收件地址
router.patch("/shipping-address", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { address } = req.body;
    const result = await updateShippingAddress(address);
    if (result?.success) {
      return res.status(200).json({
        success: result?.success,
        message: "收件地址更新成功",
      });
    } else {
      return res.status(400).json({
        success: result?.success,
        message: result?.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "系統發生錯誤" + error,
    });
  }
}) as RequestHandler);

// 刪除收件地址
router.delete("/shipping-address", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { address_id } = req.body;
    const result = await deleteShippingAddress(address_id as string);
    if (result?.success) {
      return res.status(200).json({
        success: result?.success,
        message: "收件地址刪除成功",
      });
    } else {
      return res.status(400).json({
        success: result?.success,
        message: "收件地址刪除失敗",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "系統發生錯誤" + error,
    });
  }
}) as RequestHandler);

// 新增收藏清單
router.post("/wishlist", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { member_id, oracle_id } = req.body;
    const result = await addToWishlist(member_id, oracle_id);
    if (result?.success) {
      return res.status(200).json({
        success: result?.success,
        message: "收藏清單新增成功",
        data: result?.data,
      });
    } else {
      return res.status(400).json({
        success: result?.success,
        message: "收藏清單新增失敗",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "系統發生錯誤" + error });
  }
}) as RequestHandler);

// 取得收藏清單
router.get("/wishlist", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { member_id } = req.query;
    const result = await getWishlist(member_id as string);
    if (result?.success && result?.data?.length > 0) {
      return res.status(200).json({
        success: result?.success,
        message: "收藏清單取得成功",
        data: result?.data,
      });
    } else {
      return res.status(200).json({
        success: result?.success,
        message: "目前尚無收藏清單",
        data: [],
      });
    }
  } catch (error) {
    res.status(500).json({ message: "系統發生錯誤" + error });
  }
}) as RequestHandler);

router.delete("/wishlist", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { member_id, wishlist_id } = req.query;
    const result = await removeFromWishlist(
      wishlist_id as string,
      member_id as string,
    );
    if (result?.success) {
      return res.status(200).json({
        success: result?.success,
        message: "收藏清單刪除成功",
        data: result?.data,
      });
    } else {
      return res.status(400).json({
        success: result?.success,
        message: "收藏清單刪除失敗",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "系統發生錯誤" + error });
  }
}) as RequestHandler);

// 新增購物車
router.post("/cart", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { member_id, items } = req.body; // items 是包含多個 oracle_id 的陣列
    let data: any[] = [];
    // 處理所有項目
    const results = await Promise.all(
      items.map((item: any) =>
        addToCart(
          member_id,
          item.oracle_id,
          item.original_quantity,
          item.new_quantity,
        ),
      ),
    );
    // 購買數量是否超出庫存
    const overValueMessages: string[] = [];
    let allSuccessful = true;
    results.forEach((result) => {
      if (result?.overValueMessage) {
        // 庫存不夠，記錄錯誤訊息
        allSuccessful = false;
        overValueMessages.push(result?.overValueMessage ?? "未知錯誤");
      }
      if (Array.isArray(result?.data)) {
        data = [...result.data];
      }
    });
    const aggregatedMessage =
      overValueMessages.length > 0
        ? overValueMessages.join("\n")
        : "部分或全部項目新增失敗";

    if (allSuccessful) {
      return res.status(200).json({
        success: true,
        message: "購物車更新成功",
        data,
      });
    } else {
      return res.status(200).json({
        success: true,
        overValueMessage: aggregatedMessage,
        data,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "系統發生錯誤" + error });
  }
}) as RequestHandler);

// 訪客新增購物車
router.post("/guest-cart", (async (req: Request, res: Response) => {
  try {
    const { items } = req.body; // items 是包含多個 oracle_id 的陣列
    let data: any[] = [];
    // 處理所有項目
    const results = await Promise.all(
      items.map((item: any) =>
        guestAddToCart(
          item.oracle_id,
          item.original_quantity,
          item.new_quantity,
        ),
      ),
    );
    const overValueMessages: string[] = [];
    let allSuccessful = true;
    results.forEach((result) => {
      if (result?.overValueMessage) {
        // 庫存不夠，記錄錯誤訊息
        allSuccessful = false;
        overValueMessages.push(result?.overValueMessage ?? "未知錯誤");
      }
      if (Array.isArray(result?.data)) {
        data = [...data, ...result.data];
      }
    });
    const aggregatedMessage =
      overValueMessages.length > 0
        ? overValueMessages.join("\n")
        : "部分或全部項目新增失敗";

    if (allSuccessful) {
      return res.status(200).json({
        success: true,
        message: "購物車更新成功",
        data: data,
      });
    } else {
      return res.status(200).json({
        success: true,
        overValueMessage: aggregatedMessage,
        data,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "系統發生錯誤" + error });
  }
}) as RequestHandler);

router.get("/cart", authenticateToken, (async (req: Request, res: Response) => {
  try {
    const { member_id } = req.query;
    const result = await getCart(member_id as string);
    if (result?.success && result?.data && result?.data.length > 0) {
      return res.status(200).json({
        success: result.success,
        message: result.message || "購物車取得成功",
        overValueMessage: result.overValueMessage || "",
        data: result.data || [],
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "目前尚無購物車",
        overValueMessage: "",
        data: [],
      });
    }
  } catch (error) {
    res.status(500).json({ message: "系統發生錯誤" + error });
  }
}) as RequestHandler);

router.get("/cart-check", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { member_id, oracle_id } = req.query;
    const result = await checkCart(member_id as string, oracle_id as string);
    if (result) {
      return res.status(200).json({
        success: true,
        message: "購物車存在",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "購物車不存在",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "系統發生錯誤" + error });
  }
}) as RequestHandler);

router.patch("/cart", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { member_id, items } = req.body; // items 是包含多個 oracle_id 的陣列
    const result = await updateCart(member_id, items);
    if (result?.success) {
      return res.status(200).json({
        success: result?.success,
        message: result?.message,
      });
    } else {
      return res.status(400).json({
        success: result?.success,
        message: result?.message,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "系統發生錯誤" + error });
  }
}) as RequestHandler);

router.delete("/cart", authenticateToken, (async (
  req: Request,
  res: Response,
) => {
  try {
    const { member_id, oracle_id } = req.query;
    const result = await deleteCart(member_id as string, oracle_id as string);
    if (result?.success) {
      return res.status(200).json({
        success: result?.success,
        message: result?.message,
      });
    } else {
      return res.status(400).json({
        success: result?.success,
        message: result?.message,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "系統發生錯誤" + error });
  }
}) as RequestHandler);

export default router;
