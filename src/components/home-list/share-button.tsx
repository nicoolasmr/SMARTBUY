'use client'

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"

export function WhatsAppShareButton({ text }: { text: string }) {
    const handleShare = () => {
        // Encode text for WhatsApp URL
        const encoded = encodeURIComponent(text)
        const url = `https://wa.me/?text=${encoded}`
        window.open(url, '_blank')
    }

    if (!text) return null

    return (
        <Button onClick={handleShare} className="w-full bg-green-600 hover:bg-green-700 text-white">
            <Share2 className="w-4 h-4 mr-2" />
            Enviar Resumo no WhatsApp
        </Button>
    )
}
