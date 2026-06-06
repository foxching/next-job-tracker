"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateName } from "@/lib/actions/user";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
type Props = {
    user: {
        email?: string;
        name?: string;
        id?: string;
    }
};

export default function PersonalInformation({ user }: Props) {
    const [name, setName] = useState(user?.name || "");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit() {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("name", name);

            await updateName(formData);

            router.refresh(); // re-fetches server props, updates user.name
            toast.success("Profile updated successfully!");
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <h1 className="mb-6 text-2xl font-bold">
                Personal Information
            </h1>

            <div className="space-y-5">

                <div className="space-y-2">
                    <Label>Name</Label>

                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input defaultValue={user.email} disabled />
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save Changes"}
                </Button>

            </div>
        </>
    );
}