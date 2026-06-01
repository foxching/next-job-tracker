import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => {
    return (
        <div className="min-h-screen p-6">
            <div className="container mx-auto space-y-6">

                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-64" />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-120 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
};