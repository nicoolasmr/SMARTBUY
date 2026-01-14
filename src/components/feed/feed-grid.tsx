import { getFeed, FeedItem } from "@/lib/feed/actions";
import { ProductCard } from "@/components/feed/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export async function FeedGrid() {
    // Artificial delay to demonstrate Suspense if needed (remove in prod)
    // await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: feedData } = await getFeed();
    const feed = (feedData || []) as FeedItem[];
    const isEmpty = !feed || feed.length === 0;

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-muted/30 border-2 border-dashed rounded-xl text-center space-y-4">
                <div className="text-4xl">🌱</div>
                <div className="space-y-2 max-w-md">
                    <h3 className="text-xl font-semibold">Feed Vazio</h3>
                    <p className="text-muted-foreground">
                        Ainda não encontramos recomendações. Isso acontece porque você não tem desejos ativos ou nossos produtos não batem com seus filtros.
                    </p>
                </div>
                <div className="flex gap-4 pt-4">
                    <Button variant="outline" asChild>
                        <Link href="/app/profile">Revisar Perfil</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/app/wishes/new">Criar Novo Desejo</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {feed.map((item, idx) => (
                <ProductCard key={`${item.product.id}-${idx}`} item={item} />
            ))}
        </div>
    );
}
