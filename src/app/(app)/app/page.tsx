import { Suspense } from "react";
import { FeedGrid } from "@/components/feed/feed-grid";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";

export default function AppFeedPage() {
    return (
        <div className="space-y-8">
            {/* Welcome Hero - Static & Instant */}
            <section className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Bom dia!</h1>
                <p className="text-muted-foreground">
                    Aqui estão as melhores oportunidades baseadas nos seus desejos e perfil.
                </p>
            </section>

            {/* Feed Layout - Streaming */}
            <section>
                <Suspense fallback={<FeedSkeleton />}>
                    <FeedGrid />
                </Suspense>
            </section>
        </div>
    );
}
