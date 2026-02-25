import { Router } from "express";
import productRoutes from "./product";
import memberRoutes from "./member";
import orderRoutes from "./order";
import contentRoutes from "./content";

const router = Router();

router.use("/product", productRoutes);
router.use("/member", memberRoutes);
router.use("/order", orderRoutes);
router.use("/content", contentRoutes);

export default router;
