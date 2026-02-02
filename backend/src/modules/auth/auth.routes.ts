import { Router } from "express";
import { register, login, refreshToken, getProfile, verifyEmailToken } from "./auth.controller";
import { validateRequest, registerSchema, loginSchema } from "./auth.validation";
import { verifyAccessToken } from "../../middlewares/auth.middleware";
import { authLimiter } from "../../middlewares/rateLimit.middleware";

const router = Router();

router.post(
    "/register",
    authLimiter,
    validateRequest(registerSchema),
    register
);

router.post("/login", authLimiter, validateRequest(loginSchema), login);

router.post("/refresh", refreshToken);

router.get("/profile", verifyAccessToken, getProfile);

router.post("/verify-email", authLimiter, verifyEmailToken);

export default router;