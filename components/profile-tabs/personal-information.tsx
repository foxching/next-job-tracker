"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateUserProfile } from "@/lib/actions/user";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
type Props = {
    user: {
        email?: string;
        name?: string;
        id?: string;
        title?: string | null | undefined;
        company?: string | null | undefined;
        phone?: string | null | undefined;
        location?: string | null | undefined;
        website?: string | null | undefined;
        linkedin?: string | null | undefined;
        bio?: string | null | undefined;
    }
};

export default function PersonalInformation({ user }: Props) {
    const [name, setName] = useState(user?.name || "");
    const [title, setTitle] = useState(user?.title || "");
    const [company, setCompany] = useState(user?.company || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [location, setLocation] = useState(user?.location || "");
    const [website, setWebsite] = useState(user?.website || "");
    const [linkedin, setLinkedin] = useState(user?.linkedin || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit() {
        try {
            setLoading(true);

            await updateUserProfile({
                name,
                title,
                company,
                phone,
                location,
                website,
                linkedin,
                bio,
            });

            router.refresh(); // re-fetches server props, updates user data
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
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Website</Label>
                        <Input
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>LinkedIn</Label>
                        <Input
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input defaultValue={user.email} disabled />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        placeholder="Write a short bio or summary about yourself"
                    />
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