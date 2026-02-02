import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import {
    createMerchant,
    getMerchantByUserId,
    getMerchantById,
    rotateApiCredentials,
    updateMerchantWebhook,
    getMerchantStats,
} from "./merchant.service";

export const createMerchantAccount = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { business_name, webhook_url } = req.body;
        const userId = req.user!.userId;

        const existing = await getMerchantByUserId(userId);
        if (existing) {
            return res.status(400).json({
                error: "User already has a merchant account",
            });
        }

        const merchant = await createMerchant(userId, business_name, webhook_url);

        return res.status(201).json({
            message: "Merchant account created",
            merchant: {
                id: merchant._id || merchant.id,
                business_name: merchant.business_name,
                api_key: merchant.api_key,
                api_secret: merchant.api_secret,
                status: merchant.status,
            },
        });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};

export const getMerchant = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const merchant = await getMerchantByUserId(userId);

        if (!merchant) {
            return res.status(404).json({ error: "Merchant not found" });
        }

        return res.json(merchant);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};

export const rotateCredentials = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const merchant = await getMerchantByUserId(userId);

        if (!merchant) {
            return res.status(404).json({ error: "Merchant not found" });
        }

        const merchantId = (merchant._id || merchant.id)?.toString();
        if (!merchantId) {
            return res.status(404).json({ error: "Merchant ID not found" });
        }

        const updated = await rotateApiCredentials(merchantId);

        if (!updated) {
            return res.status(500).json({ error: "Failed to rotate credentials" });
        }

        return res.json({
            message: "Credentials rotated successfully",
            merchant: {
                id: updated._id || updated.id,
                api_key: updated.api_key,
                rotation_count: updated.rotation_count,
                last_rotated_at: updated.last_rotated_at,
            },
        });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};

export const updateWebhook = async (req: AuthRequest, res: Response) => {
    try {
        const { webhook_url } = req.body;
        const userId = req.user!.userId;

        if (!webhook_url) {
            return res.status(400).json({ error: "webhook_url is required" });
        }

        const merchant = await getMerchantByUserId(userId);
        if (!merchant) {
            return res.status(404).json({ error: "Merchant not found" });
        }

        const updated = await updateMerchantWebhook(merchant.id, webhook_url);

        return res.json({
            message: "Webhook updated",
            merchant: updated,
        });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};

export const getStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const merchant = await getMerchantByUserId(userId);

        if (!merchant) {
            return res.status(404).json({ error: "Merchant not found" });
        }

        const merchantId = (merchant._id || merchant.id)?.toString();
        const stats = await getMerchantStats(merchantId);

        return res.json({
            merchant_id: merchant.id,
            stats,
        });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};
