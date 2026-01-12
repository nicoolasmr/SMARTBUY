import { getWish } from "@/lib/app/actions";
import { WishForm } from "../wish-form";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";

export default async function WishDetailPage({ params }: { params: { wishId: string } }) {
    const { data: wish } = await getWish(params.wishId);

    if (!wish) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Detalhes do Desejo</h1>
            </div>

            <Card className="p-6 max-w-2xl">
                <WishForm initialData={wish} />
            </Card>
        </div>
    );
}
