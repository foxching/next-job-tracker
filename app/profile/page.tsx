"use client";

import ProfileContent from "@/components/profile-content";
import { useSession } from "@/lib/auth/auth-client";

export default function ProfilePage() {
    const { data: session } = useSession();
    return (
        <ProfileContent session={session?.user} />
    );
}