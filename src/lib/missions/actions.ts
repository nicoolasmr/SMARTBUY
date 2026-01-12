'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveHouseholdId } from '@/lib/app/actions'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// --- Schemas ---

const missionSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    budget_total: z.coerce.number().min(0).optional(),
    moment: z.string().optional(), // 'baby', 'home_office', etc.
})

const missionItemSchema = z.object({
    title: z.string().min(1),
    wish_id: z.string().uuid().optional().nullable(),
    estimated_price: z.coerce.number().min(0).optional(),
})

// --- Actions ---

export async function getMissions() {
    const supabase = await createClient()
    const householdId = await getActiveHouseholdId(supabase)
    if (!householdId) return { data: [] }

    const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { data }
}

export async function getMission(id: string) {
    const supabase = await createClient()
    const householdId = await getActiveHouseholdId(supabase)
    if (!householdId) return { error: 'Unauthorized' }

    // RLS ensures we only get our own, but explicit check implies intention
    const { data: mission, error: mError } = await supabase
        .from('missions')
        .select('*')
        .eq('id', id)
        .eq('household_id', householdId)
        .single()

    if (mError) return { error: mError.message }

    const { data: items, error: iError } = await supabase
        .from('mission_items')
        .select('*, wishes(title, min_price, max_price)')
        .eq('mission_id', id)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true })

    return { data: { mission, items: items || [] } }
}

export async function createMission(formData: FormData) {
    const supabase = await createClient()
    const householdId = await getActiveHouseholdId(supabase)
    if (!householdId) return { error: 'Unauthorized' }

    const raw = {
        title: formData.get('title'),
        description: formData.get('description'),
        budget_total: formData.get('budget_total'),
        moment: formData.get('moment'),
    }

    const validated = missionSchema.safeParse(raw)
    if (!validated.success) return { error: 'Invalid data' }

    const { data, error } = await supabase
        .from('missions')
        .insert({ ...validated.data, household_id: householdId })
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath('/app/missions')
    return { data }
}

export async function addItem(missionId: string, formData: FormData) {
    const supabase = await createClient()
    // No explicit household check needed IF RLS works, but `mission_items` insert policy
    // relies on joining missions. Let's trust RLS but handle errors.

    const raw = {
        title: formData.get('title'),
        wish_id: formData.get('wish_id') || null, // Optional link
        estimated_price: formData.get('estimated_price'),
    }

    const validated = missionItemSchema.safeParse(raw)
    if (!validated.success) return { error: 'Invalid item data' }

    // If wish_id provided, maybe fetch wish title if title missing? 
    // For now assume user provided title.

    const { error } = await supabase
        .from('mission_items')
        .insert({ ...validated.data, mission_id: missionId })

    if (error) return { error: error.message }

    revalidatePath(`/app/missions/${missionId}`)
    return { success: true }
}

export async function toggleItem(itemId: string, isCompleted: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('mission_items')
        .update({ is_completed: isCompleted, updated_at: new Date().toISOString() })
        .eq('id', itemId)

    if (error) return { error: error.message }
    // We don't know the mission ID easily to revalidate path without fetching. 
    // Ideally we pass it or just revalidate generic.
    revalidatePath('/app/missions/[missionId]', 'page')
    return { success: true }
}
