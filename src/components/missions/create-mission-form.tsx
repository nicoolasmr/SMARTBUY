'use client'

import { createMission } from "@/lib/missions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export function MissionCreateForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setError(null);
        startTransition(async () => {
            const result = await createMission(formData);

            if (result?.error) {
                setError(result.error);
                return;
            }

            if (result?.data?.id) {
                router.push(`/app/missions/${result.data.id}`);
            }
        });
    }

    return (
        <Card className="p-6 bg-muted/30 border-dashed">
            <form action={handleSubmit} className="flex flex-col gap-4">
                <h3 className="font-semibold">Nova Missão</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" name="title" placeholder="Ex: Reforma do Quarto" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="moment">Momento</Label>
                        <Input id="moment" name="moment" placeholder="Ex: Home Office" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="budget">Orçamento Total</Label>
                        <Input id="budget" name="budget_total" type="number" placeholder="Ex: 5000" />
                    </div>
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        Erro ao criar missão: {error}
                    </div>
                )}

                <Button type="submit" className="self-end" disabled={isPending}>
                    {isPending ? 'Criando...' : 'Criar Missão'}
                </Button>
            </form>
        </Card>
    );
}
