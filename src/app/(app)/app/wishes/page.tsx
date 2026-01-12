import { getWishes } from "@/lib/app/actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function WishesPage() {
    const { data: wishes } = await getWishes();

    const empty = !wishes || wishes.length === 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Meus Desejos</h1>
                    <p className="text-muted-foreground">
                        O que você pretende comprar em breve?
                    </p>
                </div>
                <Link href="/app/wishes/new">
                    <Button>Novo Desejo</Button>
                </Link>
            </div>

            {empty ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center space-y-4 border-dashed">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-2xl">✨</div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-lg">Nenhum desejo ainda</h3>
                        <p className="text-muted-foreground text-sm max-w-sm">
                            Adicione itens que você quer comprar para que o SmartBuy comece a monitorar preços e oportunidades.
                        </p>
                    </div>
                    <Link href="/app/wishes/new">
                        <Button variant="outline">Criar Primeiro Desejo</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {wishes.map((wish: any) => (
                        <Link key={wish.id} href={`/app/wishes/${wish.id}`}>
                            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold truncate">{wish.title}</h3>
                                    <Badge variant={wish.urgency === 'high' ? 'destructive' : 'secondary'}>
                                        {wish.urgency}
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {wish.intent === 'buy_now' && '🛒 Comprar Agora'}
                                    {wish.intent === 'research' && '🔍 Pesquisando'}
                                    {wish.intent === 'track_price' && '📉 Monitorar Preço'}
                                </div>
                                <div className="text-sm">
                                    {(wish.min_price || wish.max_price) && (
                                        <span>
                                            {wish.min_price ? `Min: R$${wish.min_price}` : ''}
                                            {wish.min_price && wish.max_price && ' - '}
                                            {wish.max_price ? `Max: R$${wish.max_price}` : ''}
                                        </span>
                                    )}
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
