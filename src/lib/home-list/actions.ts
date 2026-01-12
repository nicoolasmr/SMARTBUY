'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveHouseholdId } from '@/lib/app/actions'
import { revalidatePath } from 'next/cache'
import { addDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function addItem(formData: FormData) {
    const supabase = await createClient()
    const householdId = await getActiveHouseholdId(supabase)
    if (!householdId) return { error: 'Unauthorized' }

    const productId = formData.get('product_id') as string
    const frequency = Number(formData.get('frequency_days')) || 30

    // Calculate next suggested - assuming bought today? Or just starting tracking.
    // Let's assume initialized as "bought today"
    const now = new Date()
    const next = addDays(now, frequency)

    const { error } = await supabase
        .from('home_list_items')
        .insert({
            household_id: householdId,
            product_id: productId,
            frequency_days: frequency,
            last_purchase_at: now.toISOString(),
            next_suggested_at: next.toISOString()
        })

    if (error) return { error: error.message }
    revalidatePath('/app/home-list')
    return { success: true }
}

export async function removeItem(id: string) {
    const supabase = await createClient()
    const householdId = await getActiveHouseholdId(supabase)

    const { error } = await supabase
        .from('home_list_items')
        .delete()
        .eq('id', id)
        .eq('household_id', householdId!)

    if (error) return { error: error.message }
    revalidatePath('/app/home-list')
    return { success: true }
}

export async function getList() {
    const supabase = await createClient()
    const householdId = await getActiveHouseholdId(supabase)
    if (!householdId) return { data: [] }

    const { data } = await supabase
        .from('home_list_items')
        .select(`
            *,
            products ( name, brand )
        `)
        .eq('household_id', householdId)
        .order('next_suggested_at', { ascending: true }) // Urgent first

    return { data: data || [] }
}

export async function generateWhatsAppSummary() {
    const { data } = await getList()
    if (!data || data.length === 0) return ""

    // Filter for items "due" soon (e.g. within next 7 days) or late
    const today = new Date()
    const dueItems = data.filter((item: any) => {
        const due = new Date(item.next_suggested_at)
        const diffTime = due.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 7 // Due in next week or already late
    })

    if (dueItems.length === 0) return "✅ Tudo em estoque na Lista da Casa!"

    let text = "*🛒 Lista da Casa — SmartBuy*\n\n"
    text += "Itens para repor:\n"

    dueItems.forEach((item: any) => {
        text += `• ${item.products?.name} (${item.products?.brand || ''})\n`
    })

    text += "\nVer ofertas: https://smartbuy.app/app/home-list"

    return text
}
