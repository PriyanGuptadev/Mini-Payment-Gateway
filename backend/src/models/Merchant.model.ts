import { Schema, model } from "mongoose";
import { encryptData, decryptData } from "../utils/crypto";

const merchantSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        business_name: {
            type: String,
            required: true,
        },
        api_key: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        api_secret: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive", "suspended"],
            default: "active",
            index: true,
        },
        webhook_url: {
            type: String,
            optional: true,
        },
        rotation_count: {
            type: Number,
            default: 0,
        },
        last_rotated_at: {
            type: Date,
            optional: true,
        },
        ip_whitelist: [String], // For additional security
    },
    { timestamps: true }
);

merchantSchema.index({ user_id: 1, status: 1 });

merchantSchema.pre("save", async function (this: any) {
    if (this.isModified("api_secret") && typeof this.api_secret === "string") {
        if (!this.api_secret.includes(":")) {
            this.api_secret = encryptData(this.api_secret);
        }
    }
});

export default model("Merchant", merchantSchema);
