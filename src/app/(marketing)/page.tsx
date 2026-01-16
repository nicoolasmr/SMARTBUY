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
                {/* 1. HERO SECTION */}
                <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
                    <div className="flex max-w-[980px] flex-col items-start gap-4">
                        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
                            Compras inteligentes <br className="hidden sm:inline" />
                            para quem valoriza tempo e qualidade.
                        </h1>
                        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
                            Não somos um marketplace. Somos um assistente pessoal de compras que filtra, compara e recomenda apenas o que realmente faz sentido para você, com base em dados rigorosos.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/signup">
                            <Button size="lg" className="text-lg px-8">
                                Solicitar acesso
                            </Button>
                        </Link>
                        <Link href="#how-it-works">
                            <Button size="lg" variant="outline" className="text-lg px-8">
                                Entender como funciona
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* 2. O PROBLEMA INVISÍVEL */}
                <section className="container py-12 md:py-16 bg-muted/20">
                    <div className="max-w-[800px] mx-auto text-center space-y-4">
                        <h2 className="text-2xl font-bold tracking-tight">Muitas opções não significam boas decisões.</h2>
                        <p className="text-lg text-muted-foreground">
                            Passar horas comparando preços, ler reviews conflitantes e duvidar se uma recomendação é, na verdade, um anúncio camuflado. O cansaço da escolha é real — e caro.
                        </p>
                    </div>
                </section>

                {/* 3. O QUE É O SMARTBUY */}
                <section className="container py-12 md:py-16">
                    <div className="grid gap-8 md:grid-cols-2 items-center">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight">Um filtro de ruído para suas compras.</h2>
                            <p className="text-muted-foreground text-lg">
                                O SmartBuy analisa produtos, preços e contexto para reduzir escolhas ruins — e não para mostrar tudo o que existe.
                            </p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">✓</span> Não vendemos produtos.
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">✓</span> Não recebemos para promover marcas.
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">✓</span> A decisão final é sempre técnica e imparcial.
                                </li>
                            </ul>
                        </div>
                        <div className="p-8 bg-muted rounded-xl flex items-center justify-center text-muted-foreground text-sm font-mono border border-dashed">
                            [Interface do Assistente: &quot;Analisando 45 opções... Filtrando 3 melhores escolhas para seu perfil.&quot;]
                        </div>
                    </div>
                </section>

                {/* 4. COMO FUNCIONA */}
                <section id="how-it-works" className="container py-12 md:py-24 bg-muted/40">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight">Como funciona na prática</h2>
                    </div>
                    <div className="grid gap-8 md:grid-cols-4 text-center">
                        <div className="space-y-2">
                            <div className="text-4xl font-bold text-primary/20">01</div>
                            <h3 className="font-bold text-lg">Defina seu Contexto</h3>
                            <p className="text-muted-foreground text-sm">Você nos diz seu perfil, momento de vida e prioridades.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl font-bold text-primary/20">02</div>
                            <h3 className="font-bold text-lg">Filtragem Inteligente</h3>
                            <p className="text-muted-foreground text-sm">Nossa IA remove automaticamente o que não faz sentido para você.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl font-bold text-primary/20">03</div>
                            <h3 className="font-bold text-lg">Avaliação de Risco</h3>
                            <p className="text-muted-foreground text-sm">Checamos histórico de preços, lojas e confiabilidade.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl font-bold text-primary/20">04</div>
                            <h3 className="font-bold text-lg">Recomendação Segura</h3>
                            <p className="text-muted-foreground text-sm">Entregamos apenas as melhores opções justificadas.</p>
                        </div>
                    </div>
                </section>

                {/* 5. BENEFÍCIOS (PILARES) */}
                <section className="container grid gap-8 py-12 md:py-24 lg:grid-cols-3">
                    <Card className="p-6 flex flex-col gap-4">
                        <div className="h-10 w-10 text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold">Curadoria Rigorosa</h3>
                        <p className="text-muted-foreground">
                            Menos é mais. Excluímos ativamente o excesso para que você foque apenas em opções que atendem critérios de qualidade reais.
                        </p>
                    </Card>
                    <Card className="p-6 flex flex-col gap-4">
                        <div className="h-10 w-10 text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                        </div>
                        <h3 className="text-xl font-bold">Decisão Inteligente</h3>
                        <p className="text-muted-foreground">
                            Não olhamos apenas o preço hoje. Analisamos o contexto do seu orçamento e histórico para saber se a compra vale a pena agora.
                        </p>
                    </Card>
                    <Card className="p-6 flex flex-col gap-4">
                        <div className="h-10 w-10 text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        </div>
                        <h3 className="text-xl font-bold">Confiança Total</h3>
                        <p className="text-muted-foreground">
                            Sem anúncios disfarçados. Sem empurrar produtos parceiros. Se recomendamos, é porque os dados mostram que é bom.
                        </p>
                    </Card>
                </section>

                {/* 6. PARA QUEM É */}
                <section className="container py-12 md:py-16 border-t md:border-none">
                    <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                        <div className="space-y-4 p-6 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <span className="text-green-600 font-extrabold">✓</span> É para você se:
                            </h3>
                            <ul className="space-y-2 text-sm text-foreground/80">
                                <li>• Quer decidir melhor e mais rápido.</li>
                                <li>• Valoriza mais o seu tempo que cupons aleatórios.</li>
                                <li>• Prefere clareza técnica a volume de ofertas.</li>
                            </ul>
                        </div>
                        <div className="space-y-4 p-6 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <span className="text-red-500 font-extrabold">✕</span> Não é para você se:
                            </h3>
                            <ul className="space-y-2 text-sm text-foreground/80">
                                <li>• Quer ver todas as opções do mundo.</li>
                                <li>• Busca apenas a &quot;promoção do dia&quot; sem contexto.</li>
                                <li>• Gosta de passar horas comparando fichas técnicas.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 7. TRANSPARÊNCIA */}
                <section className="container py-12 text-center max-w-[700px] mx-auto">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Compromisso de Transparência</h3>
                    <p className="text-foreground/80">
                        O SmartBuy é sustentado por assinaturas e afiliados transparentes, mas nossa tecnologia de recomendação é blindada.
                        Nenhuma marca pode pagar para aparecer melhor rankeada para você. A prioridade é a sua satisfação, não a margem do varejista.
                    </p>
                </section>

                {/* 8. CTA FINAL */}
                <section className="container py-24 text-center">
                    <div className="max-w-[600px] mx-auto space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">Decida melhor. Compre melhor.</h2>
                        <p className="text-lg text-muted-foreground">
                            Comece a usar o assistente que respeita seu dinheiro e seu tempo.
                        </p>
                        <Link href="/signup">
                            <Button size="lg" className="w-full sm:w-auto px-12 text-lg h-12">
                                Criar minha conta
                            </Button>
                        </Link>
                        <p className="text-xs text-muted-foreground">
                            Acesso simples. Sem compromisso agressivo.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
