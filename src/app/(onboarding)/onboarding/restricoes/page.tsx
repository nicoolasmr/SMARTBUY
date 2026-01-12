'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { cn } from "@/lib/utils";

const OPTIONS = [
    { id: "gluten_free", label: "Sem Glúten" },
    { id: "lactose_free", label: "Sem Lactose" },
    { id: "vegan", label: "Vegano" },
    { id: "vegetarian", label: "Vegetariano" },
    { id: "sugar_free", label: "Sem Açúcar" },
    { id: "nut_free", label: "Alergia a Nozes" },
];

export default function OnboardingRestricoesPage() {
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
                <h2 className="text-2xl font-bold">Possui restrições?</h2>
                <p className="text-muted-foreground">
                    Marque itens que você ou sua família NÃO consomem.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4">
                {OPTIONS.map((opt) => (
                    <div
                        key={opt.id}
                        onClick={() => toggle(opt.id)}
                        className={cn(
                            "border rounded-input p-4 text-center cursor-pointer transition-colors",
                            selected.includes(opt.id) ? "border-primary bg-primary/5 text-primary font-medium" : "hover:bg-muted/50"
                        )}
                    >
                        {opt.label}
                    </div>
                ))}
                <div
                    onClick={() => setSelected([])}
                    className={cn(
                        "col-span-2 border rounded-input p-4 text-center cursor-pointer transition-colors",
                        selected.length === 0 ? "border-muted-foreground/50 bg-muted text-muted-foreground" : "hover:bg-muted/50"
                    )}
                >
                    Nenhuma restrição
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Link href="/onboarding/preferencias">
                    <Button variant="ghost">Voltar</Button>
                </Link>
                <Link href="/onboarding/desejos-iniciais">
                    <Button>Continuar</Button>
                </Link>
            </div>
        </Card>
    );
}
