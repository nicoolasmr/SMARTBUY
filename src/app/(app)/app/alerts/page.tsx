import { getAlerts, createAlert, deleteAlert } from "@/lib/alerts/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, TrendingDown } from "lucide-react";
// import { revalidatePath } from "next/cache";

export default async function AlertsPage() {
    const { data: alerts } = await getAlerts();

    async function create(formData: FormData) {
        'use server'
        await createAlert(formData)
    }

    async function remove(id: string) {
        'use server'
        await deleteAlert(id)
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Meus Alertas</h1>
                <p className="text-muted-foreground">Seja notificado quando os preços caírem.</p>
            </div>

            {/* Create Alert Form */}
            <Card className="p-6 bg-muted/30 border-dashed">
                <form action={create} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="space-y-2 flex-1">
                        <Label htmlFor="target">Preço Alvo (R$)</Label>
                        <Input id="target" name="target_value" type="number" placeholder="Ex: 2000" required />
                    </div>
                    {/* 
                  Simplified MVP: Just manual Target Price. 
                  In real app, we'd select a Product or Wish from a dropdown.
                  For now, we assume user is creating a generic 'price watch' or we mock the ID linkage hiddenly 
                  or we just show the Price Target field.
                  To make it usable, let's add a "Product ID" input just for demo if they copy-paste, 
                  or just generic. 
               */}
                    <div className="space-y-2 flex-1">
                        <Label htmlFor="pid">ID do Produto (Opcional)</Label>
                        <Input id="pid" name="product_id" placeholder="UUID do Produto" />
                    </div>

                    <Button type="submit"><TrendingDown className="w-4 h-4 mr-2" /> Criar Alerta</Button>
                </form>
            </Card>

            {/* List */}
            <div className="space-y-4">
                {(!alerts || alerts.length === 0) && (
                    <p className="text-muted-foreground text-center py-8">Nenhum alerta ativo.</p>
                )}

                {(alerts as unknown as { id: string; products?: { name: string }; is_active: boolean; type: string; target_value: number; last_triggered_at?: string }[]).map((alert) => (
                    <Card key={alert.id} className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="font-semibold flex items-center gap-2">
                                {alert.products?.name || "Alerta de Preço"}
                                {alert.is_active ? (
                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Ativo</Badge>
                                ) : (
                                    <Badge variant="secondary">Inativo</Badge>
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Notificar quando {alert.type === 'price' ? 'Preço' : alert.type} for menor que <strong>R$ {alert.target_value}</strong>
                            </div>
                            {alert.last_triggered_at && (
                                <div className="text-xs text-orange-600">
                                    Último disparo: {new Date(alert.last_triggered_at).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                        <form action={remove.bind(null, alert.id)}>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </form>
                    </Card>
                ))}
            </div>
        </div>
    );
}
