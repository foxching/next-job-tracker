"use server";

import { getSession } from "../auth/auth";
import { getCurrentUserPlan } from "./subscription";

export async function suggestTagsForJob({ company, position, description }: { company?: string; position?: string; description?: string; }) {
    const session = await getSession();
    if (!session?.user) return { error: "Unauthorized" };

    const plan = await getCurrentUserPlan();
    if (plan.plan === "free") {
        return { error: "AI suggestions are a premium feature" };
    }

    // Simple heuristic-based suggestions (placeholder for real AI)
    const text = `${company ?? ""} ${position ?? ""} ${description ?? ""}`.toLowerCase();
    const candidates: Record<string, RegExp> = {
        javascript: /javascript|react|vue|angular|typescript/,
        remote: /remote|work from home|wfh/,
        senior: /senior|lead|principal/,
        junior: /junior|entry|graduate/,
        frontend: /frontend|ui|ux|react|vue/,
        backend: /backend|node|express|rails|django/,
        design: /design|product designer|ux|ui/,
    };

    const tags: string[] = [];
    for (const [tag, rx] of Object.entries(candidates)) {
        if (rx.test(text)) tags.push(tag.charAt(0).toUpperCase() + tag.slice(1));
    }

    // fallback common tag
    if (tags.length === 0) tags.push("General");

    return { success: true, tags };
}
