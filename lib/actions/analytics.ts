"use server";

import connectDB from "../db";
import { getSession } from "../auth/auth";
import { getCurrentUserPlan } from "./subscription";
import { Board, Column, JobApplication } from "../models";

export async function getBoardAnalytics(boardId: string) {
    const session = await getSession();
    if (!session?.user) return { error: "Unauthorized" };

    // enforce premium
    const plan = await getCurrentUserPlan();
    if (plan.plan === "free") {
        return { error: "Analytics are a premium feature" };
    }

    await connectDB();

    const columns = await Column.find({ boardId }).lean();
    const columnIds = columns.map((c) => c._id);
    const jobs = await JobApplication.find({ columnId: { $in: columnIds } }).lean();

    const totalJobs = jobs.length;

    const jobsPerColumn: Record<string, number> = {};
    for (const col of columns) jobsPerColumn[col.name] = 0;
    for (const job of jobs) {
        const col = columns.find((c) => c._id.toString() === job.columnId.toString());
        if (col) jobsPerColumn[col.name] = (jobsPerColumn[col.name] || 0) + 1;
    }

    const tagCounts: Record<string, number> = {};
    for (const job of jobs) {
        for (const t of job.tags ?? []) {
            tagCounts[t] = (tagCounts[t] || 0) + 1;
        }
    }

    return {
        success: true,
        data: {
            totalJobs,
            jobsPerColumn,
            topTags: Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([tag, count]) => ({ tag, count })),
        },
    };
}
