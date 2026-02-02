import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import {
    createCheckoutSession,
    processPayment,
    getTransactionHistory,
    getTransactionDetails,
    getTransactionSummary,
} from "./transaction.service";
import { getMerchantByUserId } from "../merchant/merchant.service";

export const createCheckout = async (req: AuthRequest, res: Response) => {
    try {
        const { amount, currency, customer_email, metadata } = req.body;
        const userId = req.user!.userId;

        const merchant = await getMerchantByUserId(userId);
        if (!merchant) {
            return res.status(404).json({ error: "Merchant not found" });
        }

        if (merchant.status !== "active") {
            return res.status(403).json({ error: "Merchant account is not active" });
        }

        const transaction = await createCheckoutSession(
            merchant.id,
            amount,
            currency || "USD",
            customer_email,
            metadata
        );

        return res.status(201).json({
            transaction_id: transaction._id,
            reference_id: transaction.reference_id,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            customer_email: transaction.customer_email,
        });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};

export const pay = async (req: AuthRequest, res: Response) => {
    try {
        const { transaction_id } = req.body;
        const userId = req.user!.userId;

        const merchant = await getMerchantByUserId(userId);
        if (!merchant) {
            return res.status(404).json({ error: "Merchant not found" });
        }

        const transaction = await getTransactionDetails(transaction_id, merchant.id);
        if (transaction.status !== "pending") {
            return res.status(400).json({
                error: "Transaction cannot be processed in current status",
            });
        }

        const processed = await processPayment(transaction_id);

        return res.json({
            transaction_id: processed._id,
            status: processed.status,
            amount: processed.amount,
            currency: processed.currency,
        });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { status, startDate, endDate, minAmount, maxAmount, limit, skip } = req.query;

        const merchant = await getMerchantByUserId(userId);
        if (!merchant) {
            return res.status(404).json({ error: "Merchant not found" });
        }

        const filters: any = {
            status: status as string | undefined,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
            skip: skip ? parseInt(skip as string) : undefined,
        };

        if (minAmount && minAmount !== '') {
            const parsed = parseFloat(minAmount as string);
            if (!isNaN(parsed)) {
                filters.minAmount = parsed;
            }
        }

        if (maxAmount && maxAmount !== '') {
            const parsed = parseFloat(maxAmount as string);
            if (!isNaN(parsed)) {
                filters.maxAmount = parsed;
            }
        }

        const result = await getTransactionHistory(merchant.id, filters);

        return res.json(result);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};

export const getDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { transaction_id } = req.params;
        const userId = req.user!.userId;

        const merchant = await getMerchantByUserId(userId);
        if (!merchant) {
            return res.status(404).json({ error: "Merchant not found" });
        }

        const id = Array.isArray(transaction_id) ? transaction_id[0] : transaction_id;
        const transaction = await getTransactionDetails(id, merchant.id);

        return res.json(transaction);
    } catch (err: any) {
        if (err.message === "Transaction not found") {
            return res.status(404).json({ error: err.message });
        }
        return res.status(500).json({ error: err.message });
    }
};

export const getSummary = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;

        const merchant = await getMerchantByUserId(userId);
        if (!merchant) {
            return res.status(404).json({ error: "Merchant not found" });
        }

        const summary = await getTransactionSummary(merchant.id);

        return res.json(summary);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};
