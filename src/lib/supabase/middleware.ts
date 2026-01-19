import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    try {
        // Create an unmodified response
        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        })

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
            // If envs are missing (e.g. during build or misconfig), pass through to let the app handle/fail gracefully
            return response
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        // This will refresh session if expired - required for Server Components
        // https://supabase.com/docs/guides/auth/server-side/nextjs
        const {
            data: { user },
        } = await supabase.auth.getUser()

        // 1. Guard protected routes (Auth check)
        const isApp = request.nextUrl.pathname.startsWith('/app')
        const isOps = request.nextUrl.pathname.startsWith('/ops')
        const isAuth = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup'
        const isOnboarding = request.nextUrl.pathname.startsWith('/onboarding')

        if ((isApp || isOps) && !user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // 2. Onboarding Gate (Profile Status check)
        // Only run DB fetch if we have a user and are hitting a relevant route to save performance
        if (user && (isApp || isOps || isOnboarding || isAuth)) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('onboarding_status')
                .eq('id', user.id)
                .single()

            const isCompleted = profile?.onboarding_status === 'completed'

            // If onboarding is NOT completed
            if (!isCompleted) {
                // If trying to access app/ops, send to welcome
                if (!isOnboarding && (isApp || isOps)) {
                    return NextResponse.redirect(new URL('/onboarding/welcome', request.url))
                }
            }

            // If onboarding IS completed
            if (isCompleted) {
                // If trying to access onboarding, redirect to app
                if (isOnboarding) {
                    return NextResponse.redirect(new URL('/app', request.url))
                }
            }
        }

        // 3. Auth pages redirect to app if logged in
        if (isAuth && user) {
            return NextResponse.redirect(new URL('/app', request.url))
        }

        return response
    } catch (e) {
        // If middleware fails, log and pass through to avoid breaking the app entirely
        console.error('Middleware Error:', e)
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        })
    }
}
