import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm p-8 space-y-6 bg-background">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Recuperar senha</h1>
                    <p className="text-sm text-muted-foreground">
                        Digite seu email para receber um link de redefinição
                    </p>
                </div>
                <form className="space-y-4">
                    <div className="space-y-2">
                        <Input type="email" placeholder="seu@email.com" required />
                    </div>
                    <Button className="w-full" type="submit">
                        Enviar link
                    </Button>
                </form>
                <div className="text-center text-sm">
                    Lembrou a senha?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                        Entrar
                    </Link>
                </div>
            </Card>
        </div>
    );
}
