import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => {
    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <div className="w-full px-2 py-2">

                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2 py-2">
                        <Skeleton className="h-8 w-44 " />
                        <Skeleton className="h-8 w-44" />
                    </div>
                    <div className="flex gap-2 py-2">
                        <Skeleton className="h-8 w-44" />
                        <Skeleton className="h-8 w-44" />
                        <Skeleton className="h-8 w-44" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} className="h-120 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
};