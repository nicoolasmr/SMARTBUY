'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";

const OPTIONS = [
    { id: "premium", label: "Qualidade Premium" },
    { id: "custo_beneficio", label: "Custo-benefício" },
    { id: "preco_baixo", label: "Menor Preço" },
    { id: "sustentavel", label: "Sustentável" },
    { id: "organico", label: "Orgânico" },
    { id: "local", label: "Produtores Locais" },
];

export default function OnboardingPreferenciasPage() {
    const [selected, setSelected] = useState<string[]>([]);

    const toggle = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((s) => s !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    return (
        <Card className="p-8 space-y-6">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold">O que você prioriza?</h2>
                <p className="text-muted-foreground">
                    Selecione as tags que mais combinam com seu estilo de compra.
                </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center py-4">
                {OPTIONS.map((opt) => (
                    <Badge
                        key={opt.id}
                        variant={selected.includes(opt.id) ? "default" : "outline"}
                        className={cn(
                            "cursor-pointer text-sm py-2 px-4 hover:bg-primary/90",
                            selected.includes(opt.id) ? "" : "hover:text-primary-foreground"
                        )}
                        onClick={() => toggle(opt.id)}
                    >
                        {opt.label}
                    </Badge>
                ))}
            </div>

            <div className="flex justify-between pt-4">
                <Link href="/onboarding/orcamento">
                    <Button variant="ghost">Voltar</Button>
                </Link>
                <Link href="/onboarding/restricoes">
                    <Button disabled={selected.length === 0}>Continuar</Button>
                </Link>
            </div>
        </Card>
    );
}
