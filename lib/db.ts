import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };
if (!global.mongoose) global.mongoose = cached;

async function connectDB() {
    if (!MONGODB_URI) {
        throw new Error("Please define MONGODB_URI in .env");
    }

    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            dbName: "your_db_name", // 👈 add this
        }).then((m) => m);
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

// 👇 Export the native Db for Better Auth
export async function getDb() {
    await connectDB();
    return mongoose.connection.db!;
}

export default connectDB;