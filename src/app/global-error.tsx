'use client'

import { Inter } from "next/font/google";
import "./globals.css";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4 text-center">
                    <h2 className="text-2xl font-bold">Erro Crítico (Global)</h2>
                    <p className="text-muted-foreground">Algo deu muito errado no carregamento da aplicação.</p>
                    <p className="text-muted-foreground p-4 bg-muted rounded-md font-mono text-xs text-left max-w-lg overflow-auto">
                        {error.message}
                        {error.digest && <br />}
                        {error.digest && <span className="text-xs text-gray-500">Digest: {error.digest}</span>}
                    </p>
                    <Button onClick={() => reset()}>Tentar novamente</Button>
                </div>
            </body>
        </html>
    )
}
