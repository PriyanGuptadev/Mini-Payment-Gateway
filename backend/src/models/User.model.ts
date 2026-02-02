import { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        email: {
            type: String,
            unique: true,
            index: true,
            lowercase: true,
            required: true,
        },
        password_hash: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["USER", "MERCHANT", "ADMIN"],
            default: "MERCHANT",
            index: true,
        },
        business_name: {
            type: String,
            optional: true,
        },
        email_verified: {
            type: Boolean,
            default: false,
        },
        email_verification_token: {
            type: String,
            optional: true,
        },
        email_verification_expires: {
            type: Date,
            optional: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive", "suspended"],
            default: "active",
        },
    },
    { timestamps: true }
);

userSchema.index({ email: 1, status: 1 });

export default model("User", userSchema);