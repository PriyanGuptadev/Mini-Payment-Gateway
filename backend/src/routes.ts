import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes";
import merchantRoutes from "./modules/merchant/merchant.routes";
import transactionRoutes from "./modules/transaction/transaction.routes";

const router = Router();

router.use("/auth", authRoutes);

router.use("/merchants", merchantRoutes);

router.use("/transactions", transactionRoutes);

export default router;