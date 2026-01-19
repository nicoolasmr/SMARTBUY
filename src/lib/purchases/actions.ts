'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveHouseholdId } from '@/lib/app/actions'
import { revalidatePath } from 'next/cache'

export async function declarePurchase(formData: FormData) {
    const supabase = await createClient()
    const householdId = await getActiveHouseholdId(supabase)
    if (!householdId) return { error: 'Unauthorized' }

    const raw = {
        offer_id: formData.get('offer_id') || undefined,
        attribution_link_id: formData.get('attribution_link_id') || undefined,
        price_paid: Number(formData.get('price_paid')),
        purchase_date: formData.get('purchase_date') || new Date().toISOString(),
        status: 'pending' // Default
    }

    // Logic: If offer_id is missing but attribution_link is present, fetch offer from link.
    // Logic: If user just declares manually?
    // Let's assume simplest case: User selects from their "Recent Clicks" or manual entry.
    // For manual entry, let's skip offer_id requirement if it's purely generic? 
    // Schema says offer_id is nullable.

    const { data: purchase, error } = await supabase
        .from('purchases')
        .insert({ ...raw, household_id: householdId })
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath('/app/purchases')
    return { data: purchase }
}

export async function uploadReceipt(purchaseId: string) {
    const supabase = await createClient()
    const householdId = await getActiveHouseholdId(supabase)
    if (!householdId) return { error: 'Unauthorized' }

    // 1. Upload File (Mock if Storage not ready)
    // const file = formData.get('file') as File
    // const { data: fileData, error: fileError } = await supabase.storage.from('receipts').upload(...)

    // Mock Path
    const filePath = `receipts/${purchaseId}/mock_file.pdf` // Simulate upload

    // 2. Create Receipt Record
    const { error } = await supabase
        .from('receipt_uploads')
        .insert({
            purchase_id: purchaseId,
            file_path: filePath,
            status: 'pending'
        })

    if (error) return { error: error.message }

    revalidatePath('/app/purchases')
    return { success: true }
}

export async function getPurchases() {
    const supabase = await createClient()
    const householdId = await getActiveHouseholdId(supabase)
    if (!householdId) return { data: [] }

    const { data } = await supabase
        .from('purchases')
        .select(`
            *,
            offers ( products(name), shops(name) ),
            receipt_uploads ( status )
        `)
        .eq('household_id', householdId)
        .order('created_at', { ascending: false })

    return { data: data || [] }
}

export async function getSavings() {
    const supabase = await createClient()
    const householdId = await getActiveHouseholdId(supabase)

    const { data } = await supabase
        .from('economy_daily')
        .select('economy_amount, calculated_at')
        .eq('household_id', householdId!)

    if (!data) return { total: 0, history: [] }

    const total = data.reduce((acc, curr) => acc + curr.economy_amount, 0)
    return { total, history: data }
}
