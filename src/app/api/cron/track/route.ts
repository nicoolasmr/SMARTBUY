import { NextResponse } from 'next/server';
import { runPriceTrackingJob, runAlertEvaluatorJob } from '@/lib/jobs/price-tracker';

// Secure this with a secret in real prod
export async function GET() {
    try {
        const trackingResult = await runPriceTrackingJob()
        const alertResult = await runAlertEvaluatorJob()

        return NextResponse.json({
            success: true,
            tracking: trackingResult,
            alerts: alertResult
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
