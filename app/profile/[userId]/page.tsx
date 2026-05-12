import ProfileContent from "@/components/profile-content";
import { Suspense } from "react";


type Props = {
    params: {
        userId: string;
    };
};

export default async function ProfilePage({ params }: Props) {
    const resolvedParams = await params;
    return (
        <Suspense fallback={<div className="p-6">Loading profile...</div>}>
            <ProfileContent params={resolvedParams} />
        </Suspense>
    );
}