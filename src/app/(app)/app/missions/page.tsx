import { getMissions, createMission } from "@/lib/missions/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

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

    async function create(formData: FormData) {
        'use server'
        const { data, error } = await createMission(formData)
        if (error) {
            // Handle error (toast/logging)
            return
        }
        if (data?.id) {
            redirect(`/app/missions/${data.id}`)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Missões</h1>
            </div>

            {/* Quick Create Mission (Simple Inline Form for MVP) */}
            <Card className="p-6 bg-muted/30 border-dashed">
                <form action={create} className="flex flex-col gap-4">
                    <h3 className="font-semibold">Nova Missão</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input id="title" name="title" placeholder="Ex: Reforma do Quarto" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="moment">Momento</Label>
                            <Input id="moment" name="moment" placeholder="Ex: Home Office" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="budget">Orçamento Total</Label>
                            <Input id="budget" name="budget_total" type="number" placeholder="Ex: 5000" />
                        </div>
                    </div>
                    <Button type="submit" className="self-end">Criar Missão</Button>
                </form>
            </Card>

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
