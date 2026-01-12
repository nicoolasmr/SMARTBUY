import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    return (
        <div className="max-w-2xl space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>

            <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Preferências de Compra</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Configure seus guardrails de preço e qualidade.
                </p>
                <Button variant="outline">Gerenciar Guardrails</Button>
            </Card>

            <Card className="p-6 border-destructive/20 bg-destructive/5">
                <h3 className="text-lg font-medium text-destructive mb-4">Zona de Perigo</h3>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        Desativar sua conta permanentemente.
                    </p>
                    <Button variant="destructive">Desativar conta</Button>
                </div>
            </Card>
        </div>
    );
}
