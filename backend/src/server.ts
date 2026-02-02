import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

app.listen(env.port, () => {
});

connectDB();