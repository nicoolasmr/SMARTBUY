'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// --- Schemas ---

const householdProfileSchema = z.object({
    budget_monthly: z.coerce.number().min(0).optional(),
    budget_per_mission: z.coerce.number().min(0).optional(),
    max_installments: z.coerce.number().int().min(1).max(24).optional(),
    allowed_stores: z.string().optional().transform(s => s ? s.split(',').map(i => i.trim()).filter(Boolean) : []),
    blocked_stores: z.string().optional().transform(s => s ? s.split(',').map(i => i.trim()).filter(Boolean) : []),
    preferences: z.record(z.string(), z.any()).optional(), // Simple JSONB for now
    restrictions: z.record(z.string(), z.any()).optional(), // Simple JSONB for now
})

const wishSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    intent: z.enum(['buy_now', 'research', 'track_price']),
    min_price: z.coerce.number().min(0).optional(),
    max_price: z.coerce.number().min(0).optional(),
    urgency: z.enum(['low', 'medium', 'high']),
    constraints: z.record(z.string(), z.any()).optional(),
})

// --- Helpers ---

import { SupabaseClient } from '@supabase/supabase-js'

export async function getActiveHouseholdId(supabase: SupabaseClient) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('active_household_id')
        .eq('id', user.id)
        .single()

    if (profileError || !profile?.active_household_id) throw new Error('No active household found')

    return profile.active_household_id
}

// --- Profile Actions ---

export async function getHouseholdProfile() {
    const supabase = await createClient()

    try {
        const householdId = await getActiveHouseholdId(supabase)

        const { data, error } = await supabase
            .from('household_profiles')
            .select('*')
            .eq('household_id', householdId)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
            console.error('Error fetching profile:', error)
            return { error: 'Failed to fetch profile' }
        }

        // If not found, return empty/default structure (or null and let UI handle)
        return { data: data || null }
    } catch (_e) {
        return { error: 'Unauthorized' }
    }
}

export async function updateHouseholdProfile(formData: FormData) {
    const supabase = await createClient()

    try {
        const householdId = await getActiveHouseholdId(supabase)

        // Parse form data manually since we have transforms and complex types
        // In a real form we might pass a raw object, but let's assume FormData for standard compat
        const rawData = {
            budget_monthly: formData.get('budget_monthly'),
            budget_per_mission: formData.get('budget_per_mission'),
            max_installments: formData.get('max_installments'),
            allowed_stores: formData.get('allowed_stores'), // Expects comma separated string
            blocked_stores: formData.get('blocked_stores'), // Expects comma separated string
        }

        const validated = householdProfileSchema.safeParse(rawData)

        if (!validated.success) {
            return { error: 'Validation failed', issues: validated.error.flatten() }
        }

        const { data, error } = await supabase
            .from('household_profiles')
            .upsert({
                household_id: householdId,
                ...validated.data,
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) {
            console.error('Update profile error:', error)
            return { error: 'Failed to update profile' }
        }

        revalidatePath('/app/profile')
        return { data }

    } catch (_e) {
        return { error: 'Unauthorized' }
    }
}

// --- Wishes Actions ---

export async function getWishes() {
    const supabase = await createClient()
    try {
        const householdId = await getActiveHouseholdId(supabase)

        const { data, error } = await supabase
            .from('wishes')
            .select('*')
            .eq('household_id', householdId)
            .order('created_at', { ascending: false })

        if (error) return { error: error.message }
        return { data }
    } catch (_e) {
        return { error: 'Unauthorized' }
    }
}

export async function getWish(id: string) {
    const supabase = await createClient()
    try {
        const householdId = await getActiveHouseholdId(supabase)

        const { data, error } = await supabase
            .from('wishes')
            .select('*')
            .eq('household_id', householdId)
            .eq('id', id)
            .single()

        if (error) return { error: error.message }
        return { data }
    } catch (_e) {
        return { error: 'Unauthorized' }
    }
}

export async function createWish(formData: FormData) {
    const supabase = await createClient()
    try {
        const householdId = await getActiveHouseholdId(supabase)

        const rawData = {
            title: formData.get('title'),
            intent: formData.get('intent'),
            min_price: formData.get('min_price'),
            max_price: formData.get('max_price'),
            urgency: formData.get('urgency'),
        }

        const validated = wishSchema.safeParse(rawData)

        if (!validated.success) {
            return { error: 'Validation failed', issues: validated.error.flatten() }
        }

        const { error } = await supabase
            .from('wishes')
            .insert({
                household_id: householdId,
                ...validated.data
            })

        if (error) return { error: error.message }

        revalidatePath('/app/wishes')
        return { success: true }
    } catch (_e) {
        return { error: 'Unauthorized' }
    }
}

export async function updateWish(id: string, formData: FormData) {
    const supabase = await createClient()
    try {
        const householdId = await getActiveHouseholdId(supabase)

        const rawData = {
            title: formData.get('title'),
            intent: formData.get('intent'),
            min_price: formData.get('min_price'),
            max_price: formData.get('max_price'),
            urgency: formData.get('urgency'),
        }

        const validated = wishSchema.safeParse(rawData)

        if (!validated.success) {
            return { error: 'Validation failed', issues: validated.error.flatten() }
        }

        const { error } = await supabase
            .from('wishes')
            .update({
                ...validated.data,
                updated_at: new Date().toISOString()
            })
            .eq('household_id', householdId)
            .eq('id', id)

        if (error) return { error: error.message }

        revalidatePath('/app/wishes')
        return { success: true }
    } catch (_e) {
        return { error: 'Unauthorized' }
    }
}

export async function deleteWish(id: string) {
    const supabase = await createClient()
    try {
        const householdId = await getActiveHouseholdId(supabase)

        const { error } = await supabase
            .from('wishes')
            .delete()
            .eq('household_id', householdId)
            .eq('id', id)

        if (error) return { error: error.message }

        revalidatePath('/app/wishes')
        return { success: true }
    } catch (_e) {
        return { error: 'Unauthorized' }
    }
}
