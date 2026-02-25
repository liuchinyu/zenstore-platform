import { Router } from "express";
import productRoutes from "./product";
// import productSearchRoutes from "./product.search.route";
import authRoutes from "./auth";
import accountRoutes from "./account";
import orderRoutes from "./orders";
import contentRoutes from "./content";

const router = Router();

// 註冊產品相關路由
router.use("/product", productRoutes);

// 註冊產品搜索路由
// router.use("/productsSearch", productSearchRoutes);

// 註冊會員路由
router.use("/auth", authRoutes);
router.use("/account", accountRoutes);

// 訂單路由
router.use("/orders", orderRoutes);

// content路由
router.use("/content", contentRoutes);

export default router;
