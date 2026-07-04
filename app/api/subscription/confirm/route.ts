import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/auth/auth";
import { getStripe, syncSubscriptionRecord } from "@/lib/actions/subscription";

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const sessionId = url.searchParams.get("session_id");
        if (!sessionId) {
            return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
        }

        const stripe = await getStripe();
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["subscription"],
        });

        if (!checkoutSession.subscription || typeof checkoutSession.subscription === "string") {
            return NextResponse.json({ error: "Subscription not found on checkout session." }, { status: 400 });
        }

        const subscription = checkoutSession.subscription as Stripe.Subscription;
        await syncSubscriptionRecord(session.user.id, subscription);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("/api/subscription/confirm error", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
