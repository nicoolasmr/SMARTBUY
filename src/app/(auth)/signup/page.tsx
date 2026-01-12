
'use client'

import Link from "next/link";
import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { signup } from "@/lib/auth/actions";

export default function SignupPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signup(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm p-8 space-y-6 bg-background">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
          <p className="text-sm text-muted-foreground">
            Comece a comprar melhor hoje
          </p>
        </div>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input name="fullName" type="text" placeholder="Nome completo" required />
          </div>
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
            {isPending ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>
        <div className="text-center text-sm">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </div>
      </Card>
    </div>
  );
}
