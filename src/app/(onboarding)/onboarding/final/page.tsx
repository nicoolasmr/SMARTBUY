'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { finishOnboarding } from "@/lib/auth/actions";
import { useTransition, useState } from "react";

export default function OnboardingFinalPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleFinish = () => {
        startTransition(async () => {
            const res = await finishOnboarding();
            if (res?.error) {
                setError(res.error);
            }
        });
    };

    return (
        <Card className="p-8 space-y-6 text-center">
            <div className="space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Tudo pronto!</h1>
                <p className="text-muted-foreground text-lg">
                    Seu perfil foi configurado. Agora você pode aproveitar o SmartBuy.
                </p>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <div className="pt-4">
                <Button size="lg" className="w-full sm:w-auto px-12" onClick={handleFinish} disabled={isPending}>
                    {isPending ? "Finalizando..." : "Ir para o App"}
                </Button>
            </div>
        </Card>
    );
}
