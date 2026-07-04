import { NextResponse } from "next/server";
import { setUserPlanForUser } from "@/lib/actions/subscription";
import { getSession } from "@/lib/auth/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const session = await getSession();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Demo mode: simulate payment and upgrade immediately
        if (body?.test) {
            await setUserPlanForUser(session.user.id, "premium");
            return NextResponse.json({ url: "/profile?upgraded=1" });
        }

        // Real Stripe integration not configured in demo
        return NextResponse.json({ error: "Stripe not configured. Set STRIPE_SECRET_KEY and install stripe SDK to enable real checkout." }, { status: 501 });
    } catch (err) {
        console.error("/api/stripe/checkout error", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
