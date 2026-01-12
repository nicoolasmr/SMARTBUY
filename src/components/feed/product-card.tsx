import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/anti-cilada/risk-badge";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/ui/price-tag";
import { StoreBadge } from "@/components/ui/store-badge";
import Link from "next/link";
import { FeedItem } from "@/lib/feed/actions";

export function ProductCard({ item }: { item: FeedItem }) {
    const { product, bestOffer, reasons } = item;

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow bg-card">
            {/* Header / Image Placeholder */}
            <div className="aspect-video bg-muted w-full relative p-4 flex items-center justify-center text-muted-foreground text-3xl">
                📦
                <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                    {/* Risk Badge (if present) */}
                    {bestOffer.risk && (
                        <RiskBadge bucket={bestOffer.risk.bucket} reasons={bestOffer.risk.reasons} />
                    )}

                    {/* Reasons Badges */}
                    {reasons.slice(0, 2).map((reason, idx) => (
                        <Badge key={idx} variant="secondary" className="shadow-sm bg-background/90 backdrop-blur">
                            ✨ {reason}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1 gap-4">
                {/* Title & Meta */}
                <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                        {product.brand}
                    </div>
                    <Link href={`/app/product/${product.id}`} className="hover:underline">
                        <h3 className="font-bold text-lg leading-tight line-clamp-2 min-h-[3rem]">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                {/* Price Section */}
                <div className="mt-auto space-y-3">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-xs text-muted-foreground mb-0.5">Melhor oferta</div>
                            <PriceTag price={bestOffer.price} size="lg" />
                        </div>
                        <div className="text-right">
                            <StoreBadge name={bestOffer.shops.name} />
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground flex justify-between border-t pt-3">
                        <span>
                            {bestOffer.freight === 0 ? 'Frete Grátis' : `Frete +R$ ${bestOffer.freight}`}
                        </span>
                        <span>
                            {bestOffer.delivery_days ? `${bestOffer.delivery_days} dias` : 'Envio imediato'}
                        </span>
                    </div>

                    <Button className="w-full" asChild>
                        <Link href={`/app/product/${product.id}`}>
                            Ver Detalhes
                        </Link>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
