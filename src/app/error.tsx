'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4 text-center">
            <h2 className="text-2xl font-bold">Algo deu errado!</h2>
            <p className="text-muted-foreground p-4 bg-muted rounded-md font-mono text-xs text-left max-w-lg overflow-auto">
                {error.message || 'Erro desconhecido'}
                {error.digest && <br />}
                {error.digest && <span className="text-xs text-gray-500">Digest: {error.digest}</span>}
            </p>
            <Button onClick={() => reset()}>Tentar novamente</Button>
        </div>
    )
}
