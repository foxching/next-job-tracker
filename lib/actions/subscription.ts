"use server";

import { getSession } from "../auth/auth";
import connectDB from "../db";
import Subscription from "../models/subscription";

export async function getCurrentUserPlan() {
    let session;
    try {
        session = await getSession();
    } catch (err) {
        // likely called in a context where headers() isn't available (prerender)
        console.warn("getCurrentUserPlan: getSession failed, defaulting to free", err);
        return { plan: "free" as const };
    }

    if (!session?.user) return { plan: "free" as const };

    await connectDB();

    const sub = await Subscription.findOne({ userId: session.user.id }).lean();
    if (!sub) return { plan: "premium" as const };
    return { plan: sub.plan as "free" | "premium" };
}

export async function setUserPlanForUser(userId: string, plan: "free" | "premium") {
    await connectDB();
    const upsert = await Subscription.findOneAndUpdate({ userId }, { plan }, { upsert: true, new: true }).lean();
    return upsert;
}
