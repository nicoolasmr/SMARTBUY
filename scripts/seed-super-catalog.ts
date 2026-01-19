
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env-local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
})

// --- Types ---
type ProductSeed = {
    slug: string
    name: string
    category: string
    sub_category: string
    brand: string
    description: string
    ideal_for: string
    not_for: string
    price: number
    shop_name: string
    specs?: Record<string, string | number>
    images_desc: string[]
    risk: { score: number; bucket: 'A' | 'B' | 'C'; reasons: string[] }
    history: { avg: number; min: number; max: number; trend: 'stable' | 'up' | 'down' }
}

// --- Data ---
const PRODUCTS: ProductSeed[] = [
    // 1. TECNOLOGIA (10 Items)
    {
        slug: 'sony-wh1000xm5',
        name: 'Fone Sony WH-1000XM5 Noise Cancelling',
        category: 'Tecnologia',
        sub_category: 'Áudio',
        brand: 'Sony',
        description: 'O melhor cancelamento de ruído do mercado. Bateria de 30h e conforto para viagens longas.',
        ideal_for: 'Trabalho focado, viajantes frequentes, audiófilos.',
        not_for: 'Esportes intensos (não é à prova de suor).',
        price: 2499.00,
        shop_name: 'Amazon',
        images_desc: ['Sony WH-1000XM5 Preto', 'Case de transporte', 'Homem usando no avião'],
        risk: { score: 95, bucket: 'A', reasons: ['Vendedor Oficial', 'Preço na média histórica'] },
        history: { avg: 2400, min: 2100, max: 2800, trend: 'stable' }
    },
    {
        slug: 'kindle-paperwhite-16gb',
        name: 'Kindle Paperwhite 16GB Tela 6.8"',
        category: 'Tecnologia',
        sub_category: 'Leitores',
        brand: 'Amazon',
        description: 'À prova d\'água com luz quente ajustável. A bateria dura até 10 semanas.',
        ideal_for: 'Leitura noturna, levar para piscina/praia.',
        not_for: 'Ler PDFs técnicos complexos (tela pequena).',
        price: 799.00,
        shop_name: 'Amazon',
        images_desc: ['Kindle Frente', 'Kindle Modo Noturno', 'Kindle na Água'],
        risk: { score: 98, bucket: 'A', reasons: ['Produto Próprio Amazon'] },
        history: { avg: 799, min: 749, max: 899, trend: 'stable' }
    },
    {
        slug: 'logitech-mx-master-3s',
        name: 'Mouse Logitech MX Master 3S',
        category: 'Home Office',
        sub_category: 'Periféricos',
        brand: 'Logitech',
        description: 'Mouse ergonômico com clique silencioso e scroll magnético infinito.',
        ideal_for: 'Programadores, Designers, Produtividade extrema.',
        not_for: 'Gamers de FPS (latência bluetooth).',
        price: 650.00,
        shop_name: 'Kabum',
        images_desc: ['MX Master 3S Cinza', 'Mão segurando mouse', 'Botões laterais'],
        risk: { score: 90, bucket: 'A', reasons: ['Loja Confiável'] },
        history: { avg: 600, min: 550, max: 750, trend: 'up' }
    },
    {
        slug: 'macbook-air-m2',
        name: 'MacBook Air M2 13" 256GB',
        category: 'Tecnologia',
        sub_category: 'Notebooks',
        brand: 'Apple',
        description: 'Chip M2, bateria de 18h e design ultrafino sem ventoinhas (silêncio total).',
        ideal_for: 'Estudantes, Executivos, Tarefas do dia a dia.',
        not_for: 'Renderização 3D pesada ou Gaming AAA.',
        price: 8299.00,
        shop_name: 'Mercado Livre',
        images_desc: ['MacBook Air Midnight', 'MacBook Fechado Fino', 'Teclado Magic Keyboard'],
        risk: { score: 85, bucket: 'B', reasons: ['Preço volátil', 'Verificar reputação vendedor no ML'] },
        history: { avg: 8500, min: 7800, max: 9500, trend: 'down' }
    },
    {
        slug: 'jbl-flip-6',
        name: 'Caixa de Som JBL Flip 6',
        category: 'Tecnologia',
        sub_category: 'Áudio',
        brand: 'JBL',
        description: 'À prova d\'água e poeira (IP67). Som alto e graves profundos para o tamanho.',
        ideal_for: 'Pequenas reuniões, piscina, trilhas.',
        not_for: 'Festas grandes em espaços abertos.',
        price: 699.00,
        shop_name: 'Amazon',
        images_desc: ['JBL Flip 6 Vermelha', 'JBL na areia', 'Botões superiores'],
        risk: { score: 92, bucket: 'A', reasons: ['Loja Oficial JBL'] },
        history: { avg: 750, min: 599, max: 899, trend: 'stable' }
    },
    {
        slug: 'samsung-s23-ultra',
        name: 'Samsung Galaxy S23 Ultra 512GB',
        category: 'Tecnologia',
        sub_category: 'Smartphones',
        brand: 'Samsung',
        description: 'Câmera de 200MP e caneta S-Pen integrada. O Android mais completo.',
        ideal_for: 'Power users, Fotografia móvel, Produtividade.',
        not_for: 'Quem prefere celulares compactos e leves.',
        price: 5999.00,
        shop_name: 'Magalu',
        images_desc: ['S23 Ultra Verde', 'S-Pen', 'Zoom 100x'],
        risk: { score: 90, bucket: 'A', reasons: ['Vendido por Magalu'] },
        history: { avg: 6500, min: 5500, max: 8000, trend: 'down' }
    },
    {
        slug: 'ipad-air-5',
        name: 'iPad Air 5ª Geração M1 64GB',
        category: 'Tecnologia',
        sub_category: 'Tablets',
        brand: 'Apple',
        description: 'Potência do chip M1 em um corpo leve. Compatível com Apple Pencil 2.',
        ideal_for: 'Estudantes (anotações), Ilustração leve, Consumo de mídia.',
        not_for: 'Substituir 100% um notebook para multitarefa pesada.',
        price: 4500.00,
        shop_name: 'Amazon',
        images_desc: ['iPad Air Azul', 'Usando Pencil', 'Tela dividida'],
        risk: { score: 94, bucket: 'A', reasons: ['Preço competitivo'] },
        history: { avg: 4800, min: 4200, max: 5500, trend: 'stable' }
    },
    {
        slug: 'dell-monitor-u27',
        name: 'Monitor Dell UltraSharp 27" 4K USB-C',
        category: 'Home Office',
        sub_category: 'Monitores',
        brand: 'Dell',
        description: 'Hub USB-C que carrega seu notebook. Tela 4K IPS Black com cores fiéis.',
        ideal_for: 'Designers, setups minimalistas (um cabo).',
        not_for: 'Gamers competitivos (apenas 60Hz).',
        price: 3600.00,
        shop_name: 'Dell Store',
        images_desc: ['Monitor Frente', 'Hub Traseiro', 'Setup Mesa'],
        risk: { score: 99, bucket: 'A', reasons: ['Compra direto do fabricante'] },
        history: { avg: 3600, min: 3400, max: 4000, trend: 'stable' }
    },
    {
        slug: 'keychron-k2',
        name: 'Teclado Mecânico Keychron K2 Pro',
        category: 'Home Office',
        sub_category: 'Periféricos',
        brand: 'Keychron',
        description: 'Teclado mecânico sem fio 75% hot-swappable. Compatível com Mac e Windows.',
        ideal_for: 'Digitadores, Programadores, Entusiastas.',
        not_for: 'Quem precisa de teclado numérico dedicado.',
        price: 850.00,
        shop_name: 'AliExpress (Local Warehouse)',
        images_desc: ['Keychron K2 RGB', 'Switch Brown', 'Vista lateral'],
        risk: { score: 75, bucket: 'B', reasons: ['Importação', 'Garantia complexa'] },
        history: { avg: 800, min: 700, max: 900, trend: 'up' }
    },
    {
        slug: 'anker-charger-65w',
        name: 'Carregador Anker Nano II 65W',
        category: 'Tecnologia',
        sub_category: 'Acessórios',
        brand: 'Anker',
        description: 'Carregador GaN minúsculo capaz de carregar notebooks e celulares rápido.',
        ideal_for: 'Mochila leve, viagens.',
        not_for: 'Quem precisa de múltiplas portas (só tem 1 USB-C).',
        price: 280.00,
        shop_name: 'Amazon',
        images_desc: ['Carregador na mão', 'Plugado na tomada'],
        risk: { score: 96, bucket: 'A', reasons: ['Anker Oficial'] },
        history: { avg: 300, min: 250, max: 350, trend: 'down' }
    },

    // 2. CASA & COZINHA (8 Items)
    {
        slug: 'airfryer-philips-walita',
        name: 'Airfryer Philips Walita Essential 4.1L',
        category: 'Cozinha',
        sub_category: 'Eletroportáteis',
        brand: 'Philips Walita',
        description: 'A tecnologia original RapidAir. Cozinha por igual sem precisar virar os alimentos.',
        ideal_for: 'Cozinha saudável, praticidade, durabilidade.',
        not_for: 'Famílias gigantes (4.1L pode ser pouco para 6+ pessoas).',
        price: 699.00,
        shop_name: 'Magalu',
        images_desc: ['Airfryer Preta', 'Cesto com frango', 'Painel analógico'],
        risk: { score: 94, bucket: 'A', reasons: ['Loja confiável'] },
        history: { avg: 750, min: 599, max: 899, trend: 'down' }
    },
    {
        slug: 'nespresso-essenza-mini',
        name: 'Cafeteira Nespresso Essenza Mini',
        category: 'Cozinha',
        sub_category: 'Café',
        brand: 'Nespresso',
        description: 'Compacta e eficiente. Faz o mesmo espresso das máquinas grandes.',
        ideal_for: 'Espaços pequenos, amantes de espresso rápido.',
        not_for: 'Quem gosta de café coado (tamanho Lungo é o máximo).',
        price: 449.00,
        shop_name: 'Amazon',
        images_desc: ['Essenza Vermelha', 'Xícara de café', 'Cápsulas ao lado'],
        risk: { score: 97, bucket: 'A', reasons: ['Preço excelente'] },
        history: { avg: 500, min: 399, max: 600, trend: 'stable' }
    },
    {
        slug: 'robo-aspirador-xiaomi-s10',
        name: 'Robô Aspirador Xiaomi Robot Vacuum S10',
        category: 'Casa',
        sub_category: 'Limpeza',
        brand: 'Xiaomi',
        description: 'Navegação a laser (Lidar) que não bate nos móveis. Aspira e passa pano.',
        ideal_for: 'Quem tem pets, apartamentos médios/grandes.',
        not_for: 'Casas com muitos degraus soltos ou tapetes felpudos altos.',
        price: 2099.00,
        shop_name: 'Amazon',
        images_desc: ['Robô Branco', 'App com mapa', 'Base de carregamento'],
        risk: { score: 88, bucket: 'A', reasons: ['Vendedor bem avaliado'] },
        history: { avg: 2200, min: 1900, max: 2500, trend: 'stable' }
    },
    {
        slug: 'le-creuset-panel',
        name: 'Panela Redonda Signature Le Creuset 24cm',
        category: 'Cozinha',
        sub_category: 'Panelas',
        brand: 'Le Creuset',
        description: 'Ferro fundido esmaltado. Distribui calor perfeitamente e dura a vida toda.',
        ideal_for: 'Chefs caseiros, presentear, cozinhar slow food.',
        not_for: 'Quem busca leveza (é pesada) ou preço baixo.',
        price: 2800.00,
        shop_name: 'Le Creuset Site',
        images_desc: ['Panela Laranja Vulcânico', 'Cozinhando risoto', 'Tampa detalhe'],
        risk: { score: 99, bucket: 'A', reasons: ['Investimento vitalício'] },
        history: { avg: 2800, min: 2400, max: 3200, trend: 'up' }
    },
    {
        slug: 'tramontina-solar-inox',
        name: 'Jogo de Panelas Tramontina Solar Inox 6 Peças',
        category: 'Cozinha',
        sub_category: 'Panelas',
        brand: 'Tramontina',
        description: 'Fundo triplo que cozinha mais rápido. Aço inox cirúrgico durável.',
        ideal_for: 'Equipar a primeira casa com qualidade.',
        not_for: 'Quem não gosta de lavar inox (pode manchar se não secar).',
        price: 890.00,
        shop_name: 'Magalu',
        images_desc: ['Jogo empilhado', 'Fundo triplo zoom', 'Caixa do produto'],
        risk: { score: 93, bucket: 'A', reasons: ['Marca nacional de confiança'] },
        history: { avg: 950, min: 799, max: 1200, trend: 'down' }
    },
    {
        slug: 'mop-giratorio-flash-limp',
        name: 'Mop Giratório Fit Flash Limp',
        category: 'Casa',
        sub_category: 'Limpeza',
        brand: 'Flash Limp',
        description: 'Balde compacto com centrífuga. Evita contato com a água suja.',
        ideal_for: 'Limpeza rápida de pisos frios.',
        not_for: 'Limpeza pesada pós-obra.',
        price: 89.90,
        shop_name: 'Amazon',
        images_desc: ['Balde verde', 'Esfregão girando', 'Caixa'],
        risk: { score: 95, bucket: 'A', reasons: ['Bestseller'] },
        history: { avg: 95, min: 79, max: 120, trend: 'stable' }
    },
    {
        slug: 'oster-blender-1400',
        name: 'Liquidificador Oster 1400 Full',
        category: 'Cozinha',
        sub_category: 'Eletros',
        brand: 'Oster',
        description: '1400W de potência e jarra de vidro antimicrobiana que não pega cheiro.',
        ideal_for: 'Sucos com gelo, massas de torta, vitaminas.',
        not_for: 'Processar grãos secos muito duros sem líquido.',
        price: 220.00,
        shop_name: 'Mercado Livre',
        images_desc: ['Liquidificador Preto', 'Jarra de vidro', 'Lâminas'],
        risk: { score: 92, bucket: 'A', reasons: ['Bom custo benefício'] },
        history: { avg: 250, min: 199, max: 300, trend: 'down' }
    },
    {
        slug: 'brastemp-lava-seca',
        name: 'Lava e Seca Brastemp 10kg BNQ10',
        category: 'Casa',
        sub_category: 'Eletrodomésticos',
        brand: 'Brastemp',
        description: 'Ciclo Tira Manchas Pro e Design moderno. Lava edredom de solteiro.',
        ideal_for: 'Apartamentos sem varanda, tempo úmido.',
        not_for: 'Famílias muito grandes (10kg pode ser pouco).',
        price: 3899.00,
        shop_name: 'Magalu',
        images_desc: ['Máquina Frontal', 'Painel Touch', 'Tambor interno'],
        risk: { score: 89, bucket: 'A', reasons: ['Entrega agendada'] },
        history: { avg: 4000, min: 3600, max: 4500, trend: 'stable' }
    },

    // 3. GYM & SAÚDE (6 Items)
    {
        slug: 'creatina-growth',
        name: 'Creatina Monohidratada Creapure 250g',
        category: 'Saúde',
        sub_category: 'Suplementos',
        brand: 'Growth Supplements',
        description: 'Selo Creapure alemão. O suplemento mais estudado para força e cognição.',
        ideal_for: 'Praticantes de musculação, idosos (sarcopenia), vegetarianos.',
        not_for: 'Quem espera milagre sem treino.',
        price: 99.00,
        shop_name: 'Growth Site',
        images_desc: ['Pote Roxo', 'Selo Creapure'],
        risk: { score: 98, bucket: 'A', reasons: ['Venda direta da fábrica'] },
        history: { avg: 100, min: 90, max: 120, trend: 'up' }
    },
    {
        slug: 'whey-gold-standard',
        name: 'Whey Protein Gold Standard 907g',
        category: 'Saúde',
        sub_category: 'Suplementos',
        brand: 'Optimum Nutrition',
        description: 'Referência mundial em qualidade. Proteína isolada + concentrada. Sabor excelente.',
        ideal_for: 'Pós-treino, bater meta de proteína com sabor.',
        not_for: 'Quem busca o menor preço (existem nacionais bons mais baratos).',
        price: 299.00,
        shop_name: 'Amazon',
        images_desc: ['Pote Preto e Vermelho', 'Scoop', 'Tabela nutricional'],
        risk: { score: 91, bucket: 'A', reasons: ['Loja Oficial'] },
        history: { avg: 320, min: 280, max: 380, trend: 'stable' }
    },
    {
        slug: 'garmin-forerunner-255',
        name: 'Relógio GPS Garmin Forerunner 255',
        category: 'Saúde',
        sub_category: 'Wearables',
        brand: 'Garmin',
        description: 'GPS de precisão tripla. Bateria de 14 dias. Métricas avançadas de corrida.',
        ideal_for: 'Corredores, Triatletas, quem odeia carregar relógio todo dia.',
        not_for: 'Quem quer um "smartwatch" cheio de apps estilo Apple Watch.',
        price: 2199.00,
        shop_name: 'Amazon',
        images_desc: ['Relógio no pulso', 'Tela de dados de corrida'],
        risk: { score: 95, bucket: 'A', reasons: ['Durabilidade comprovada'] },
        history: { avg: 2300, min: 1999, max: 2600, trend: 'down' }
    },
    {
        slug: 'tapete-yoga-tpe',
        name: 'Tapete Yoga TPE Ecológico 6mm',
        category: 'Saúde',
        sub_category: 'Acessórios',
        brand: 'Yangfit',
        description: 'Material TPE aderente e sem cheiro. 6mm protege os joelhos.',
        ideal_for: 'Yoga, Pilates, Alongamento em casa.',
        not_for: 'Uso com tênis (pode esfarelar).',
        price: 129.90,
        shop_name: 'Amazon',
        images_desc: ['Tapete Roxo enrolado', 'Textura antiderrapante'],
        risk: { score: 93, bucket: 'A', reasons: ['Bom feedback'] },
        history: { avg: 130, min: 110, max: 160, trend: 'stable' }
    },
    {
        slug: 'balanca-bioimpedancia',
        name: 'Balança Bioimpedância Xiaomi Mi Scale 2',
        category: 'Saúde',
        sub_category: 'Monitoramento',
        brand: 'Xiaomi',
        description: 'Mede peso, gordura, água e massa muscular. Sincroniza com app Mi Fit.',
        ideal_for: 'Acompanhar evolução corporal em casa.',
        not_for: 'Precisão médica absoluta (é uma estimativa).',
        price: 180.00,
        shop_name: 'Amazon',
        images_desc: ['Balança Branca Vidro', 'App no celular'],
        risk: { score: 89, bucket: 'A', reasons: ['Popular'] },
        history: { avg: 200, min: 150, max: 250, trend: 'down' }
    },
    {
        slug: 'garrafa-pacco',
        name: 'Garrafa Térmica Pacco Hydra 950ml',
        category: 'Saúde',
        sub_category: 'Acessórios',
        brand: 'Pacco',
        description: 'Mantém gelado por 24h. Aço inox parede dupla. A queridinha do Instagram.',
        ideal_for: 'Levar para o trabalho, academia, incentivo a beber água.',
        not_for: 'Quem acha absurdo pagar caro em garrafa.',
        price: 249.00,
        shop_name: 'Pacco Site',
        images_desc: ['Garrafa Fosca', 'Tampa Hermética'],
        risk: { score: 90, bucket: 'A', reasons: ['Marca Hype'] },
        history: { avg: 250, min: 220, max: 300, trend: 'stable' }
    }
]

// --- Seed Execution ---

async function seed() {
    console.log(`🌱 Starting Super Seed with ${PRODUCTS.length} curated products...`)

    // 1. Upsert Shops (Simple Dedupe)
    const uniqueShops = Array.from(new Set(PRODUCTS.map(p => p.shop_name)))
    console.log(`🏪 Ensuring ${uniqueShops.length} shops exist...`)

    const shopsMap = new Map<string, string>() // Name -> ID

    for (const shopName of uniqueShops) {
        // Try find
        const { data: existing } = await supabase.from('shops').select('id').eq('name', shopName).single()
        if (existing) {
            shopsMap.set(shopName, existing.id)
        } else {
            // Create
            const { data: created, error } = await supabase.from('shops').insert({
                name: shopName,
                domain: `${shopName.toLowerCase().replace(/\s/g, '')}.com.br`, // Mock domain
                reputation_score: 9.0 + (Math.random()) // Random high score
            }).select('id').single()

            if (error) console.error(`Failed to create shop ${shopName}`, error)
            else if (created) shopsMap.set(shopName, created.id)
        }
    }

    // 2. Products Loop
    for (const p of PRODUCTS) {
        // Create/Update Product
        // Using slug as makeshift distinct identifier for this seed logic
        // Real app uses EAN, but here we use slug logic for uniqueness in seed

        const eanMock = Math.floor(Math.random() * 1000000000000).toString()

        // Check if exists by name to avoid dupes on re-run
        const { data: existingProd } = await supabase.from('products').select('id').eq('name', p.name).maybeSingle()

        let productId = existingProd?.id

        if (!productId) {
            const { data: newProd, error } = await supabase.from('products').insert({
                name: p.name,
                brand: p.brand,
                category: p.category, // We might need to map to exact ENUMS if strictly enforced, assuming text for now
                ean_normalized: eanMock,
                attributes: {
                    description: p.description,
                    ideal_for: p.ideal_for,
                    not_for: p.not_for,
                    images: p.images_desc,
                    specs: p.specs
                }
            }).select('id').single()

            if (error) {
                console.error(`❌ Failed product ${p.name}`, error)
                continue
            }
            productId = newProd!.id
        }

        // Create Offer
        const shopId = shopsMap.get(p.shop_name)
        if (shopId && productId) {
            const { data: offer, error: offerError } = await supabase.from('offers').insert({
                product_id: productId,
                shop_id: shopId,
                price: p.price,
                url: `https://${p.shop_name.toLowerCase()}.com/buy/${p.slug}`,
                is_available: true
            }).select('id').single()

            if (offer && !offerError) {
                // Risk Score
                await supabase.from('offer_risk_scores').insert({
                    offer_id: offer.id,
                    score: p.risk.score,
                    bucket: p.risk.bucket,
                    reasons: p.risk.reasons
                })

                // Price History Mock (3 points)
                await supabase.from('offer_price_history').insert([
                    { offer_id: offer.id, price: p.history.max, recorded_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // 90 days ago
                    { offer_id: offer.id, price: p.history.min, recorded_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // 30 days ago
                    { offer_id: offer.id, price: p.price, recorded_at: new Date() } // Now
                ])
            }
        }
    }

    // 3. Populate Home List (Smart Seed)
    console.log('📝 Populating Home List for demo households...')

    // We need a household to attach to. In this script we don't have user context easily.
    // However, if we want verify UI we need to attach to the "active user's" household.
    // Since this script runs as Admin, maybe we can fetch the most recent household created?
    // Or just skip because the user needs to add it manually to *their* list?
    // BETTER: Use the "Emergency Seed" logic? No, let's just create a seed-list script.

    // Actually, inserting into home_list_items requires a household_id. 
    // We can fetch ANY household to prove it works, but for the specific USER it might not show up if they aren't that household.
    // Strategy: We will skip auto-seeding HomeList here to avoid guessing the user's ID.
    // instead, rely on the table existing so the UI works (Empty State is better than Crash).

    // BUT, to be nice, let's try to find a profile linked to the first user and seed it.
    const { data: profiles } = await supabase.from('profiles').select('active_household_id').limit(1)
    if (profiles && profiles.length > 0 && profiles[0].active_household_id) {
        const hhId = profiles[0].active_household_id

        // Add "Omo" equivalent or Coffee
        const pCoffee = PRODUCTS.find(p => p.name.includes('Nespresso'))


        const listItems = []
        if (pCoffee) {
            // Fetch actual ID from DB
            const { data: dbProd } = await supabase.from('products').select('id').eq('name', pCoffee.name).single()
            if (dbProd) listItems.push({
                household_id: hhId,
                product_id: dbProd.id,
                frequency_days: 15,
                next_suggested_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Overdue! (Yesterday)
            })
        }

        if (listItems.length > 0) {
            await supabase.from('home_list_items').insert(listItems)
            console.log(`✅ Seeded ${listItems.length} items to Home List for Household ${hhId}`)
        }
    }

    console.log('✅ Super Seed Complete!')
}

seed().catch(console.error)
