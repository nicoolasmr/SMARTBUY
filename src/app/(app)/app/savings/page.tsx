import { getSavings } from "@/lib/purchases/actions"; // We need to fix this import, getSavings is in lib/purchases/actions.ts
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Wait, I put getSavings in lib/purchases/actions.ts in previous step. 
// Let's verify. Yes.

export default async function SavingsPage() {
    const { total, history } = await getSavings();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-green-700">Minha Economia</h1>
                <p className="text-muted-foreground">Dinheiro real que você deixou de gastar graças ao SmartBuy.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="p-8 bg-green-50 border-green-100">
                    <div className="text-sm font-medium text-green-800">Economia Total Confirmada</div>
                    <div className="text-5xl font-extrabold text-green-700 mt-2">
                        R$ {total.toFixed(2)}
                    </div>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Histórico</h3>
                <Card>
                    <div className="p-4 border-b bg-muted/50 font-medium grid grid-cols-2">
                        <span>Data</span>
                        <span className="text-right">Valor Economizado</span>
                    </div>
                    {history.map((h: any) => (
                        <div key={h.calculated_at} className="p-4 border-b grid grid-cols-2">
                            <span>{format(new Date(h.calculated_at), "d 'de' MMMM, yyyy", { locale: ptBR })}</span>
                            <span className="text-right font-bold text-green-600">+ R$ {h.economy_amount.toFixed(2)}</span>
                        </div>
                    ))}
                    {history.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            Nenhuma economia registrada ainda. Declare suas compras!
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
