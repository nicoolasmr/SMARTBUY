
'use client'

import { Card } from "@/components/ui/card"

export function PriceHistoryChart({ history }: { history: any[] }) {
    if (!history || history.length === 0) return null

    // Simple visualization: Find Min/Max to scale
    const prices = history.map(h => h.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const range = maxPrice - minPrice || 1

    // Sort by date
    const sorted = [...history].sort((a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime())

    return (
        <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Histórico de Preços</h3>
            <div className="h-48 flex items-end justify-between gap-2 border-b border-l p-2">
                {sorted.map((point, i) => {
                    const heightPct = ((point.price - minPrice) / range) * 80 + 10 // scale 10-90%
                    return (
                        <div key={i} className="flex flex-col items-center group relative flex-1">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs p-1 rounded whitespace-nowrap z-10">
                                R$ {point.price.toFixed(2)}
                                <br />
                                {new Date(point.captured_at).toLocaleDateString()}
                            </div>

                            {/* Bar */}
                            <div
                                className="w-full bg-blue-500/50 hover:bg-blue-600 rounded-t transition-all"
                                style={{ height: `${heightPct}%` }}
                            />
                        </div>
                    )
                })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{new Date(sorted[0].captured_at).toLocaleDateString()}</span>
                <span>hoje</span>
            </div>
            <div className="mt-2 text-xs text-center text-muted-foreground">
                Menor: R$ {minPrice.toFixed(2)} • Maior: R$ {maxPrice.toFixed(2)}
            </div>
        </Card>
    )
}
