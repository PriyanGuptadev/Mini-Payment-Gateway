import { Schema, model } from "mongoose";

const transactionSchema = new Schema(
    {
        merchant_id: {
            type: Schema.Types.ObjectId,
            ref: "Merchant",
            required: true,
            index: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: "USD",
            index: true,
        },
        status: {
            type: String,
            enum: ["pending", "processing", "completed", "failed", "refunded"],
            default: "pending",
            index: true,
        },
        customer_email: {
            type: String,
            required: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
            optional: true,
        },
        signature: {
            type: String,
            required: true,
        },
        reference_id: {
            type: String,
            unique: true,
            index: true,
        },
    },
    { timestamps: true }
);

transactionSchema.index({ merchant_id: 1, status: 1 });
transactionSchema.index({ merchant_id: 1, createdAt: -1 });

transactionSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 2592000, partialFilterExpression: { status: "pending" } }
);

export default model("Transaction", transactionSchema);
