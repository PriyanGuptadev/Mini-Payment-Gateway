import { Router } from "express";
import {
    createMerchantAccount,
    getMerchant,
    rotateCredentials,
    updateWebhook,
    getStats,
} from "./merchant.controller";
import { verifyAccessToken } from "../../middlewares/auth.middleware";
import { validateRequest } from "./merchant.validation";
import { createMerchantSchema, updateWebhookSchema } from "./merchant.validation";

const router = Router();

router.use(verifyAccessToken);

router.post(
    "/",
    validateRequest(createMerchantSchema),
    createMerchantAccount
);

router.get("/", getMerchant);

router.post("/rotate-credentials", rotateCredentials);

router.put(
    "/webhook",
    validateRequest(updateWebhookSchema),
    updateWebhook
);

router.get("/stats", getStats);

export default router;
