import mongoose, { Schema, Document } from "mongoose";

export interface IUserSubscription extends Document {
    userId: string;
    plan: "free" | "premium";
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema = new Schema<IUserSubscription>(
    {
        userId: { type: String, required: true, unique: true, index: true },
        plan: { type: String, required: true, enum: ["free", "premium"], default: "free" },
    },
    { timestamps: true }
);

export default mongoose.models.Subscription || mongoose.model<IUserSubscription>("Subscription", SubscriptionSchema);
