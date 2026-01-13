'use client'

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateHouseholdProfile } from "@/lib/app/actions";
import { Label } from "@/components/ui/label";

type ProfileData = {
    budget_monthly?: number
    budget_per_mission?: number
    max_installments?: number
    allowed_stores?: string[]
    blocked_stores?: string[]
}

export function ProfileForm({ initialData }: { initialData: ProfileData }) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // In a real app we'd use react-hook-form, but for simplicity/speed in this demo:
    async function handleSubmit(formData: FormData) {
        setMessage(null);
        startTransition(async () => {
            const result = await updateHouseholdProfile(formData);
            if (result?.error) {
                setMessage({ text: result.error, type: 'error' });
            } else {
                setMessage({ text: 'Perfil atualizado com sucesso!', type: 'success' });
            }
        });
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="budget_monthly">Orçamento Mensal (R$)</Label>
                    <Input
                        id="budget_monthly"
                        name="budget_monthly"
                        type="number"
                        defaultValue={initialData?.budget_monthly}
                        placeholder="0.00"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="budget_per_mission">Limite por Missão (R$)</Label>
                    <Input
                        id="budget_per_mission"
                        name="budget_per_mission"
                        type="number"
                        defaultValue={initialData?.budget_per_mission}
                        placeholder="0.00"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="max_installments">Máximo de Parcelas</Label>
                    <Input
                        id="max_installments"
                        name="max_installments"
                        type="number"
                        max={24}
                        defaultValue={initialData?.max_installments}
                        placeholder="Ex: 12"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="allowed_stores">Lojas Preferidas (separadas por vírgula)</Label>
                <Input
                    id="allowed_stores"
                    name="allowed_stores"
                    defaultValue={initialData?.allowed_stores?.join(', ')}
                    placeholder="Amazon, Mercado Livre..."
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="blocked_stores">Lojas Bloqueadas</Label>
                <Input
                    id="blocked_stores"
                    name="blocked_stores"
                    defaultValue={initialData?.blocked_stores?.join(', ')}
                    placeholder="Loja X, Loja Y..."
                />
            </div>

            {message && (
                <div className={`text-sm ${message.type === 'error' ? 'text-destructive' : 'text-primary'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>
        </form>
    );
}
