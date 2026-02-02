import crypto from "crypto";
import nodemailer from "nodemailer";
import { env } from "../config/env";


export const generateVerificationToken = (): string => {
    return crypto.randomBytes(32).toString("hex");
};


const createTransport = async () => {
    const smtpHost = (process.env.SMTP_HOST || "").trim();
    const smtpUser = (process.env.SMTP_USER || "").trim();
    const smtpPassword = (process.env.SMTP_PASSWORD || process.env.SMTP_PASS || "").trim();
    const smtpPort = parseInt((process.env.SMTP_PORT || "587").trim());
    
    if (smtpHost && smtpUser && smtpPassword) {
        const isGmail = smtpHost.toLowerCase().includes("gmail.com");
        
        
        const config: any = {
            host: isGmail ? "smtp.gmail.com" : smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPassword.replace(/\s+/g, ""),
            },
        };
        
        if (isGmail) {
            config.service = "gmail";
        } else {
            config.tls = {
                rejectUnauthorized: false,
            };
        }
        
        const transporter = nodemailer.createTransport(config);
        
        try {
            await transporter.verify();
            return transporter;
        } catch (error: any) {
            return transporter;
        }
    }

    try {
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    } catch (error) {
        return null;
    }
};


export const sendVerificationEmail = async (
    email: string,
    verificationToken: string
): Promise<void> => {
    const verificationUrl = `${env.frontendUrl || "http://localhost:3001"}/verify-email?token=${verificationToken}`;
    
    try {
        const transporter = await createTransport();
        
        if (!transporter) {
            return;
        }
        
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@payment-gateway.com",
            to: email,
            subject: "Verify Your Email Address - Payment Gateway",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background-color: #f9fafb; }
                        .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Payment Gateway</h1>
                        </div>
                        <div class="content">
                            <h2>Verify Your Email Address</h2>
                            <p>Thank you for registering with Payment Gateway. Please verify your email address by clicking the button below:</p>
                            <a href="${verificationUrl}" class="button">Verify Email Address</a>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
                            <p>This link will expire in 24 hours.</p>
                            <p>If you didn't create an account, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message, please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Verify Your Email Address - Payment Gateway
                
                Thank you for registering with Payment Gateway. Please verify your email address by visiting:
                
                ${verificationUrl}
                
                This link will expire in 24 hours.
                
                If you didn't create an account, please ignore this email.
            `,
        };

        const info: any = await transporter.sendMail(mailOptions);
        
        const previewUrl = nodemailer.getTestMessageUrl(info);
    } catch (error: any) {
    }
};


export const sendPasswordResetEmail = async (
    email: string,
    resetToken: string
): Promise<void> => {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3001"}/reset-password?token=${resetToken}`;
    
};
