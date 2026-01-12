'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
// In a real app we'd use a server action to save this

export default function OnboardingMomentoPage() {
    const [value, setValue] = useState("");

    return (
        <Card className="p-8 space-y-6">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold">Qual seu momento de vida?</h2>
                <p className="text-muted-foreground">
                    Isso nos ajuda a calibrar o tamanho das embalagens e tipos de produtos.
                </p>
            </div>

            <div className="space-y-4 max-w-sm mx-auto">
                <Select onValueChange={setValue}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="single">Solteiro(a)</SelectItem>
                        <SelectItem value="casal">Casal</SelectItem>
                        <SelectItem value="familia_pequena">Família Pequena (1-2 filhos)</SelectItem>
                        <SelectItem value="familia_grande">Família Grande (3+ filhos)</SelectItem>
                        <SelectItem value="republica">República / Divido AP</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-between pt-4">
                <Link href="/onboarding/welcome">
                    <Button variant="ghost">Voltar</Button>
                </Link>
                <Link href="/onboarding/orcamento">
                    <Button disabled={!value}>Continuar</Button>
                </Link>
            </div>
        </Card>
    );
}
