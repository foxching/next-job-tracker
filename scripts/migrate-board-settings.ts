/**
 * Migration: backfill `settings` field on existing Board documents.
 *
 * 
 */
import connectDB from "../lib/db";
import Board from "@/lib/models/board";

async function migrate() {
    await connectDB();

    const result = await Board.updateMany(
        // only target boards that don't have settings yet
        { settings: { $exists: false } },
        {
            $set: {
                "settings.cardDisplay.showSalary": true,
                "settings.cardDisplay.showAppliedDate": false,
                "settings.cardDisplay.showTags": true,
                "settings.sorting.field": "createdAt",
                "settings.sorting.direction": "desc",
            },
        }
    );

    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    process.exit(0);
}

migrate().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});