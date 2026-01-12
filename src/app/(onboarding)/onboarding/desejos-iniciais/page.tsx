'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { useState } from "react";

// Stub textarea style if component missing
const TextareaStub = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        className="flex min-h-[80px] w-full rounded-input border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
    />
)

export default function OnboardingDesejosPage() {
    const [value, setValue] = useState("");

    return (
        <Card className="p-8 space-y-6">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold">Desejos Iniciais</h2>
                <p className="text-muted-foreground">
                    Tem algo específico que você precisa comprar logo?
                </p>
            </div>

            <div className="space-y-4">
                <TextareaStub
                    placeholder="Ex: Preciso de uma airfryer boa e barata..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    rows={5}
                />
                <p className="text-xs text-muted-foreground text-center">
                    Pode deixar em branco se não tiver nada em mente.
                </p>
            </div>

            <div className="flex justify-between pt-4">
                <Link href="/onboarding/restricoes">
                    <Button variant="ghost">Voltar</Button>
                </Link>
                <Link href="/onboarding/final">
                    <Button>Finalizar</Button>
                </Link>
            </div>
        </Card>
    );
}
