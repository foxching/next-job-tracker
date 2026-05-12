import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
    params: Promise<{
        userId: string;
    }>;
};

export default async function ProfileContent({ params }: Props) {
    const { userId } = await params;

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto p-6">
                <div className="grid grid-cols-1 gap-6 rounded-2xl bg-white p-6 shadow-md md:grid-cols-3">

                    {/* Left Side */}
                    <div className="flex flex-col items-center border-b pb-6 md:border-b-0 md:border-r md:pb-0">
                        <Image
                            src="https://via.placeholder.com/150"
                            alt="Profile Picture"
                            width={150}
                            height={150}
                            className="rounded-full border object-cover"
                        />

                        <Button className="mt-4 w-full">
                            Edit Profile
                        </Button>

                        <div className="mt-4 text-center">
                            <h2 className="text-xl font-semibold">User Profile</h2>
                            <p className="text-sm text-gray-500">
                                ID: {userId}
                            </p>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="md:col-span-2">
                        <h1 className="mb-6 text-2xl font-bold">
                            Profile Information
                        </h1>

                        <div className="space-y-5">

                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your name"
                                    defaultValue="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    defaultValue="john@example.com"
                                />
                            </div>

                            <Button className="mt-4">
                                Save Changes
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}