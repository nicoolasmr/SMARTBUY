'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// --- Schemas ---

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

// --- Helpers ---

async function logOpsAction(supabase: any, userId: string, action: string, entityType: string, entityId: string, payload: any) {
    try {
        await supabase.from('ops_audit_logs').insert({
            ops_user_id: userId,
            action_type: action,
            entity_type: entityType,
            entity_id: entityId,
            payload
        })
    } catch (e) {
        console.error('Failed to log ops action', e)
        // Non-blocking error for log failure? Debateable. Ideally we want it to fail if log fails for Strict Audit.
        // For Beta, we log error.
    }
}

export async function checkOpsRole(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    return user
}

// --- Actions ---

export async function upsertProduct(formData: FormData) {
    const supabase = await createClient()
    try {
        const user = await checkOpsRole(supabase)

        const raw = {
            id: formData.get('id') || undefined,
            name: formData.get('name'),
            brand: formData.get('brand'),
            ean_normalized: formData.get('ean_normalized'),
            category: formData.get('category'),
            // attributes hard to pass via FormData without parsing JSON string
        }

        const validated = upsertProductSchema.safeParse(raw)

        if (!validated.success) {
            return { error: 'Validation failed', issues: validated.error.flatten() }
        }

        const { data, error } = await supabase
            .from('products')
            .upsert({ ...validated.data, updated_at: new Date().toISOString() })
            .select()
            .single()

        if (error) return { error: error.message }

        // LOGGING
        await logOpsAction(supabase, user.id, 'UPSERT_PRODUCT', 'product', data.id, validated.data)

        revalidatePath('/ops/catalog')
        return { data }

    } catch (e) {
        return { error: 'Unauthorized or Error' }
    }
}

export async function upsertOffer(formData: FormData) {
    const supabase = await createClient()
    try {
        const user = await checkOpsRole(supabase)

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

        const { data: offer, error } = await supabase
            .from('offers')
            .upsert({ ...validated.data, updated_at: new Date().toISOString() })
            .select()
            .single()

        if (error) return { error: error.message }

        // Also Create History Entry!
        await supabase.from('offer_price_history').insert({
            offer_id: offer.id,
            price: offer.price,
            freight: offer.freight
        })

        // LOGGING
        await logOpsAction(supabase, user.id, 'UPSERT_OFFER', 'offer', offer.id, validated.data)

        revalidatePath('/ops/offers')
        return { success: true }

    } catch (e) {
        return { error: 'Unauthorized' }
    }
}

export async function createShop(name: string, domain?: string) {
    const supabase = await createClient()
    try {
        const user = await checkOpsRole(supabase)
        const { data, error } = await supabase.from('shops').insert({ name, domain }).select().single()
        if (error) return { error: error.message }

        await logOpsAction(supabase, user.id, 'CREATE_SHOP', 'shop', data.id, { name, domain })

        return { success: true }
    } catch (e) { return { error: 'Unauthorized' } }
}

export async function getShops() {
    const supabase = await createClient()
    const { data } = await supabase.from('shops').select('*').order('name')
    return { data: data || [] }
}
