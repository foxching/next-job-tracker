import ProfileContent from "@/components/profile-content";
import { getSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";


export default async function ProfilePage() {
    const session = await getSession();

    if (!session) {
        redirect("/sign-in");
    }

    return (
        <ProfileContent session={session.user} />
    );
}