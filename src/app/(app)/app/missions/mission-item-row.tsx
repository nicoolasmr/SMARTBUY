'use client'

import { toggleItem } from "@/lib/missions/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

interface MissionItemProps {
    item: any;
}

export function MissionItemRow({ item }: MissionItemProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = (checked: boolean) => {
        startTransition(async () => {
            await toggleItem(item.id, checked);
        });
    };

    return (
        <div className={cn(
            "flex items-center gap-4 p-4 border rounded-lg transition-opacity",
            item.is_completed && "opacity-60 bg-muted/20"
        )}>
            <Checkbox
                checked={item.is_completed}
                onCheckedChange={handleToggle}
                disabled={isPending}
            />
            <div className="flex-1">
                <p className={cn(
                    "font-medium",
                    item.is_completed && "line-through text-muted-foreground"
                )}>
                    {item.title}
                </p>
                {item.wishes && (
                    <p className="text-xs text-blue-600">
                        Linked Wish: {item.wishes.title}
                    </p>
                )}
            </div>
            <div className="font-semibold text-sm">
                R$ {item.estimated_price}
            </div>
        </div>
    );
}
