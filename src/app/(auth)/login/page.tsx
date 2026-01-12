'use client'

import Link from "next/link";
import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { login } from "@/lib/auth/actions";

export default function LoginPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setError(null);
        startTransition(async () => {
            const result = await login(formData);
            if (result?.error) {
                setError(result.error);
            }
        });
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm p-8 space-y-6 bg-background">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h1>
                    <p className="text-sm text-muted-foreground">
                        Entre com seu email para continuar
                    </p>
                </div>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Input name="email" type="email" placeholder="seu@email.com" required />
                    </div>
                    <div className="space-y-2">
                        <Input name="password" type="password" placeholder="Senha" required />
                    </div>
                    {error && (
                        <div className="text-sm text-destructive text-center">
                            {error}
                        </div>
                    )}
                    <Button className="w-full" type="submit" disabled={isPending}>
                        {isPending ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>
                <div className="text-center text-sm text-muted-foreground">
                    <Link href="/forgot-password" >Esqueceu a senha?</Link>
                </div>
                <div className="text-center text-sm">
                    Não tem conta?{" "}
                    <Link href="/signup" className="text-primary hover:underline">
                        Cadastre-se
                    </Link>
                </div>
            </Card>
        </div>
    );
}
