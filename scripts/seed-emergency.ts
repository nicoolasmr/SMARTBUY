
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env-local
dotenv.config({ path: path.resolve(process.cwd(), '.env-local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function seed() {
    console.log('🌱 Starting Emergency Seed...')

    // 1. Seed Shops
    // Schema: id, name, domain, reputation_score, is_active
    const shops = [
        { name: 'Amazon', reputation_score: 9.8, domain: 'amazon.com.br' },
        { name: 'Mercado Livre', reputation_score: 9.5, domain: 'mercadolivre.com.br' },
        { name: 'Magalu', reputation_score: 9.0, domain: 'magazineluiza.com.br' }
    ]

    console.log('🏪 Seeding Shops...')
    const { data: createdShops, error: shopError } = await supabase
        .from('shops')
        .upsert(shops, { onConflict: 'name' })
        .select()

    if (shopError) {
        console.error('❌ Shop Error:', shopError)
        return
    }
    console.log(`✅ Shops created: ${createdShops?.length}`)

    // 2. Seed Products
    // Schema: id, name, brand, ean_normalized, category, attributes
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
            category: 'Eletrônicos',
            attributes: { storage: '16GB' }
        },
        {
            name: 'Whey Protein Gold Standard',
            brand: 'Optimum Nutrition',
            ean_normalized: '748927000001',
            category: 'Suplementos',
            attributes: { flavor: 'Vanilla' }
        },
        {
            name: 'MacBook Air M2',
            brand: 'Apple',
            ean_normalized: '194253000999',
            category: 'Home Office',
            attributes: { ram: '8GB', ssd: '256GB' }
        }
    ]

    console.log('📦 Seeding Products...')
    const { data: createdProducts, error: prodError } = await supabase
        .from('products')
        .upsert(products, { onConflict: 'ean_normalized' })
        .select()

    if (prodError) {
        console.error('❌ Product Error:', prodError)
        return
    }
    console.log(`✅ Products created: ${createdProducts?.length}`)

    // 3. Create Offers
    if (!createdProducts || !createdShops) return;

    const offers: any[] = []
    const shopAmazon = createdShops.find(s => s.name === 'Amazon')!
    const shopML = createdShops.find(s => s.name === 'Mercado Livre')!

    // iPhone (Amazon)
    const pIphone = createdProducts.find(p => p.name.includes('iPhone'))
    if (pIphone) offers.push({
        product_id: pIphone.id,
        shop_id: shopAmazon.id,
        price: 4899.00,
        url: 'https://amazon.com.br/iphone',
        is_available: true
    })

    // Fralda (ML)
    const pFralda = createdProducts.find(p => p.name.includes('Fralda'))
    if (pFralda) offers.push({
        product_id: pFralda.id,
        shop_id: shopML.id,
        price: 89.90,
        url: 'https://ml.com.br/fralda',
        is_available: true
    })

    // AirFryer (ML)
    const pAir = createdProducts.find(p => p.name.includes('Fryer'))
    if (pAir) offers.push({
        product_id: pAir.id,
        shop_id: shopML.id,
        price: 349.90,
        url: 'https://ml.com.br/airfryer',
        is_available: true
    })

    // MacBook (Amazon)
    const pMac = createdProducts.find(p => p.name.includes('MacBook'))
    if (pMac) offers.push({
        product_id: pMac.id,
        shop_id: shopAmazon.id,
        price: 7299.00,
        url: 'https://amazon.com.br/macbook',
        is_available: true
    })

    console.log('🏷️ Seeding Offers...')
    const { error: offerError } = await supabase.from('offers').insert(offers)

    if (offerError) {
        console.error('❌ Offer Error:', offerError)
    } else {
        console.log(`✅ Offers created: ${offers.length}`)
    }

    console.log('🎉 Seed Complete!')
}

seed().catch(console.error)
