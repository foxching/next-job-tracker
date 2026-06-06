import ProfileContent from "@/components/profile-content";
import { ProfileSkeleton } from "@/components/skeleton/ProfileSkeleton";
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
        <Suspense fallback={<ProfileSkeleton />}>
            <ProfileData />
        </Suspense>
    );
}

