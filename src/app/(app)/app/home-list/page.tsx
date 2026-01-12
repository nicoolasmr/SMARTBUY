import { getList, addItem, removeItem, generateWhatsAppSummary } from "@/lib/home-list/actions";
import { WhatsAppShareButton } from "@/components/home-list/share-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertCircle, CheckCircle2 } from "lucide-react";

export default async function HomeListPage() {
    const { data: items } = await getList();
    const summaryText = await generateWhatsAppSummary();

    async function add(formData: FormData) {
        'use server'
        await addItem(formData)
    }

    async function remove(id: string) {
        'use server'
        await removeItem(id)
    }

    const today = new Date();

    // Split items into "Due Soon" and "Stocked"
    const dueItems = items?.filter((item: any) => {
        const due = new Date(item.next_suggested_at);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    }) || [];

    const stockedItems = items?.filter((item: any) => {
        const due = new Date(item.next_suggested_at);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 7;
    }) || [];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-blue-900">Lista da Casa</h1>
                    <p className="text-muted-foreground">O que o SmartBuy lembra que você precisa repor.</p>
                </div>
                <div className="w-full md:w-auto">
                    {/* Share Button specific to Due items */}
                    {dueItems.length > 0 && <WhatsAppShareButton text={summaryText} />}
                </div>
            </div>

            {/* Add Item Form */}
            <Card className="p-6 bg-muted/30 border-dashed">
                <form action={add} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="space-y-2 flex-1">
                        {/* Simplified Product input: In real app, this is a Search/Select */}
                        <Label htmlFor="pid">ID do Produto (Catálogo)</Label>
                        <Input id="pid" name="product_id" placeholder="UUID do Produto" required />
                    </div>
                    <div className="space-y-2 w-full md:w-48">
                        <Label htmlFor="freq">Frequência (Dias)</Label>
                        <Input id="freq" name="frequency_days" type="number" defaultValue="30" required />
                    </div>
                    <Button type="submit">Adicionar Item</Button>
                </form>
            </Card>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Due Soon Column */}
                <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-orange-600">
                        <AlertCircle className="w-5 h-5" />
                        Repor em breve
                    </h3>
                    {dueItems.length === 0 && (
                        <div className="p-8 border rounded-lg text-center text-muted-foreground bg-muted/10">
                            Nada urgente por aqui.
                        </div>
                    )}
                    {dueItems.map((item: any) => (
                        <Card key={item.id} className="p-4 flex justify-between items-center border-orange-200 bg-orange-50">
                            <div>
                                <div className="font-medium">{item.products?.name}</div>
                                <div className="text-xs text-orange-800">
                                    Sugestão: {new Date(item.next_suggested_at).toLocaleDateString()}
                                </div>
                            </div>
                            <form action={remove.bind(null, item.id)}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-800 hover:text-orange-900 hover:bg-orange-100">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </form>
                        </Card>
                    ))}
                </div>

                {/* Stocked Column */}
                <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        Em estoque
                    </h3>
                    {stockedItems.length === 0 && (
                        <div className="p-8 border rounded-lg text-center text-muted-foreground bg-muted/10">
                            Sua lista de estoque está vazia.
                        </div>
                    )}
                    {stockedItems.map((item: any) => (
                        <Card key={item.id} className="p-4 flex justify-between items-center">
                            <div>
                                <div className="font-medium">{item.products?.name}</div>
                                <div className="text-xs text-muted-foreground">
                                    Próxima: {new Date(item.next_suggested_at).toLocaleDateString()} ({item.frequency_days} dias)
                                </div>
                            </div>
                            <form action={remove.bind(null, item.id)}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </form>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
