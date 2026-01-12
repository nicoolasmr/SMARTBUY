import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function OnboardingWelcomePage() {
    return (
        <Card className="p-8 space-y-6 text-center">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao SmartBuy</h1>
                <p className="text-muted-foreground text-lg">
                    Para garantir as melhores recomendações, precisamos conhecer um pouco sobre você e sua casa.
                </p>
            </div>

            <div className="py-8">
                <div className="flex justify-center gap-4 text-sm text-left max-w-md mx-auto">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                            <span>Momento de Vida</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
                            <span>Definição de Orçamento</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
                            <span>Preferências e Restrições</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <Link href="/onboarding/momento">
                    <Button size="lg" className="w-full sm:w-auto px-12">
                        Começar
                    </Button>
                </Link>
            </div>
        </Card>
    );
}
