import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OpsPage() {
    return (
        <div className="p-8 space-y-8 bg-muted/10 min-h-screen">
            <header className="flex items-center justify-between pb-6 border-b">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Ops Console</h1>
                    <p className="text-muted-foreground">Visão geral do sistema e moderação.</p>
                </div>
                <Badge variant="outline" className="px-4 py-1">Admin Mode</Badge>
            </header>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="p-6 space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Novos Usuários (24h)</div>
                    <div className="text-3xl font-bold">12</div>
                </Card>
                <Card className="p-6 space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Jobs na Fila</div>
                    <div className="text-3xl font-bold text-attention">0</div>
                </Card>
                <Card className="p-6 space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Status do Sistema</div>
                    <div className="text-3xl font-bold text-primary">Operacional</div>
                </Card>
            </div>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
                <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                    Sem dados de atividade (Sprint 0)
                </div>
            </Card>
        </div>
    );
}
