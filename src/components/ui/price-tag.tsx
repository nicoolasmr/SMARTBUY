import { cn } from "@/lib/utils";

interface PriceTagProps {
    price: number;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function PriceTag({ price, className, size = 'md' }: PriceTagProps) {
    const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(price);

    const sizeClasses = {
        sm: 'text-sm font-medium',
        md: 'text-base font-bold',
        lg: 'text-xl font-bold',
        xl: 'text-3xl font-extrabold',
    };

    return (
        <span className={cn("text-primary tracking-tight", sizeClasses[size], className)}>
            {formatted}
        </span>
    );
}
