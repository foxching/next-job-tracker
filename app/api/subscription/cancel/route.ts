import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { cancelUserSubscriptionAtPeriodEnd } from "@/lib/actions/subscription";

export async function POST() {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const result = await cancelUserSubscriptionAtPeriodEnd(session.user.id);
        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("/api/subscription/cancel error", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
