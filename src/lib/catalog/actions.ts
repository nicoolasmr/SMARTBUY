'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// --- Schemas ---

const productSchema = z.object({
    name: z.string().min(1),
    brand: z.string().optional(),
    ean_normalized: z.string().min(8),
    category: z.string().optional(),
    attributes: z.record(z.string(), z.any()).optional(),
})

// --- Actions ---

export async function getProduct(id: string) {
    const supabase = await createClient()

    // Everyone can read products
    const { data: product, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

    if (prodError) return { error: prodError.message }

    // Fetch best offers (e.g., active ones)
    const { data: offers, error: offerError } = await supabase
        .from('offers')
        .select(`
        *,
        shops ( name, domain, reputation_score )
    `)
        .eq('product_id', id)
        .eq('is_available', true)
        .order('price', { ascending: true })

    if (offerError) console.error('Error fetching offers', offerError)

    return { data: { product, offers: offers || [] } }
}

export async function searchProducts(query: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,ean_normalized.ilike.%${query}%`)
        .limit(20)

    if (error) return { error: error.message }
    return { data }
}

export async function listProducts(limit = 20, offset = 0) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { data }
}
