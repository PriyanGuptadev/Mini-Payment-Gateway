import { randomBytes } from "crypto";
import mongoose from "mongoose";
import Merchant from "../../models/Merchant.model";
import Transaction from "../../models/Transaction.model";
import { encryptData, decryptData } from "../../utils/crypto";
import { isDbConnected } from "../../config/db";

const API_KEY_LENGTH = 32;
const API_SECRET_LENGTH = 64;

export const generateApiCredentials = () => {
    const apiKey = randomBytes(API_KEY_LENGTH).toString("hex");
    const apiSecret = randomBytes(API_SECRET_LENGTH).toString("hex");
    return { apiKey, apiSecret };
};

export const createMerchant = async (
    userId: string,
    business_name: string,
    webhook_url?: string
) => {
    const { apiKey, apiSecret } = generateApiCredentials();

    const merchant = await Merchant.create({
        user_id: userId,
        business_name,
        api_key: apiKey,
        api_secret: apiSecret,
        webhook_url: webhook_url || null,
        status: "active",
    });

    return merchant;
};

export const getMerchantById = async (merchantId: string) => {
    return await Merchant.findById(merchantId).select("-api_secret");
};

export const getMerchantByUserId = async (userId: string) => {
    return await Merchant.findOne({ user_id: userId }).select("-api_secret");
};

export const getMerchantForVerification = async (merchantId: string) => {
    return await Merchant.findById(merchantId);
};

export const rotateApiCredentials = async (merchantId: string) => {
    const { apiKey, apiSecret } = generateApiCredentials();

    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
        throw new Error("Merchant not found");
    }

    const currentRotationCount = (merchant.rotation_count !== undefined && merchant.rotation_count !== null) 
        ? Number(merchant.rotation_count) 
        : 0;

    const updateData: any = {
        api_key: apiKey,
        api_secret: apiSecret,
        last_rotated_at: new Date(),
        rotation_count: currentRotationCount + 1,
    };

    const updated = await Merchant.findByIdAndUpdate(
        merchantId,
        updateData,
        { new: true, runValidators: true }
    );

    if (!updated) {
        throw new Error("Failed to rotate credentials");
    }

    return updated;
};

export const updateMerchantWebhook = async (
    merchantId: string,
    webhook_url: string
) => {
    return await Merchant.findByIdAndUpdate(
        merchantId,
        { webhook_url },
        { new: true }
    );
};

export const getMerchantStats = async (merchantId: string) => {
    if (!isDbConnected()) {
        return {
            total_transactions: 0,
            completed_transactions: 0,
            failed_transactions: 0,
            total_amount: 0,
            completed_amount: 0,
            success_rate: 0,
        };
    }

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
