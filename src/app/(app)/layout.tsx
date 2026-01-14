import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Sidebar Stub */}
            <aside className="w-full border-b bg-muted/40 md:w-64 md:border-r md:min-h-screen">
                <div className="flex h-16 items-center border-b px-6 font-bold text-lg text-primary">
                    SmartBuy
                </div>
                <nav className="flex flex-col gap-2 p-4">
                    <div className="pb-2">
                        <Link href="/app">
                            <Button variant="ghost" className="w-full justify-start">
                                Feed Inteligente
                            </Button>
                        </Link>
                        <Link href="/app/missions">
                            <Button variant="ghost" className="w-full justify-start">
                                Missões
                            </Button>
                        </Link>
                        <Link href="/app/home-list">
                            <Button variant="ghost" className="w-full justify-start">
                                Lista de Casa
                            </Button>
                        </Link>
                    </div>

                    <div className="pb-2 border-t pt-2">
                        <Link href="/app/wishes">
                            <Button variant="ghost" className="w-full justify-start">
                                Meus Desejos
                            </Button>
                        </Link>
                        <Link href="/app/alerts">
                            <Button variant="ghost" className="w-full justify-start">
                                Alertas
                            </Button>
                        </Link>
                        <Link href="/app/purchases">
                            <Button variant="ghost" className="w-full justify-start">
                                Minhas Compras
                            </Button>
                        </Link>
                    </div>

                    <div className="pb-2 border-t pt-2">
                        <Link href="/app/profile">
                            <Button variant="ghost" className="w-full justify-start">
                                Meu Perfil
                            </Button>
                        </Link>
                        <Link href="/app/settings">
                            <Button variant="ghost" className="w-full justify-start">
                                Configurações
                            </Button>
                        </Link>
                    </div>

                    <div className="pt-4 mt-auto">
                        <Link href="/ops">
                            <Button variant="outline" className="w-full justify-start text-muted-foreground">
                                Ops Console
                            </Button>
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-8">
                {children}
            </main>
        </div>
    );
}
