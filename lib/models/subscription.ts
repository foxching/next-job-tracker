import mongoose, { Schema, Document } from "mongoose";

export interface IUserSubscription extends Document {
    userId: string;
    plan: "free" | "premium";
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
    status?: string;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema = new Schema<IUserSubscription>(
    {
        userId: { type: String, required: true, unique: true, index: true },
        plan: { type: String, required: true, enum: ["free", "premium"], default: "free" },
        stripeCustomerId: { type: String },
        stripeSubscriptionId: { type: String },
        stripePriceId: { type: String },
        status: { type: String },
        currentPeriodEnd: { type: Date },
        cancelAtPeriodEnd: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.Subscription || mongoose.model<IUserSubscription>("Subscription", SubscriptionSchema);
