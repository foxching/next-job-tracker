import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { createStripeCheckoutSession } from "@/lib/actions/subscription";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const session = await getSession();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        try {
            const origin = request.headers.get("origin") ?? "http://localhost:3000";
            const result = await createStripeCheckoutSession(session.user.id, session.user.email ?? null, origin);
            return NextResponse.json({ url: result.url });
        } catch (stripeError) {
            console.error("Stripe checkout session error", stripeError);
            return NextResponse.json({ error: (stripeError as Error).message || "Stripe checkout failed" }, { status: 500 });
        }
    } catch (err) {
        console.error("/api/stripe/checkout error", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
