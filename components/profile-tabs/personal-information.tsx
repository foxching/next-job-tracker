"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

    async function handleSubmit() {
        try {
            setLoading(true);

            const res = await fetch("/api/user/update-name", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message);
            }

            alert("Name updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Something went wrong.");
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