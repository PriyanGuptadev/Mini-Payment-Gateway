import https from "https";
import http from "http";
import { URL } from "url";
import { generateSignature } from "./crypto";


export enum WebhookEvent {
    TRANSACTION_COMPLETED = "transaction.completed",
    TRANSACTION_FAILED = "transaction.failed",
    TRANSACTION_PROCESSING = "transaction.processing",
}


export const sendWebhook = async (
    webhookUrl: string,
    event: WebhookEvent,
    transaction: any,
    apiSecret: string
): Promise<boolean> => {
    return new Promise((resolve) => {
        try {
            const payload = {
                event,
                transaction_id: transaction._id || transaction.id,
                reference_id: transaction.reference_id,
                status: transaction.status,
                amount: transaction.amount,
                currency: transaction.currency,
                customer_email: transaction.customer_email,
                metadata: transaction.metadata || {},
                timestamp: new Date().toISOString(),
            };

            
            const message = JSON.stringify(payload);
            const signature = generateSignature(message, apiSecret);

            const url = new URL(webhookUrl);
            const isHttps = url.protocol === "https:";
            const client = isHttps ? https : http;

            const postData = JSON.stringify(payload);

            const options = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname + url.search,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(postData),
                    "X-Webhook-Signature": signature,
                    "X-Webhook-Event": event,
                },
                timeout: 10000, 
            };

            const req = client.request(options, (res) => {
                let data = "";

                res.on("data", (chunk) => {
                    data += chunk;
                });

                res.on("end", () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            });

            req.on("error", (error) => {
                resolve(false);
            });

            req.on("timeout", () => {
                req.destroy();
                resolve(false);
            });

            req.write(postData);
            req.end();
        } catch (error: any) {
            resolve(false);
        }
    });
};


export const sendWebhookAsync = (
    webhookUrl: string,
    event: WebhookEvent,
    transaction: any,
    apiSecret: string
): void => {
    
    sendWebhook(webhookUrl, event, transaction, apiSecret).catch((err) => {
    });
};
