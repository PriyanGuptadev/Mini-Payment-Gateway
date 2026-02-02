import { db } from "../../utils/db-facade";
import { hashPassword, comparePassword } from "../../utils/password";
import { generateVerificationToken, sendVerificationEmail } from "../../utils/email";

export const registerUser = async (email: string, password: string, business_name?: string) => {
    const exists = await db.findUserByEmail(email);
    if (exists) throw new Error("User already exists");

    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    const user = await db.createUser({
        email,
        password_hash: await hashPassword(password),
        role: "MERCHANT",
        business_name: business_name || "",
        email_verified: false,
        email_verification_token: verificationToken,
        email_verification_expires: verificationExpires,
    });

    sendVerificationEmail(email, verificationToken).catch((err) => {
    });

    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3001"}/verify-email?token=${verificationToken}`;

    return {
        ...user,
        verificationToken,
        verificationUrl,
    };
};

export const validateUser = async (email: string, password: string) => {
    const user = await db.findUserByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const match = await comparePassword(password, user.password_hash);
    if (!match) throw new Error("Invalid credentials");

    if (!user.email_verified) {
        throw new Error("Please verify your email address before logging in. Use the verification link provided during registration.");
    }

    return user;
};

export const verifyEmail = async (token: string) => {
    const user = await db.findUserByEmailVerificationToken(token);
    if (!user) {
        throw new Error("Invalid or expired verification token");
    }

    if (user.email_verified) {
        throw new Error("Email already verified");
    }

    if (user.email_verification_expires && new Date() > new Date(user.email_verification_expires)) {
        throw new Error("Verification token has expired");
    }

    const userId = (user._id || user.id)?.toString();
    if (!userId) {
        throw new Error("User ID not found");
    }


    const updated = await db.updateUser(userId, {
        email_verified: true,
        email_verification_token: null,
        email_verification_expires: null,
    });

    if (!updated) {
        throw new Error("Failed to update user email verification status");
    }


    return updated;
};

export const getUserById = async (userId: string) => {
    return await db.findUserById(userId);
};