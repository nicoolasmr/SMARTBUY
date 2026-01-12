import { WishForm } from "../wish-form";
import { Card } from "@/components/ui/card";

export default function NewWishPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Novo Desejo</h1>
                <p className="text-muted-foreground">
                    Adicione um item para o SmartBuy monitorar.
                </p>
            </div>

            <Card className="p-6 max-w-2xl">
                <WishForm />
            </Card>
        </div>
    );
}
