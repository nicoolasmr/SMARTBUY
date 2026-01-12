import { createClient } from "@/lib/supabase/server";
import { checkOpsRole } from "@/lib/ops/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";

export default async function OpsReceiptsPage() {
    const supabase = await createClient();
    await checkOpsRole(supabase);

    const { data: uploads } = await supabase
        .from('receipt_uploads')
        .select(`
            *,
            purchases (
                id,
                price_paid,
                offers ( price ),
                household_id
            )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

    async function approve(uploadId: string, purchaseId: string, pricePaid: number, referencePrice: number, householdId: string) {
        'use server'
        const sb = await createClient()
        await checkOpsRole(sb)

        // 1. Approve Receipt
        await sb.from('receipt_uploads').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', uploadId)

        // 2. Confirm Purchase
        await sb.from('purchases').update({ status: 'confirmed' }).eq('id', purchaseId)

        // 3. Calculate Economy
        const economy = Math.max(0, referencePrice - pricePaid)
        if (economy > 0) {
            await sb.from('economy_daily').insert({
                household_id: householdId,
                purchase_id: purchaseId,
                economy_amount: economy
            })
        }

        revalidatePath('/ops/receipts')
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Revisão de Comprovantes</h1>

            <div className="grid gap-4">
                {uploads?.map((u: any) => (
                    <Card key={u.id} className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-semibold">Purchase ID: {u.purchase_id}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    Arquivo: <a href="#" className="text-blue-600 underline">{u.file_path}</a>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                    <div>Preço Pago: <strong>R$ {u.purchases.price_paid}</strong></div>
                                    <div>Preço Ref: <strong>R$ {u.purchases.offers?.price}</strong></div>
                                    <div className="text-green-600">
                                        Economia Potencial: R$ {Math.max(0, (u.purchases.offers?.price || 0) - u.purchases.price_paid).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <form action={approve.bind(null, u.id, u.purchase_id, u.purchases.price_paid, u.purchases.offers?.price || 0, u.purchases.household_id)}>
                                <Button>Aprovar & Confirmar Economia</Button>
                            </form>
                        </div>
                    </Card>
                ))}
                {(!uploads || uploads.length === 0) && (
                    <div className="text-center text-muted-foreground">Nenhum comprovante pendente.</div>
                )}
            </div>
        </div>
    )
}
