import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { verifySignature } from "../utils/crypto";
import Merchant from "../models/Merchant.model";

export const verifyHmacSignature = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const signature = req.headers["x-signature"] as string;
    const merchantId = req.headers["x-merchant-id"] as string;
    const timestamp = req.headers["x-timestamp"] as string;

    if (!signature || !merchantId || !timestamp) {
        return res.status(400).json({
            error: "Missing required headers: x-signature, x-merchant-id, x-timestamp",
        });
    }

    const requestTime = parseInt(timestamp);
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - requestTime) > 300) {
        return res.status(401).json({ error: "Request timestamp expired" });
    }

    try {
        const merchant = await Merchant.findById(merchantId);
        if (!merchant || merchant.status !== "active") {
            return res.status(401).json({ error: "Invalid merchant" });
        }

        const body = JSON.stringify(req.body);
        const message = `${req.method}|${req.path}|${body}|${timestamp}`;

        if (!verifySignature(message, signature, merchant.api_secret)) {
            return res.status(401).json({ error: "Invalid signature" });
        }

        req.user = { userId: (merchant.user_id as any).toString(), role: "MERCHANT" };
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid signature verification" });
    }
};
