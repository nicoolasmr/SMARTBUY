import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: Request) {
    const supabase = createSupabaseAdmin()

    // 1. Seed Shops
    const shops = [
        { name: 'Amazon', logo_url: 'https://logo.clearbit.com/amazon.com.br', reputation_score: 9.8, url: 'amazon.com.br' },
        { name: 'Mercado Livre', logo_url: 'https://logo.clearbit.com/mercadolivre.com.br', reputation_score: 9.5, url: 'mercadolivre.com.br' },
        { name: 'Magalu', logo_url: 'https://logo.clearbit.com/magazineluiza.com.br', reputation_score: 9.0, url: 'magazineluiza.com.br' }
    ]

    const { data: createdShops, error: shopError } = await supabase
        .from('shops')
        .upsert(shops, { onConflict: 'name' })
        .select()

    if (shopError) return NextResponse.json({ error: shopError }, { status: 500 })

    // 2. Seed Products
    // We use a small subset covering Categories for Profile Matching
    const products = [
        {
            name: 'Apple iPhone 15 128GB',
            brand: 'Apple',
            ean_normalized: '194253000001',
            category: 'Eletrônicos',
            attributes: { description: 'Smartphone Apple with A16 Bionic' }
        },
        {
            name: 'Fralda Pampers Premium Care M',
            brand: 'Pampers',
            ean_normalized: '750043500001',
            category: 'Bebê',
            attributes: { size: 'M', count: 80 }
        },
        {
            name: 'Air Fryer Mondial 4L',
            brand: 'Mondial',
            ean_normalized: '789988200001',
            category: 'Cozinha',
            attributes: { voltage: '110V', color: 'Black' }
        },
        {
            name: 'Kindle 11a Geração',
            brand: 'Amazon',
            ean_normalized: '840080500001',
            category: 'Eletrônicos', // Matches Tech
            attributes: { storage: '16GB' }
        },
        {
            name: 'Whey Protein Gold Standard',
            brand: 'Optimum Nutrition',
            ean_normalized: '748927000001',
            category: 'Suplementos', // Matches Fitness
            attributes: { flavor: 'Vanilla' }
        }
    ]

    const { data: createdProducts, error: prodError } = await supabase
        .from('products')
        .upsert(products, { onConflict: 'ean_normalized' })
        .select()

    if (prodError || !createdProducts) return NextResponse.json({ error: prodError }, { status: 500 })

    // 3. Create Offers
    const offers = []
    const shopAmazon = createdShops!.find(s => s.name === 'Amazon')!
    const shopML = createdShops!.find(s => s.name === 'Mercado Livre')!

    // iPhone Offer
    const pIphone = createdProducts.find(p => p.category === 'Eletrônicos')!
    offers.push({
        product_id: pIphone.id,
        shop_id: shopAmazon.id,
        price: 4899.00,
        url: 'https://amazon.com.br/iphone',
        is_available: true
    })

    // Fralda Offer
    const pFralda = createdProducts.find(p => p.category === 'Bebê')!
    offers.push({
        product_id: pFralda.id,
        shop_id: shopML.id,
        price: 89.90,
        url: 'https://ml.com.br/fralda',
        is_available: true
    })

    // AirFryer Offer
    const pAir = createdProducts.find(p => p.category === 'Cozinha')!
    offers.push({
        product_id: pAir.id,
        shop_id: shopML.id,
        price: 349.90,
        url: 'https://ml.com.br/airfryer',
        is_available: true
    })

    const { error: offerError } = await supabase.from('offers').insert(offers)

    if (offerError) return NextResponse.json({ error: offerError }, { status: 500 })

    return NextResponse.json({ success: true, count: products.length })
}
