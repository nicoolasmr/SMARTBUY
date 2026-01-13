import { NextRequest, NextResponse } from 'next/server'
import { runAlertEvaluatorJob } from "@/lib/jobs/price-tracker"

// [OPS] Internal Job Route
// Protected by CRON_SECRET for Vercel Cron invocation

export const dynamic = 'force-dynamic' // No caching

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('x-cron-secret')
    const cronSecret = process.env.CRON_SECRET

    // 1. Strict Auth Check
    if (!cronSecret) {
        console.error('[OPS] FATAL: CRON_SECRET is not set.')
        return NextResponse.json({ error: 'Internal Configuration Error' }, { status: 500 })
    }

    if (authHeader !== cronSecret) {
        console.warn('[OPS] Unauthorized attempt to access Alert Evaluator Job.')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Execute Job
    try {
        const result = await runAlertEvaluatorJob()
        return NextResponse.json({
            success: true,
            status: result.status || 'completed',
            processed: result.alertsProcessed,
            events: result.eventsTriggered
        })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown Job Error'
        console.error('[OPS] Job Execution Failed:', err)
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
