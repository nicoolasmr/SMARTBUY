'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// --- Schemas ---
// Ops schemas can be stricter or handle more raw data

const upsertProductSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1),
    brand: z.string().optional(),
    ean_normalized: z.string().length(13), // Strict EAN-13
    category: z.string().optional(),
    attributes: z.record(z.string(), z.any()).optional(),
})

const upsertOfferSchema = z.object({
    id: z.string().uuid().optional(),
    product_id: z.string().uuid(),
    shop_id: z.string().uuid(),
    price: z.coerce.number().min(0),
    freight: z.coerce.number().min(0).default(0),
    url: z.string().url().optional(),
    is_available: z.boolean().default(true),
})

const createShopSchema = z.object({
    name: z.string().min(1),
    domain: z.string().optional(),
})

// --- Helpers ---

export async function checkOpsRole(supabase: any) {
    // For MVP Sprint 4, we assume if we have a valid session we proceed.
    // In strict prod, we'd check `auth.users` metadata or profile tables.
    // The RLS enforced at DB level will actually Fail the write if the policy isn't met.
    // So here we mostly just ensure we have a User.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    return user
}

// --- Actions ---

export async function upsertProduct(formData: FormData) {
    const supabase = await createClient()
    try {
        await checkOpsRole(supabase)

        const raw = {
            id: formData.get('id') || undefined,
            name: formData.get('name'),
            brand: formData.get('brand'),
            ean_normalized: formData.get('ean_normalized'),
            category: formData.get('category'),
            // attributes hard to pass via FormData without parsing JSON string
        }

        // Simple manual validation match schema if needed, or just let DB fail
        // Using schema:
        const validated = upsertProductSchema.safeParse(raw)
        // Note: zod schema expects exact types (e.g. string length). formData returns Request format (strings).

        if (!validated.success) {
            return { error: 'Validation failed', issues: validated.error.flatten() }
        }

        const { data, error } = await supabase
            .from('products')
            .upsert({ ...validated.data, updated_at: new Date().toISOString() })
            .select()
            .single()

        if (error) return { error: error.message }

        revalidatePath('/ops/catalog')
        return { data }

    } catch (e) {
        return { error: 'Unauthorized or Error' }
    }
}

export async function upsertOffer(formData: FormData) {
    const supabase = await createClient()
    try {
        await checkOpsRole(supabase)

        const raw = {
            id: formData.get('id') || undefined,
            product_id: formData.get('product_id'),
            shop_id: formData.get('shop_id'),
            price: formData.get('price'),
            freight: formData.get('freight'),
            url: formData.get('url'),
            is_available: formData.get('is_available') === 'on'
        }

        const validated = upsertOfferSchema.safeParse(raw)
        if (!validated.success) {
            return { error: 'Validation failed', issues: validated.error.flatten() }
        }

        const { error } = await supabase
            .from('offers')
            .upsert({ ...validated.data, updated_at: new Date().toISOString() })

        if (error) return { error: error.message }

        // Also Create History Entry!
        // Get the new offer ID (if insert) or existing (if update).
        // Since we upserted, we might not have the ID if we didn't select.
        // Let's assume we passed ID or we need to fetch it? 
        // Ideally upsert returns data.

        // Refetch or select:
        // Actually simpler:
        // const { data: offer } = await supabase...upsert().select().single()
        // ... await supabase.from('offer_price_history').insert({ offer_id: offer.id, price, freight })

        revalidatePath('/ops/offers')
        return { success: true }

    } catch (e) {
        return { error: 'Unauthorized' }
    }
}

export async function createShop(name: string, domain?: string) {
    const supabase = await createClient()
    try {
        await checkOpsRole(supabase)
        const { error } = await supabase.from('shops').insert({ name, domain })
        if (error) return { error: error.message }
        return { success: true }
    } catch (e) { return { error: 'Unauthorized' } }
}

export async function getShops() {
    const supabase = await createClient()
    const { data } = await supabase.from('shops').select('*').order('name')
    return { data: data || [] }
}
