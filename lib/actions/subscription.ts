"use server";

import { getSession } from "../auth/auth";
import connectDB from "../db";
import Subscription from "../models/subscription";
import Stripe from "stripe";

export async function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  return new Stripe(secret);
}

export async function getCurrentUserPlan() {
  let session;
  try {
    session = await getSession();
  } catch (err) {
    console.warn(
      "getCurrentUserPlan: getSession failed, defaulting to free",
      err,
    );
    return { plan: "free" as const };
  }

  if (!session?.user) return { plan: "free" as const };

  await connectDB();

  const sub = await Subscription.findOne({ userId: session.user.id }).lean();
  if (!sub) return { plan: "free" as const };
  return { plan: sub.plan as "free" | "premium" };
}

export async function setUserPlanForUser(
  userId: string,
  plan: "free" | "premium",
  updates: Partial<{
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    status: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  }> = {},
) {
  await connectDB();
  const upsert = await Subscription.findOneAndUpdate(
    { userId },
    { plan, ...updates },
    { upsert: true, new: true },
  ).lean();
  return upsert;
}

export async function createStripeCheckoutSession(
  userId: string,
  email: string | null,
  origin: string,
) {
  const stripe = await getStripe();
  const existingSub = await Subscription.findOne({ userId }).lean();
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    throw new Error("STRIPE_PRICE_ID is not configured.");
  }

  let customerId = existingSub?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: email ?? undefined,
      metadata: { userId },
    });
    customerId = customer.id;
    await setUserPlanForUser(userId, existingSub?.plan ?? "free", {
      stripeCustomerId: customerId,
    });
  }

  const successUrl = `${origin}/profile/billing?success=1&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/profile/billing?canceled=1`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer: customerId,
    client_reference_id: userId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
  });

  return { url: session.url };
}

export async function getUserBillingSummary(userId: string) {
  await connectDB();
  const stripe = await getStripe();
  const sub = await Subscription.findOne({ userId }).lean();
  if (!sub?.stripeCustomerId) {
    return {
      plan: sub?.plan ?? "free",
      status: "free",
      invoices: [],
      subscription: null,
    };
  }

  const customer = await stripe.customers.retrieve(sub.stripeCustomerId);
  const subscriptions = await stripe.subscriptions.list({
    customer: sub.stripeCustomerId,
    limit: 1,
  });
  const invoices = await stripe.invoices.list({
    customer: sub.stripeCustomerId,
    limit: 10,
    expand: ["data.payment_intent"],
  });

  const activeSubscription = subscriptions.data[0] ?? null;

  return {
    plan: sub.plan,
    status: activeSubscription?.status ?? sub.status ?? "free",
    currentPeriodEnd: activeSubscription?.current_period_end
      ? new Date(activeSubscription.current_period_end * 1000)
      : sub?.currentPeriodEnd,
    cancelAtPeriodEnd:
      activeSubscription?.cancel_at_period_end ??
      sub?.cancelAtPeriodEnd ??
      false,
    subscription: activeSubscription
      ? {
          id: activeSubscription.id,
          status: activeSubscription.status,
          priceId: activeSubscription.items.data[0]?.price?.id ?? null,
          productName: activeSubscription.items.data[0]?.price?.product as
            string | null,
          currentPeriodEnd: activeSubscription.current_period_end,
        }
      : null,
    invoices: invoices.data.map((invoice) => ({
      id: invoice.id,
      amountPaid: invoice.amount_paid,
      status: invoice.status,
      created: invoice.created,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
    })),
  };
}

export async function cancelUserSubscriptionAtPeriodEnd(userId: string) {
  await connectDB();
  const stripe = await getStripe();
  const sub = await Subscription.findOne({ userId }).lean();
  if (!sub?.stripeSubscriptionId) {
    return { error: "No active Stripe subscription found." };
  }

  const canceled = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await Subscription.findOneAndUpdate(
    { userId },
    {
      status: canceled.status,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: canceled.current_period_end
        ? new Date(canceled.current_period_end * 1000)
        : undefined,
    },
  );

  return { success: true, subscription: canceled };
}

export async function syncSubscriptionRecord(
  userId: string,
  subscription: Stripe.Subscription,
) {
  await connectDB();
  await Subscription.findOneAndUpdate(
    { userId },
    {
      plan: subscription.status === "active" ? "premium" : "free",
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price?.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    { upsert: true, new: true },
  );
}
