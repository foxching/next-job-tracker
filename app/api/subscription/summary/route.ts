import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { getUserBillingSummary } from "@/lib/actions/subscription";

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const summary = await getUserBillingSummary(session.user.id);
        return NextResponse.json(summary);
    } catch (err) {
        console.error("/api/subscription/summary error", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
