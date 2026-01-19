
import { Card } from "@/components/ui/card"
import { PriceTag } from "@/components/ui/price-tag"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function RelatedGrid({ products }: { products: any[] }) {
    if (!products || products.length === 0) return null

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg">Relacionados</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((p) => {
                    const bestOffer = p.offers?.[0]
                    return (
                        <Card key={p.id} className="p-4 flex flex-col gap-2 hover:shadow-md transition bg-muted/20">
                            <div className="aspect-square bg-background rounded flex items-center justify-center text-2xl">
                                📦
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm line-clamp-2 mb-1">{p.name}</h4>
                                {bestOffer && (
                                    <PriceTag price={bestOffer.price} size="sm" />
                                )}
                            </div>
                            <Button size="sm" variant="outline" className="w-full" asChild>
                                <Link href={`/app/product/${p.id}`}>Ver</Link>
                            </Button>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
