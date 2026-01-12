'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

import { checkBetaCap, claimInvite, isBetaMode, validateInvite } from '@/lib/beta/gate'
import { track } from '@/lib/analytics/track'

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(2).optional(),
    inviteCode: z.string().optional(), // New field
})

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/app')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const validatedFields = schema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        fullName: formData.get('fullName'),
        inviteCode: formData.get('inviteCode'),
    })

    if (!validatedFields.success) {
        return { error: 'Dados inválidos. Verifique os campos.' }
    }

    const { email, password, fullName, inviteCode } = validatedFields.data

    // [BETA GATE]
    const betaActive = await isBetaMode()
    if (betaActive) {
        // 1. Invite Required
        if (!inviteCode) {
            return { error: 'Beta Fechado: Código de convite obrigatório.' }
        }

        const inviteStatus = await validateInvite(inviteCode, email)
        if (!inviteStatus.valid) {
            return { error: `Código inválido ou expirado. (${inviteStatus.reason})` }
        }

        // 2. Hard Cap
        const canEnter = await checkBetaCap()
        if (!canEnter) {
            return { error: 'O Beta atingiu o limite de 100 famílias. Tente novamente mais tarde.' }
        }
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                avatar_url: '',
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    // [BETA CLAIM]
    if (betaActive && data.user && inviteCode) {
        // Best effort claim. If it fails, we log but don't block auth (user created).
        // ideally we would rollback, but for Beta MVP this is acceptable. Ops can fix manually.
        await claimInvite(inviteCode, data.user.id)
    }

    revalidatePath('/', 'layout')
    redirect('/onboarding/welcome')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function finishOnboarding() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Usuário não autenticado' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            onboarding_status: 'completed',
            onboarding_completed_at: new Date().toISOString()
            // In a real app, we would save the JSONB data here too
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    // [ANALYTICS]
    await track('onboarding_completed', { userId: user.id })

    revalidatePath('/app', 'layout')
    redirect('/app')
}
