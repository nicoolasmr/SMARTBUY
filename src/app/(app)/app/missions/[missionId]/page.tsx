import { getMission, addItem } from "@/lib/missions/actions";
import { MissionItemRow } from "../mission-item-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function MissionDetailPage({ params }: { params: { missionId: string } }) {
    const { data, error } = await getMission(params.missionId);

    if (error || !data || !data.mission) {
        notFound();
    }

    const { mission, items } = data;

    // Calculations
    const totalEstimated = items.reduce((acc: number, item: any) => acc + (Number(item.estimated_price) || 0), 0);
    const remainingBudget = (mission.budget_total || 0) - totalEstimated;
    const completedCount = items.filter((i: any) => i.is_completed).length;
    const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

    async function add(formData: FormData) {
        'use server'
        await addItem(params.missionId, formData)
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
                <Link href="/app/missions" className="text-sm text-muted-foreground hover:underline flex items-center gap-1">
                    <ChevronLeft size={16} /> Voltar para Missões
                </Link>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{mission.title}</h1>
                        <p className="text-muted-foreground">{mission.description || "Sem descrição"} • {mission.moment}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-muted-foreground">Orçamento Total</div>
                        <div className="text-2xl font-bold">R$ {mission.budget_total}</div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Progresso</div>
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-right text-muted-foreground">{completedCount} / {items.length} itens</div>
                    </Card>
                    <Card className="p-4 space-y-1">
                        <div className="text-sm font-medium text-muted-foreground">Estimado</div>
                        <div className="text-2xl font-bold">R$ {totalEstimated}</div>
                    </Card>
                    <Card className={`p-4 space-y-1 ${remainingBudget < 0 ? 'bg-red-50 dark:bg-red-950/20' : ''}`}>
                        <div className="text-sm font-medium text-muted-foreground">Restante</div>
                        <div className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-500' : 'text-green-600'}`}>
                            R$ {remainingBudget}
                        </div>
                    </Card>
                </div>
            </div>

            <Separator />

            {/* Checklist */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Checklist de Compras</h2>
                </div>

                {/* Add Item Form */}
                <Card className="p-4 bg-muted/40">
                    <form action={add} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-2 w-full">
                            <Label htmlFor="title">Novo Item</Label>
                            <Input id="title" name="title" placeholder="Ex: Cadeira Ergonômica" required />
                        </div>
                        <div className="w-full md:w-32 space-y-2">
                            <Label htmlFor="price">Preço Est.</Label>
                            <Input id="price" name="estimated_price" type="number" placeholder="0.00" />
                        </div>
                        {/* Wish Selector could go here later */}
                        <Button type="submit">Adicionar</Button>
                    </form>
                </Card>

                <div className="space-y-2">
                    {items.map((item: any) => (
                        <MissionItemRow key={item.id} item={item} />
                    ))}
                    {items.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            Nenhum item nesta missão ainda.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
