import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { env } from "./config/env";
import { apiLimiter } from "./middlewares/rateLimit.middleware";

const app = express();

app.use(helmet());

app.use(
    cors({
        origin: env.frontendUrl || "http://localhost:3001",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Signature", "X-Merchant-Id", "X-Timestamp"],
    })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

app.use(apiLimiter);

app.use("/api", routes);

app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(
    (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const message =
            env.nodeEnv === "production"
                ? "Internal server error"
                : err.message;

        res.status(err.status || 500).json({
            error: message,
        });
    }
);

export default app;