import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface TokenPayload {
    userId: string;
    role: string;
}

export const signAccessToken = (payload: TokenPayload): string =>
    jwt.sign(payload, env.accessSecret, { expiresIn: "15m" });

export const signRefreshToken = (payload: TokenPayload): string =>
    jwt.sign(payload, env.refreshSecret, { expiresIn: "7d" });

export const verifyAccessToken = (token: string): TokenPayload => {
    return jwt.verify(token, env.accessSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    return jwt.verify(token, env.refreshSecret) as TokenPayload;
};