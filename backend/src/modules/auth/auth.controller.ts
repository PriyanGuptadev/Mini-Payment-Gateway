import { Request, Response } from "express";
import { registerUser, validateUser, getUserById, verifyEmail } from "./auth.service";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, business_name } = req.body;

        const result = await registerUser(email, password, business_name);
        const { verificationToken, verificationUrl, ...user } = result as any;

        return res.status(201).json({
            message: "Registration successful. Please verify your email using the verification link sent to your email address.",
            user: { ...user, email_verified: false },
            verification: {
                token: verificationToken,
                url: verificationUrl,
                expires_in: "24 hours",
            },
        });
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await validateUser(email, password);

        const accessToken = signAccessToken({
            userId: user.id,
            role: user.role,
        });

        const refreshToken = signRefreshToken({
            userId: user.id,
            role: user.role,
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });

        return res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err: any) {
        return res.status(401).json({ error: err.message });
    }
};

export const refreshToken = async (req: AuthRequest, res: Response) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({ error: "Refresh token required" });
        }

        const decoded = verifyRefreshToken(token);
        const user = await getUserById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        const newAccessToken = signAccessToken({
            userId: user.id,
            role: user.role,
        });

        return res.json({ accessToken: newAccessToken });
    } catch (err: any) {
        return res.status(401).json({ error: "Invalid refresh token" });
    }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await getUserById(req.user!.userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json(user);
    } catch (err: any) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const verifyEmailToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: "Verification token is required" });
        }

        const user = await verifyEmail(token);

        if (!user) {
            return res.status(500).json({ error: "Email verification failed" });
        }

        if (!user.email_verified) {
            return res.status(500).json({ error: "Email verification update failed" });
        }

        return res.json({
            message: "Email verified successfully",
            user: {
                id: user._id || user.id,
                email: user.email,
                email_verified: user.email_verified,
            },
        });
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
};