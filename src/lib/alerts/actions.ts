import { createClient } from '@/lib/supabase/server'
import { getActiveHouseholdId } from '@/lib/app/actions'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const alertSchema = z.object({
    type: z.enum(['price', 'freight', 'delivery']),
    target_value: z.coerce.number().min(0),
    title_override: z.string().optional(), // For UI display if needed
    wish_id: z.string().uuid().optional().nullable(),
    product_id: z.string().uuid().optional().nullable(),
})

export async function getAlerts() {
    const supabase = await createClient()
    const householdId = await getActiveHouseholdId(supabase)
    if (!householdId) return { data: [] }

    const { data, error } = await supabase
        .from('alerts')
        .select(`
            *,
            products ( name, brand ),
            wishes ( title )
        `)
        .eq('household_id', householdId)
        .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { data }
}

export async function createAlert(formData: FormData) {
    const supabase = await createClient()
    const householdId = await getActiveHouseholdId(supabase)
    if (!householdId) return { error: 'Unauthorized' }

    const raw = {
        type: formData.get('type') || 'price',
        target_value: formData.get('target_value'),
        wish_id: formData.get('wish_id') || null,
        product_id: formData.get('product_id') || null,
    }

    const validated = alertSchema.safeParse(raw)
    if (!validated.success) return { error: 'Invalid data' }

    const { data, error } = await supabase
        .from('alerts')
        .insert({ ...validated.data, household_id: householdId })
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath('/app/alerts')
    return { data }
}

export async function deleteAlert(id: string) {
    const supabase = await createClient()
    const householdId = await getActiveHouseholdId(supabase)
    if (!householdId) return { error: 'Unauthorized' }

    // RLS handles permission, but double check is good practice implies intention
    const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', id)
        .eq('household_id', householdId)

    if (error) return { error: error.message }

    revalidatePath('/app/alerts')
    return { success: true }
}
