/**
 * Migration: backfill `appliedDate` from `createdAt` using an
 * aggregation-pipeline update — single round trip, no per-doc loop.
 * Requires MongoDB 4.2+.
 *
 * Run with:
 *   npm run migrate:applied-date
 */

import connectDB from "../lib/db";
import JobApplication from "@/lib/models/job-application";

async function migrate() {
    await connectDB();


    const result = await JobApplication.updateMany(
        { $or: [{ appliedDate: { $exists: false } }, { appliedDate: null }] },
        [{ $set: { appliedDate: "$createdAt" } }], // pipeline syntax: array, not object
        { updatePipeline: true }
    );
    console.log(
        `Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`
    );
    process.exit(0);
}

migrate().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});