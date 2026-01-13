'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveHouseholdId } from '@/lib/app/actions'
import { redirect } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

export async function trackClick(offerId: string, targetUrl: string) {
    const supabase = await createClient()
    const householdId = await getActiveHouseholdId(supabase)
    if (!householdId) {
        // If not logged in, just redirect but don't track attribution link for purchase?
        redirect(targetUrl)
        return
    }

    const token = uuidv4()

    // 1. Create Link
    const { data, error } = await supabase
        .from('attribution_links')
        .insert({
            offer_id: offerId,
            household_id: householdId,
            token: token
        })
        .select('id')
        .single()

    if (error) {
        // console.error(...)
    }

    // 2. Log Click (Async-ish?)
    if (data?.id) {
        await supabase.from('click_events').insert({
            attribution_link_id: data.id,
            user_agent: 'server-action' // Ideally we get headers() but keep simple
        })
    }

    // 3. Redirect
    redirect(targetUrl)
}

export async function getRecentClicks() {
    const supabase = await createClient()
    const householdId = await getActiveHouseholdId(supabase)

    // Just simple retrieval for Purchase Form
    const { data } = await supabase
        .from('attribution_links')
        .select('*, offers(products(name), shops(name), price)')
        .eq('household_id', householdId!)
        .order('created_at', { ascending: false })
        .limit(10)

    return { data: data || [] }
}
