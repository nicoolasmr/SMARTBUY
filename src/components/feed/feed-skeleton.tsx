import { Skeleton } from "@/components/ui/skeleton";

export function FeedSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4 border rounded-xl p-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="pt-4 flex justify-between items-center">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
            ))}
        </div>
    );
}
