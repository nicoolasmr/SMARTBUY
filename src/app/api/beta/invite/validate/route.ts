import { NextRequest, NextResponse } from 'next/server'
import { isBetaMode, validateInvite } from "@/lib/beta/gate"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { code, email } = body

        // 1. Check Beta Mode
        const betaActive = await isBetaMode()
        if (!betaActive) {
            // If beta is off, any code is "valid" (ignored)
            return NextResponse.json({ valid: true, skipped: true })
        }

        if (!code) {
            return NextResponse.json({ valid: false, reason: 'MISSING_CODE' })
        }

        // 2. Validate
        const result = await validateInvite(code, email)

        return NextResponse.json(result)

    } catch (err: unknown) {
        console.error('Validation Error:', err)
        return NextResponse.json({ valid: false, reason: 'INTERNAL_ERROR' }, { status: 500 })
    }
}
