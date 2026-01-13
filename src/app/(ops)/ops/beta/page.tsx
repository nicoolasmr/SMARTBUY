import { generateInvites, getBetaStatus, getInvites, revokeInvite, toggleBetaPause } from "@/lib/ops/beta/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { revalidatePath } from "next/cache"
// import { notFound } from 'next/navigation'
// import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

type BetaInvite = {
    id: string
    code: string
    status: 'active' | 'revoked' | 'used'
    used_count: number
    max_uses: number
    notes?: string
    created_at: string
}

export default async function BetaOpsPage() {
    const status = await getBetaStatus()
    const invites = (await getInvites()) as unknown as BetaInvite[]

    async function handleGenerate(formData: FormData) {
        'use server'
        const count = parseInt(formData.get('count') as string || '1')
        const notes = formData.get('notes') as string
        await generateInvites(count, notes)
        revalidatePath('/ops/beta')
    }

    async function handleTogglePause(formData: FormData) {
        'use server'
        // [FIX] Read next state explicitly from hidden input
        const nextPausedRaw = formData.get('nextPaused')
        const nextPaused = nextPausedRaw === 'true'
        await toggleBetaPause(nextPaused)
        revalidatePath('/ops/beta')
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Beta Ops 🕹️</h1>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span>BETA_MODE</span>
                            <Badge variant={status.betaMode ? "default" : "secondary"}>
                                {status.betaMode ? 'ACTIVE' : 'OFF'}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>SIGNUPS PAUSED</span>
                            <Badge variant={status.isPaused ? "destructive" : "outline"}>
                                {status.isPaused ? 'PAUSED' : 'OPEN'}
                            </Badge>
                        </div>
                        <form action={handleTogglePause} className="mt-4">
                            {/* [FIX] Pass explicit next state to prevent stale closures */}
                            <input type="hidden" name="nextPaused" value={(!status.isPaused).toString()} />
                            <Button
                                variant={status.isPaused ? "outline" : "destructive"}
                                className="w-full"
                            >
                                {status.isPaused ? 'Resume Signups' : 'STOP Signups (Panic)'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Usage Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="text-4xl font-bold">
                            {status.activeHouseholds} <span className="text-xl text-muted-foreground">/ {status.cap}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">Active Households</p>
                        <div className="w-full bg-secondary h-2 mt-4 rounded-full overflow-hidden">
                            <div
                                className={`h - full ${status.activeHouseholds >= status.cap ? 'bg-red-500' : 'bg-green-500'} `}
                                style={{ width: `${Math.min(100, (status.activeHouseholds / status.cap) * 100)}% ` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Generate Invites</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={handleGenerate} className="space-y-4">
                            <div className="flex gap-4">
                                <input
                                    name="count"
                                    type="number"
                                    placeholder="Qty"
                                    defaultValue="1"
                                    className="border rounded p-2 w-20 bg-background"
                                    min="1" max="50"
                                />
                                <input
                                    name="notes"
                                    type="text"
                                    placeholder="Notes (e.g. Friends)"
                                    className="border rounded p-2 flex-1 bg-background"
                                />
                            </div>
                            <Button type="submit" className="w-full">Generate Codes</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Invites List */}
            <Card>
                <CardHeader>
                    <CardTitle>Invites ({invites.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="p-3">Code</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Uses</th>
                                    <th className="p-3">Notes</th>
                                    <th className="p-3">Created</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invites.map((invite) => (
                                    <tr key={invite.id} className="border-t hover:bg-muted/50">
                                        <td className="p-3 font-mono font-bold">{invite.code}</td>
                                        <td className="p-3">
                                            <Badge variant={invite.status === 'active' ? 'default' : 'secondary'}>
                                                {invite.status}
                                            </Badge>
                                        </td>
                                        <td className="p-3">{invite.used_count} / {invite.max_uses}</td>
                                        <td className="p-3 text-muted-foreground">{invite.notes || '-'}</td>
                                        <td className="p-3 text-muted-foreground">
                                            {new Date(invite.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-3">
                                            {invite.status === 'active' && (
                                                <form action={async () => {
                                                    'use server'
                                                    await revokeInvite(invite.id)
                                                    revalidatePath('/ops/beta')
                                                }}>
                                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                                        Revoke
                                                    </Button>
                                                </form>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
