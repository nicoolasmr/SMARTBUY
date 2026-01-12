import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertTriangle, ShieldCheck, Info } from "lucide-react"

type RiskBucket = 'A' | 'B' | 'C'

interface RiskBadgeProps {
    bucket: RiskBucket
    reasons?: string[]
}

export function RiskBadge({ bucket, reasons = [] }: RiskBadgeProps) {
    let color = "bg-gray-100 text-gray-800"
    let icon = <Info className="w-3 h-3 mr-1" />
    let label = "Desconhecido"

    if (bucket === 'A') {
        color = "bg-green-100 text-green-800 border-green-200"
        icon = <ShieldCheck className="w-3 h-3 mr-1" />
        label = "Oferta Segura"
    } else if (bucket === 'B') {
        color = "bg-yellow-100 text-yellow-800 border-yellow-200"
        icon = <AlertTriangle className="w-3 h-3 mr-1" />
        label = "Atenção"
    } else if (bucket === 'C') {
        color = "bg-red-100 text-red-800 border-red-200"
        icon = <AlertTriangle className="w-3 h-3 mr-1" />
        label = "Alto Risco"
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant="outline" className={`${color} flex items-center cursor-help`}>
                        {icon}
                        {label}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">Análise Anti-Cilada:</p>
                    {reasons.length > 0 ? (
                        <ul className="list-disc pl-4 text-xs space-y-1">
                            {reasons.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-muted-foreground">Nenhum sinal de risco detectado.</p>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
