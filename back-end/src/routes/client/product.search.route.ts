// routes/product/product.search.route.ts
import { Router } from "express";
import { searchProductsController } from "../../controllers/client/product/product.search.controller";

const router = Router();

router.get("/", searchProductsController);

export default router;
