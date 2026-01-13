import { getPurchases, declarePurchase, uploadReceipt } from "@/lib/purchases/actions";
import { getRecentClicks } from "@/lib/attribution/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default async function PurchasesPage() {
    interface Purchase {
        id: string
        status: string
        price_paid: number
        purchase_date: string
        receipt_uploads?: { id: string }[]
        offers?: {
            products?: { name: string }
            shops?: { name: string }
        }
    }

    interface RecentClick {
        id: string
        offers?: {
            price: number
            products?: { name: string }
            shops?: { name: string }
        }
    }

    const { data: purchasesData } = await getPurchases();
    const purchases = (purchasesData || []) as unknown as Purchase[];

    const { data: clicksData } = await getRecentClicks();
    const recentClicks = (clicksData || []) as unknown as RecentClick[];

    async function declareP(formData: FormData) {
        'use server'
        await declarePurchase(formData)
    }

    async function upload(purchaseId: string, formData: FormData) {
        'use server'
        await uploadReceipt(purchaseId, formData)
    }

    const hasClicks = recentClicks && recentClicks.length > 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Minhas Compras</h1>
                <p className="text-muted-foreground">Declare suas compras e envie comprovantes para confirmar a economia.</p>
            </div>

            {/* Declaration Form */}
            <Card className="p-6 bg-muted/30 border-dashed">
                <form action={declareP} className="flex flex-col gap-4">
                    <h3 className="font-semibold">Declarar Nova Compra</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="offer">O que você comprou?</Label>
                            <Select name="attribution_link_id">
                                <SelectTrigger>
                                    <SelectValue placeholder={hasClicks ? "Selecione um clique recente" : "Nenhum clique recente"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {recentClicks?.map((click) => (
                                        <SelectItem key={click.id} value={click.id}>
                                            {click.offers?.products?.name} - {click.offers?.shops?.name} (R$ {click.offers?.price})
                                        </SelectItem>
                                    ))}
                                    {/* Fallback for manual entry not strictly implemented in select UI for simplicity */}
                                    <SelectItem value="manual">Outro (Inserção manual não disponível no MVP)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Valor Pago (R$)</Label>
                            <Input id="price" name="price_paid" type="number" step="0.01" required />
                        </div>
                    </div>
                    <Button type="submit" className="self-end">Registrar Compra</Button>
                </form>
            </Card>

            {/* List */}
            <div className="space-y-4">
                {(!purchases || purchases.length === 0) && (
                    <p className="text-muted-foreground text-center py-8">Nenhuma compra registrada.</p>
                )}

                {purchases?.map((p) => (
                    <Card key={p.id} className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div>
                                <div className="font-bold text-lg mb-1">
                                    {p.offers?.products?.name || "Produto Desconhecido"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Loja: {p.offers?.shops?.name || "Desconhecida"} • Pago: <strong>R$ {p.price_paid}</strong>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    Data: {new Date(p.purchase_date).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <Badge variant={p.status === 'confirmed' ? 'default' : 'secondary'}>
                                    {p.status === 'confirmed' ? 'Confirmada' : 'Pendente'}
                                </Badge>

                                {/* Receipt Upload */}
                                {p.status === 'pending' && (!p.receipt_uploads || p.receipt_uploads.length === 0) && (
                                    <form action={upload.bind(null, p.id)} className="flex items-center gap-2 mt-2">
                                        <Input type="file" name="file" className="w-48 text-xs h-8" required />
                                        <Button size="sm" variant="outline">Enviar Comprovante</Button>
                                    </form>
                                )}

                                {p.receipt_uploads?.length && p.receipt_uploads.length > 0 && (
                                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                                        Comprovante em Análise
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
