'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(2).optional(),
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
    })

    if (!validatedFields.success) {
        return { error: 'Dados inválidos. Verifique os campos.' }
    }

    const { email, password, fullName } = validatedFields.data

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                avatar_url: '', // Can be added later
            },
        },
    })

    if (error) {
        return { error: error.message }
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

    revalidatePath('/app', 'layout')
    redirect('/app')
}
