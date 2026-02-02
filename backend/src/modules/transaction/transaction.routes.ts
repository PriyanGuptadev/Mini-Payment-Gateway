import { Router } from "express";
import {
    createCheckout,
    pay,
    getHistory,
    getDetails,
    getSummary,
} from "./transaction.controller";
import { verifyAccessToken } from "../../middlewares/auth.middleware";
import { validateRequest, createTransactionSchema } from "../../modules/auth/auth.validation";

const router = Router();

router.use(verifyAccessToken);

router.post(
    "/checkout",
    validateRequest(createTransactionSchema),
    createCheckout
);

router.post("/pay", pay);

router.get("/history", getHistory);

router.get("/:transaction_id", getDetails);

router.get("/summary", getSummary);

export default router;
