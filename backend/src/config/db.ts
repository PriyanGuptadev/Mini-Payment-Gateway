import mongoose from "mongoose";
import { env } from "./env";

let dbConnected = false;

export const connectDB = async () => {
    try {
        await mongoose.connect(env.mongoUri, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 2000,
            socketTimeoutMS: 2000,
        });
        dbConnected = true;
    } catch (error: any) {
        dbConnected = false;
    }
};

export const isDbConnected = () => dbConnected;
