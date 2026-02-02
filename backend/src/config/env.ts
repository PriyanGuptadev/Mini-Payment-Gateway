import dotenv from "dotenv";
dotenv.config();

export const env = {
    port: parseInt(process.env.PORT || "5000"),
    mongoUri: process.env.MONGO_URI!,
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    encryptionKey: process.env.ENCRYPTION_KEY!,
    nodeEnv: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
};