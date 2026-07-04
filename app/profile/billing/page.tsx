"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BillingPage() {
    const [plan, setPlan] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let mounted = true;
        fetch("/api/subscription")
            .then((r) => r.json())
            .then((data) => mounted && setPlan(data?.plan ?? "free"))
            .catch(() => mounted && setPlan("free"));
        return () => {
            mounted = false;
        };
    }, []);

    const handleDemoCheckout = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ test: true }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data?.error ?? "Checkout failed");
                return;
            }
            toast.success("Payment simulated — account upgraded to premium.");
            router.push("/profile?upgraded=1");
        } catch (err) {
            console.error(err);
            toast.error("Checkout failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Billing</h1>

            <div className="space-y-4 max-w-xl">
                <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-600">Current plan</p>
                    <p className="text-lg font-medium">{plan ?? "…"}</p>
                </div>

                <div className="rounded-lg border p-4">
                    <p className="font-semibold">Upgrade to Premium</p>
                    <p className="text-sm text-gray-600">Unlock analytics, export/duplicate, and AI suggestions.</p>

                    <div className="mt-4 space-y-2">
                        <label className="block text-sm">Card number (demo)</label>
                        <input className="w-full rounded border px-3 py-2" placeholder="4242 4242 4242 4242" />
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <input className="rounded border px-3 py-2" placeholder="MM/YY" />
                            <input className="rounded border px-3 py-2" placeholder="CVC" />
                        </div>

                        <p className="text-xs text-gray-500">This demo simulates a Stripe payment and will immediately upgrade your account to premium. To enable a real Stripe flow, set STRIPE_SECRET_KEY and install the Stripe SDK as documented in README.</p>

                        <button
                            onClick={handleDemoCheckout}
                            disabled={loading}
                            className="mt-3 inline-flex items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {loading ? "Processing…" : "Pay $5 (Demo)"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
