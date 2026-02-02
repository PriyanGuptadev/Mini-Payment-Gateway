import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import Transaction from "../../models/Transaction.model";
import { generateSignature } from "../../utils/crypto";
import Merchant from "../../models/Merchant.model";

export const createCheckoutSession = async (
    merchantId: string,
    amount: number,
    currency: string,
    customer_email: string,
    metadata?: any
) => {
    const reference_id = uuidv4();

    const signatureMessage = `${merchantId}|${reference_id}|${amount}|${currency}|${customer_email}`;
    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
        throw new Error("Merchant not found");
    }

    const signature = generateSignature(signatureMessage, merchant.api_secret);

    const transaction = await Transaction.create({
        merchant_id: merchantId,
        amount,
        currency,
        customer_email,
        metadata: metadata || {},
        signature,
        reference_id,
        status: "pending",
    });

    return transaction;
};

export const processPayment = async (transactionId: string) => {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
        throw new Error("Transaction not found");
    }

    const random = Math.random();
    const status = random > 0.1 ? "completed" : "failed";

    const updated = await Transaction.findByIdAndUpdate(
        transactionId,
        { status },
        { new: true }
    );

    return updated;
};

export const getTransactionHistory = async (
    merchantId: string,
    filters?: {
        status?: string;
        startDate?: Date;
        endDate?: Date;
        minAmount?: number;
        maxAmount?: number;
        limit?: number;
        skip?: number;
    }
) => {
    const query: any = { merchant_id: merchantId };

    if (filters?.status) {
        query.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = filters.startDate;
        if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    if (filters?.minAmount !== undefined || filters?.maxAmount !== undefined) {
        query.amount = {};
        if (filters.minAmount !== undefined) query.amount.$gte = filters.minAmount;
        if (filters.maxAmount !== undefined) query.amount.$lte = filters.maxAmount;
    }

    const limit = filters?.limit || 20;
    const skip = filters?.skip || 0;

    const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

    const total = await Transaction.countDocuments(query);

    return { transactions, total, limit, skip };
};

export const getTransactionDetails = async (
    transactionId: string,
    merchantId: string
) => {
    const transaction = await Transaction.findOne({
        _id: transactionId,
        merchant_id: merchantId,
    });

    if (!transaction) {
        throw new Error("Transaction not found");
    }

    return transaction;
};

export const getTransactionSummary = async (merchantId: string) => {
    const summary = await Transaction.aggregate([
        {
            $match: {
                merchant_id: new mongoose.Types.ObjectId(merchantId),
            },
        },
        {
            $group: {
                _id: null,
                total_transactions: { $sum: 1 },
                completed_transactions: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
                    },
                },
                failed_transactions: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "failed"] }, 1, 0],
                    },
                },
                total_amount: { $sum: "$amount" },
                completed_amount: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                total_transactions: 1,
                completed_transactions: 1,
                failed_transactions: 1,
                total_amount: 1,
                completed_amount: 1,
                success_rate: {
                    $cond: [
                        { $eq: ["$total_transactions", 0] },
                        0,
                        {
                            $multiply: [
                                { $divide: ["$completed_transactions", "$total_transactions"] },
                                100,
                            ],
                        },
                    ],
                },
            },
        },
    ]);

    return summary.length > 0
        ? summary[0]
        : {
            total_transactions: 0,
            completed_transactions: 0,
            failed_transactions: 0,
            total_amount: 0,
            completed_amount: 0,
            success_rate: 0,
        };
};
