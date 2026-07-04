import { NextResponse } from "next/server";
import { getCurrentUserPlan } from "@/lib/actions/subscription";

export async function GET() {
    try {
        const plan = await getCurrentUserPlan();
        return NextResponse.json({ plan: plan.plan });
    } catch (err) {
        console.error("/api/subscription error", err);
        return NextResponse.json({ plan: "free" }, { status: 200 });
    }
}
