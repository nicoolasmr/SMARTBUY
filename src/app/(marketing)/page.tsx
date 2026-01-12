import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function MarketingPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        SmartBuy
                    </div>
                    <nav className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost">Entrar</Button>
                        </Link>
                        <Link href="/signup">
                            <Button>Começar Agora</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
                    <div className="flex max-w-[980px] flex-col items-start gap-4">
                        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
                            Compras inteligentes <br className="hidden sm:inline" />
                            para quem valoriza tempo e qualidade.
                        </h1>
                        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
                            Não somos um marketplace. Somos seu assistente pessoal de compras que decide o melhor para você com base em dados rigorosos.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/signup">
                            <Button size="lg" className="text-lg px-8">
                                Quero conhecer
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline" className="text-lg px-8">
                            Saiba mais
                        </Button>
                    </div>
                </section>

                <section className="container grid gap-8 py-12 md:py-24 lg:grid-cols-3">
                    <Card className="p-6 flex flex-col gap-4">
                        <div className="h-10 w-10 text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold">Curadoria Rigorosa</h3>
                        <p className="text-muted-foreground">
                            Apenas produtos que atendem aos nossos guardrails de qualidade e preço são sugeridos.
                        </p>
                    </Card>
                    <Card className="p-6 flex flex-col gap-4">
                        <div className="h-10 w-10 text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                        </div>
                        <h3 className="text-xl font-bold">Decisões Inteligentes</h3>
                        <p className="text-muted-foreground">
                            Nossa IA analisa seu perfil e histórico para restringir opções irrelevantes.
                        </p>
                    </Card>
                    <Card className="p-6 flex flex-col gap-4">
                        <div className="h-10 w-10 text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        </div>
                        <h3 className="text-xl font-bold">Confiança Total</h3>
                        <p className="text-muted-foreground">
                            Transparência em cada sugestão. Sem anúncios disfarçados de recomendações.
                        </p>
                    </Card>
                </section>
            </main>
        </div>
    );
}
