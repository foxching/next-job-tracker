import BillingContent from "@/components/billing-content";
import { Suspense } from "react";


export default function BillingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BillingContent />
        </Suspense>
    );
}