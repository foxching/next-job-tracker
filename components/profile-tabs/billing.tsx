"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Invoice = {
    id: string;
    amountPaid: number;
    status: string;
    created: number;
    hostedInvoiceUrl?: string | null;
};

type BillingSummary = {
    plan: string;
    status: string;
    currentPeriodEnd?: string | null;
    cancelAtPeriodEnd?: boolean;
    subscription?: {
        id: string;
        status: string;
        priceId: string | null;
        productName: string | null;
        currentPeriodEnd?: number;
    } | null;
    invoices: Invoice[];
};

export default function BillingTab() {
    const [summary, setSummary] = useState<BillingSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/subscription/summary");
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Failed to load billing summary");
            }
            setSummary(data);
        } catch (err) {
            console.error(err);
            toast.error((err as Error).message || "Unable to load billing summary");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    const handleCheckout = async () => {
        setCheckoutLoading(true);
        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            const data = await res.json();
            if (!res.ok || !data?.url) {
                throw new Error(data?.error || "Checkout session creation failed");
            }
            window.location.assign(data.url);
        } catch (err) {
            console.error(err);
            toast.error((err as Error).message || "Checkout failed");
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handleCancel = async () => {
        setCancelLoading(true);
        try {
            const res = await fetch("/api/subscription/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Cancel request failed");
            }
            toast.success("Subscription will cancel at the end of the current billing period.");
            fetchSummary();
        } catch (err) {
            console.error(err);
            toast.error((err as Error).message || "Unable to cancel subscription");
        } finally {
            setCancelLoading(false);
        }
    };

    const formatDate = (timestamp?: number | string | null) => {
        if (!timestamp) return "—";
        return new Date(timestamp).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const plan = summary?.plan ?? "free";
    const status = summary?.status ?? "free";
    const currentPeriod = summary?.subscription?.currentPeriodEnd ?? summary?.currentPeriodEnd?.valueOf();

    return (
        <div className="space-y-6">
            <div className="rounded-lg border p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Current plan</p>
                        <p className="text-2xl font-semibold">{plan === "premium" ? "Premium" : "Free"}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm ${status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                        {status}
                    </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Renewal date</p>
                        <p className="mt-2 text-base font-medium">{formatDate(currentPeriod)}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Cancel at period end</p>
                        <p className="mt-2 text-base font-medium">{summary?.cancelAtPeriodEnd ? "Yes" : "No"}</p>
                    </div>
                </div>

                {plan === "premium" && status === "active" && !summary?.cancelAtPeriodEnd ? (
                    <button
                        onClick={handleCancel}
                        disabled={cancelLoading}
                        className="mt-6 inline-flex items-center rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        {cancelLoading ? "Canceling…" : "Cancel at period end"}
                    </button>
                ) : null}
            </div>

            <div className="rounded-lg border p-6">
                <h2 className="text-lg font-semibold">Billing history</h2>
                <div className="mt-4 space-y-3">
                    {loading ? (
                        <p>Loading invoices…</p>
                    ) : summary?.invoices?.length ? (
                        summary.invoices.map((invoice) => (
                            <div key={invoice.id} className="rounded border bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-medium">Invoice {invoice.id}</p>
                                        <p className="text-sm text-slate-600">{formatDate(invoice.created)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">${(invoice.amountPaid / 100).toFixed(2)}</p>
                                        <p className="text-sm text-slate-600">{invoice.status}</p>
                                    </div>
                                </div>
                                {invoice.hostedInvoiceUrl ? (
                                    <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
                                        View invoice
                                    </a>
                                ) : null}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-600">No billing history to show.</p>
                    )}
                </div>
            </div>

            <div className="rounded-lg border p-6 bg-slate-50">
                <h2 className="text-lg font-semibold">Upgrade to Premium</h2>
                <p className="mt-2 text-sm text-slate-600">Unlock analytics, export, duplicate, and AI-suggested tags.</p>
                <div className="mt-6 space-y-4">
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                        <p className="text-sm text-slate-600">Monthly price</p>
                        <p className="mt-1 text-2xl font-semibold">$5.00</p>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                        className="w-full rounded bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {checkoutLoading ? "Redirecting…" : "Upgrade with Stripe"}
                    </button>
                </div>
                <p className="mt-4 text-sm text-slate-600">Stripe is required to complete checkout. Make sure STRIPE_SECRET_KEY, STRIPE_PRICE_ID, and STRIPE_WEBHOOK_SECRET are configured in your environment.</p>
            </div>
        </div>
    );
}
