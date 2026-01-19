import { getProduct } from "@/lib/catalog/actions";
import { PriceTag } from "@/components/ui/price-tag";
import { StoreBadge } from "@/components/ui/store-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import { PriceHistoryChart } from "@/components/product/price-history-chart";
import { ReviewList } from "@/components/product/review-list";
import { RelatedGrid } from "@/components/product/related-grid";

export default async function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
    const { productId } = await params;
    const { data, error } = await getProduct(productId);

    if (error || !data || !data.product) {
        notFound();
    }

    const { product, offers, priceHistory, reviews, relatedProducts } = data;
    const bestOffer = offers?.[0];

    // [DEMO] Mock History if empty
    let chartHistory = priceHistory
    if ((!chartHistory || chartHistory.length === 0) && bestOffer) {
        // Generate last 30 days
        const today = new Date()
        chartHistory = Array.from({ length: 15 }).map((_, i) => {
            const date = new Date(today)
            date.setDate(date.getDate() - (14 - i) * 2)
            // Pseudo-random based on date to avoid purity error
            const seed = date.getTime();
            const pseudoRandom = (Math.sin(seed) + 1) / 2;
            const variation = (pseudoRandom - 0.5) * (bestOffer.price * 0.2)
            return {
                captured_at: date.toISOString(),
                price: Math.max(bestOffer.price + variation, bestOffer.price * 0.5)
            }
        })
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 aspect-square bg-muted rounded-xl flex items-center justify-center text-4xl text-muted-foreground shadow-inner">
                    📷
                </div>
                <div className="flex-1 space-y-4">
                    <div>
                        <Badge variant="secondary" className="mb-2">{product.brand}</Badge>
                        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                        <p className="text-sm text-muted-foreground mt-1">EAN: {product.ean_normalized}</p>
                    </div>

                    {bestOffer ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-muted/30 rounded-lg border">
                                <div className="text-sm text-muted-foreground mb-1">Melhor oferta encontrada</div>
                                <div className="flex items-end gap-2 mb-2">
                                    <PriceTag price={bestOffer.price} size="xl" />
                                    <span className="text-sm text-muted-foreground mb-1">
                                        em <span className="font-medium text-foreground">{bestOffer.shops?.name}</span>
                                    </span>
                                </div>
                                <Button size="lg" className="w-full md:w-auto font-bold" asChild>
                                    <a href={bestOffer.url || '#'} target="_blank" rel="noopener noreferrer">
                                        Ir à Loja ↗
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                            Produto indisponível no momento.
                        </div>
                    )}
                </div>
            </div>

            <Separator />

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-8">
                    {/* History Chart */}
                    <PriceHistoryChart history={chartHistory} />

                    {/* Offers List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Todas as Ofertas</h2>
                        <div className="grid gap-4">
                            {offers?.map((offer) => (
                                <Card key={offer.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition">
                                    <div className="flex items-center gap-4">
                                        <StoreBadge name={offer.shops?.name} reputation={offer.shops?.reputation_score} />
                                        <div>
                                            <div className="text-sm font-medium">
                                                {offer.freight === 0 ? 'Frete Grátis' : `Frete R$ ${offer.freight}`}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {offer.delivery_days ? `${offer.delivery_days} dias` : 'Envio imediato'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <PriceTag price={offer.price} size="lg" />
                                        <Button variant="ghost" size="sm" className="mt-1 h-7 text-xs" asChild>
                                            <a href={offer.url || '#'} target="_blank" rel="noopener noreferrer">
                                                Ver
                                            </a>
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                            {!offers?.length && (
                                <p className="text-muted-foreground text-sm">Nenhuma oferta extra encontrada.</p>
                            )}
                        </div>
                    </div>

                    {/* Reviews */}
                    <ReviewList reviews={reviews} />
                </div>

                <div className="space-y-6">
                    {/* Related Sidebar */}
                    <Card className="p-4 bg-blue-50/50 border-blue-100">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-blue-900">Por que é recomendado?</h3>
                            <ul className="text-sm space-y-2 text-blue-800">
                                <li className="flex gap-2">✨ Melhor preço dos últimos 30 dias</li>
                                <li className="flex gap-2">🛡️ Loja verificada e segura</li>
                                <li className="flex gap-2">⚡ Entrega rápida disponível</li>
                            </ul>
                        </div>
                    </Card>

                    <RelatedGrid products={relatedProducts} />
                </div>
            </div>
        </div>
    );
}
