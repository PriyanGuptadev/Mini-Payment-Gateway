import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { env } from "../config/env";

export const apiLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMaxRequests,
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => env.nodeEnv === "development",
});

export const authLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login/register attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, 
});
