import { getMissions } from "@/lib/missions/actions";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { MissionCreateForm } from "@/components/missions/create-mission-form";

export default async function MissionsListPage() {
    interface MissionSummary {
        id: string
        title: string
        moment?: string
        description?: string
        budget_total?: number
        is_active: boolean
    }
    const res = await getMissions();
    const missions = (res.data || []) as unknown as MissionSummary[];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Missões</h1>
            </div>

            {/* Quick Create Mission (Client Component with Error Handling) */}
            <MissionCreateForm />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {missions.map((mission) => (
                    <Link key={mission.id} href={`/app/missions/${mission.id}`}>
                        <Card className="p-6 h-full hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold">{mission.title}</h3>
                                    {mission.moment && (
                                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{mission.moment}</span>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-sm line-clamp-2">
                                    {mission.description || "Sem descrição"}
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
                                <span className="font-semibold text-primary">
                                    {mission.budget_total ? `R$ ${mission.budget_total}` : 'Sem orçamento'}
                                </span>
                                <span className="text-muted-foreground">
                                    {mission.is_active ? 'Em andamento' : 'Concluída'}
                                </span>
                            </div>
                        </Card>
                    </Link>
                ))}
                {missions.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        Nenhuma missão ativa. Crie uma para começar a planejar!
                    </div>
                )}
            </div>
        </div>
    );
}
