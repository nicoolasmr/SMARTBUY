import { getProduct } from "@/lib/catalog/actions";
import { PriceTag } from "@/components/ui/price-tag";
import { StoreBadge } from "@/components/ui/store-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
// import Link from "next/link";

export default async function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
    const { productId } = await params;
    const { data, error } = await getProduct(productId);

    if (error || !data || !data.product) {
        notFound();
    }

    const { product, offers } = data;
    const bestOffer = offers?.[0];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 aspect-square bg-muted rounded-xl flex items-center justify-center text-4xl text-muted-foreground">
                    📷
                </div>
                <div className="flex-1 space-y-4">
                    <div>
                        <Badge variant="secondary" className="mb-2">{product.brand}</Badge>
                        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                        <p className="text-sm text-muted-foreground mt-1">EAN: {product.ean_normalized}</p>
                    </div>

                    {bestOffer ? (
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Melhor oferta em</div>
                            <div className="flex items-end gap-2">
                                <PriceTag price={bestOffer.price} size="xl" />
                                <span className="text-sm text-muted-foreground mb-1">
                                    via <span className="font-medium text-foreground">{bestOffer.shops?.name}</span>
                                </span>
                            </div>
                            <Button size="lg" className="w-full md:w-auto" asChild>
                                <a href={bestOffer.url || '#'} target="_blank" rel="noopener noreferrer">
                                    Ir à Loja
                                </a>
                            </Button>
                        </div>
                    ) : (
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                            Produto indisponível no momento.
                        </div>
                    )}
                </div>
            </div>

            <Separator />

            {/* Offers List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Todas as Ofertas</h2>
                <div className="grid gap-4">
                    {offers?.map((offer) => (
                        <Card key={offer.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <StoreBadge name={offer.shops?.name} reputation={offer.shops?.reputation_score} />
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        {offer.freight === 0 ? 'Frete Grátis' : `Frete R$ ${offer.freight}`}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {offer.delivery_days ? `${offer.delivery_days} dias` : 'Envio imediato'}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <PriceTag price={offer.price} size="lg" />
                                <Button variant="outline" size="sm" className="mt-1" asChild>
                                    <a href={offer.url || '#'} target="_blank" rel="noopener noreferrer">
                                        Ver Oferta
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
        </div>
    );
}
