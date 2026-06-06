"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updatePassword } from "@/lib/actions/user";

export default function Security() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {

            await updatePassword({ currentPassword, newPassword });
            setCurrentPassword("");
            setNewPassword("");
            toast.success("Password updated successfully.");
        } catch (error) {
            const message = (error as Error)?.message ?? "Failed to update password.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <h1 className="mb-6 text-2xl font-bold">Security</h1>

            <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                    <div role="alert" className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                </Button>
            </form>
        </>
    );
}
