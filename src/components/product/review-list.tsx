
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

type Review = {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="space-y-4">
                <h3 className="font-bold text-lg">Avaliações</h3>
                <Card className="p-8 text-center text-muted-foreground bg-muted/20">
                    <p>Ainda não há avaliações para este produto.</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg">Avaliações ({reviews.length})</h3>
            <div className="grid gap-4">
                {reviews.map((review) => (
                    <Card key={review.id} className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex text-yellow-400">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        className={`w-4 h-4 ${s <= review.rating ? 'fill-current' : 'text-gray-300'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-sm">{review.comment}</p>
                    </Card>
                ))}
            </div>
        </div>
    )
}
