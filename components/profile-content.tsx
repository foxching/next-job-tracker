"use client";



import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import { User } from 'lucide-react';
import PersonalInformation from "./profile-tabs/personal-information";
import Security from "./profile-tabs/security";
import Settings from "./profile-tabs/settings";

type ProfileContentProps = {
    session?: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerified: boolean;
        name: string;
        image?: string | null;
    };
}

export default function ProfileContent({
    session,
}: ProfileContentProps) {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto p-6">

                <Tabs
                    defaultValue="personal"
                    className="rounded-2xl bg-white p-6 shadow-md"
                >
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">

                        {/* Left Sidebar */}
                        <div className="border-r pr-4">

                            <div className="mb-6 flex flex-col items-center">

                                <User className="h-24 w-24" />

                                <h2 className="mt-4 font-semibold">
                                    User Profile
                                </h2>

                            </div>

                            <TabsList className="flex h-auto w-full flex-col space-y-2 bg-transparent gap-2 p-0">

                                <TabsTrigger
                                    value="personal"
                                    className="w-full justify-start"
                                >
                                    Personal Information
                                </TabsTrigger>

                                <TabsTrigger
                                    value="security"
                                    className="w-full justify-start"
                                >
                                    Security
                                </TabsTrigger>

                                <TabsTrigger
                                    value="settings"
                                    className="w-full justify-start"
                                >
                                    Settings
                                </TabsTrigger>

                            </TabsList>
                        </div>

                        {/* Right Content */}
                        <div className="md:col-span-3">

                            <TabsContent value="personal">
                                <PersonalInformation
                                    user={{
                                        email: session?.email,
                                        name: session?.name,
                                        id: session?.id,
                                    }}
                                />
                            </TabsContent>

                            <TabsContent value="security">
                                <Security />
                            </TabsContent>

                            <TabsContent value="settings">
                                <Settings />
                            </TabsContent>

                        </div>

                    </div>
                </Tabs>

            </div>
        </div>
    );
}