import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { upsertRiskScore } from "@/lib/anti-cilada/actions"; // We'll need a client wrapper for this or bind it
import { RiskBadge } from "@/components/anti-cilada/risk-badge";
import { revalidatePath } from "next/cache";

async function getOpsOffers() {
    'use server'
    const supabase = await createClient()
    const { data: offers } = await supabase
        .from('offers')
        .select(`
            *,
            products ( name, ean_normalized ),
            shops ( name ),
            offer_risk_scores ( bucket, score, reasons )
        `)
        .order('updated_at', { ascending: false })
        .limit(50)
    return offers
}

export default async function OpsOffersPage() {
    const offers = await getOpsOffers();

    async function recalc(id: string) {
        'use server'
        await upsertRiskScore(id)
        revalidatePath('/ops/offers')
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Ofertas Ativas + Anti-Cilada</h1>
                <Button>Nova Oferta</Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead>Loja</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Risco</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {offers?.map((offer: any) => {
                            // Handle array response from join
                            const risk = Array.isArray(offer.offer_risk_scores) ? offer.offer_risk_scores[0] : offer.offer_risk_scores
                            return (
                                <TableRow key={offer.id}>
                                    <TableCell>
                                        <div className="font-medium">{offer.products?.name}</div>
                                        <div className="text-xs text-muted-foreground">{offer.products?.ean_normalized}</div>
                                    </TableCell>
                                    <TableCell>{offer.shops?.name}</TableCell>
                                    <TableCell>R$ {offer.price}</TableCell>
                                    <TableCell>
                                        {risk ? (
                                            <div className="flex flex-col gap-1">
                                                <RiskBadge bucket={risk.bucket} reasons={risk.reasons} />
                                                <span className="text-xs text-muted-foreground">Score: {risk.score}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">Pendente</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={offer.is_available ? 'default' : 'secondary'}>
                                            {offer.is_available ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <form action={recalc.bind(null, offer.id)}>
                                            <Button variant="outline" size="sm">Recalcular Risco</Button>
                                        </form>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
