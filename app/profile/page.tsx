import ProfileContent from "@/components/profile-content";
import { getSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function ProfileData() {
    const session = await getSession();

    if (!session) {
        redirect("/sign-in");
    }

    return <ProfileContent session={session.user} />;
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProfileData />
        </Suspense>
    );
}

