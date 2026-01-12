import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StoreBadgeProps {
    name: string;
    reputation?: number;
    className?: string;
}

export function StoreBadge({ name, reputation, className }: StoreBadgeProps) {
    // Determine color based on reputation (mock logic)
    // 0-4: Destructive, 4-7: Warning, 7-10: Success
    // For now simplistic

    return (
        <Badge variant="outline" className={cn("gap-1", className)}>
            <span className="font-semibold">{name}</span>
            {reputation !== undefined && reputation > 0 && (
                <span className="text-xs text-muted-foreground ml-1">
                    ★ {reputation.toFixed(1)}
                </span>
            )}
        </Badge>
    );
}
