'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function OnboardingOrcamentoPage() {
    const [value, setValue] = useState("");

    return (
        <Card className="p-8 space-y-6">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold">Definição de Orçamento</h2>
                <p className="text-muted-foreground">
                    Quanto você planeja gastar mensalmente com compras de mercado?
                </p>
            </div>

            <div className="space-y-4 max-w-sm mx-auto">
                <div className="relative">
                    <span className="absolute left-3 top-2 text-muted-foreground">R$</span>
                    <Input
                        type="number"
                        placeholder="0,00"
                        className="pl-10"
                        onChange={(e) => setValue(e.target.value)}
                    />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    Não se preocupe, isso é apenas uma meta inicial.
                </p>
            </div>

            <div className="flex justify-between pt-4">
                <Link href="/onboarding/momento">
                    <Button variant="ghost">Voltar</Button>
                </Link>
                <Link href="/onboarding/preferencias">
                    <Button disabled={!value}>Continuar</Button>
                </Link>
            </div>
        </Card>
    );
}
