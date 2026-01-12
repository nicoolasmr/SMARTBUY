import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { checkOpsRole } from "@/lib/ops/actions";

export default async function OpsAlertsPage() {
    const supabase = await createClient();
    await checkOpsRole(supabase);

    // Stats
    const { count: activeAlerts } = await supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('is_active', true);
    const { count: totalEvents } = await supabase.from('alert_events').select('*', { count: 'exact', head: true });

    // Recent Events
    const { data: events } = await supabase
        .from('alert_events')
        .select('*, alerts(target_value, products(name))')
        .order('triggered_at', { ascending: false })
        .limit(10);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Monitoramento de Alertas</h1>

            <div className="grid grid-cols-2 gap-4">
                <Card className="p-6">
                    <div className="text-sm text-muted-foreground">Alertas Ativos</div>
                    <div className="text-4xl font-bold">{activeAlerts}</div>
                </Card>
                <Card className="p-6">
                    <div className="text-sm text-muted-foreground">Eventos Disparados</div>
                    <div className="text-4xl font-bold">{totalEvents}</div>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Últimos Disparos</h3>
                <div className="rounded-md border">
                    <div className="p-4 bg-muted/50 font-medium grid grid-cols-3">
                        <span>Data</span>
                        <span>Produto</span>
                        <span>Preço Detectado</span>
                    </div>
                    {events?.map((evt: any) => (
                        <div key={evt.id} className="p-4 border-t grid grid-cols-3 text-sm">
                            <span>{new Date(evt.triggered_at).toLocaleString()}</span>
                            <span>{evt.alerts?.products?.name || 'Desconhecido'}</span>
                            <span>R$ {evt.payload?.price || '-'}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
