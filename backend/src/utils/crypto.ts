import crypto from "crypto";
import { env } from "../config/env";

export const encryptData = (data: string): string => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(
        "aes-256-gcm",
        Buffer.from(env.encryptionKey.slice(0, 32)),
        iv
    );

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
};

export const decryptData = (encryptedData: string): string => {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        Buffer.from(env.encryptionKey.slice(0, 32)),
        iv
    );

    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
};

export const generateSignature = (message: string, secret: string): string => {
    return crypto
        .createHmac("sha256", secret)
        .update(message)
        .digest("hex");
};

export const verifySignature = (
    message: string,
    signature: string,
    secret: string
): boolean => {
    const expectedSignature = generateSignature(message, secret);
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
};
