
import { Card } from "@/components/ui/card"
import { PriceTag } from "@/components/ui/price-tag"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type RelatedProduct = {
    id: string;
    name: string;
    offers?: { price: number }[];
}

export function RelatedGrid({ products }: { products: RelatedProduct[] }) {
    if (!products || products.length === 0) return null

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg">Relacionados</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((p) => {
                    const bestOffer = p.offers?.[0]
                    return (
                        <Card key={p.id} className="p-4 flex flex-col gap-3 hover:shadow-md transition bg-white border border-gray-100 h-full">
                            {/* Image Placeholder */}
                            <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center text-3xl mb-1">
                                📦
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col gap-2">
                                {/* Title: Fixed height for 3 lines to ensure alignment */}
                                <h4
                                    className="font-medium text-sm leading-tight line-clamp-3 text-gray-700 h-[3.8rem]"
                                    title={p.name}
                                >
                                    {p.name}
                                </h4>

                                {/* Price Section: Pushed to bottom of content area */}
                                <div className="mt-auto pt-1">
                                    {bestOffer ? (
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 font-normal">a partir de</span>
                                            <PriceTag price={bestOffer.price} size="md" className="text-green-600" />
                                            {bestOffer.price > 100 && (
                                                <span className="text-[10px] text-green-600 font-medium truncate">
                                                    em até 10x sem juros
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-10 flex items-center text-xs text-gray-400">
                                            Indisponível
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CTA */}
                            <Button size="sm" variant="outline" className="w-full mt-2 font-medium" asChild>
                                <Link href={`/app/product/${p.id}`}>Ver Oferta</Link>
                            </Button>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
