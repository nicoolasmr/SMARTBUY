import { listProducts, searchProducts } from "@/lib/catalog/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import Link from "next/link";

export default async function OpsCatalogPage({ searchParams }: { searchParams: { q?: string } }) {
    const query = searchParams?.q
    interface OpsProduct {
        id: string
        name: string
        ean_normalized: string
        brand?: string
        category?: string
    }

    const { data: productsData } = query
        ? await searchProducts(query)
        : await listProducts();

    const products = (productsData || []) as unknown as OpsProduct[]

    return (
        <div className="space-y-6">

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Catálogo Global</h1>
                    <Button>Adicionar Produto</Button>
                </div>

                <div className="flex items-center gap-2 max-w-sm">
                    <form className="flex w-full gap-2">
                        <Input name="q" placeholder="Buscar por nome ou EAN..." defaultValue={query} />
                        <Button type="submit" variant="secondary">Buscar</Button>
                    </form>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead>EAN</TableHead>
                                <TableHead>Marca</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products?.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.ean_normalized}</TableCell>
                                    <TableCell>{product.brand}</TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Editar</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!products?.length && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Nenhum produto encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
