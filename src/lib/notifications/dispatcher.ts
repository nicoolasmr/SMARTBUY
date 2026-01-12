export type AlertChannel = 'email' | 'push' | 'whatsapp'

export interface AlertPayload {
    title: string
    body: string
    data?: any
}

export async function sendAlert(channel: AlertChannel, payload: AlertPayload) {
    console.log(`[DISPATCHER] Sending ${channel} alert:`, payload)

    // In a real system, this would call specialized providers:
    // email -> Resend
    // push -> Firebase FCM
    // whatsapp -> Twilio / Meta API

    // Mock success
    return { success: true, timestamp: new Date() }
}
