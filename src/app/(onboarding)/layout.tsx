// import { ArrowLeft } from 'lucide-react'
// import Link from "next/link";
// import { Button } from "@/components/ui/button";

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-muted/20 flex flex-col">
            <header className="h-16 border-b bg-background flex items-center justify-between px-6">
                <div className="font-bold text-lg text-primary">SmartBuy</div>
                <div className="text-sm text-muted-foreground">Configuração Inicial</div>
            </header>
            <main className="flex-1 container max-w-2xl py-12">
                {children}
            </main>
        </div>
    );
}
