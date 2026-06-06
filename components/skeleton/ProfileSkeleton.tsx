import { Skeleton } from "@/components/ui/skeleton";

export const ProfileSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto p-6">

                <div
                    defaultValue="personal"
                    className="rounded-2xl bg-white p-6 shadow-md"
                >
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">

                        {/* Left Sidebar */}
                        <div className="border-r pr-4">

                            <div className="mb-6 flex flex-col items-center">

                                <Skeleton className="h-24 w-24 rounded-full" />

                                <Skeleton className="h-4 w-[200px] mt-4" />
                            </div>

                            <div className="flex h-auto w-full flex-col space-y-2 bg-transparent gap-2 p-0">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <div>
                                </div>
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className="md:col-span-3">
                            <Skeleton className="h-120 w-full" />
                        </div>

                    </div>
                </div>

            </div >
        </div >
    );
};