import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthRequest extends Request {
    user?: { userId: string; role: string };
}

export const verifyAccessToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Missing authorization token" });
    }

    try {
        const decoded = jwt.verify(token, env.accessSecret) as any;
        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    } catch (err: any) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired" });
        }
        return res.status(401).json({ error: "Invalid token" });
    }
};

export const requireRole = (role: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (req.user?.role !== role) {
            return res
                .status(403)
                .json({ error: "Insufficient permissions" });
        }
        next();
    };
};
