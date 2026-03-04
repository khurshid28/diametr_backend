import { PrismaClient, WORK_STATUS, PRODUCT_TYPE, AD_TYPE } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Regions ───────────────────────────────────────────────
  const tashkent = await prisma.region.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Toshkent' },
  })
  const samarkand = await prisma.region.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Samarqand' },
  })
  console.log('✅ Regions created')

  // ─── Categories ────────────────────────────────────────────
  const catData = [
    { name_uz: 'Qurilish materiallari', name_ru: 'Стройматериалы',   name: 'Qurilish materiallari' },
    { name_uz: 'Santexnika',            name_ru: 'Сантехника',        name: 'Santexnika' },
    { name_uz: 'Elektr materiallari',   name_ru: 'Электроматериалы',  name: 'Elektr materiallari' },
    { name_uz: 'Bo\'yoq va lak',         name_ru: 'Краски и лаки',     name: "Bo'yoq va lak" },
    { name_uz: 'Metall mahsulotlar',    name_ru: 'Металлопродукция',  name: 'Metall mahsulotlar' },
    { name_uz: 'Yog\'och materiallari',  name_ru: 'Деревоматериалы',   name: "Yog'och materiallari" },
    { name_uz: 'Shifer va tom',         name_ru: 'Кровля и шифер',    name: 'Shifer va tom' },
    { name_uz: 'Keramika va plitka',    name_ru: 'Керамика и плитка', name: 'Keramika va plitka' },
  ]

  const categories: { id: number }[] = []
  for (let i = 0; i < catData.length; i++) {
    const cat = await prisma.category.upsert({
      where: { id: i + 1 },
      update: {},
      create: { ...catData[i], work_status: WORK_STATUS.WORKING },
    })
    categories.push(cat)
  }
  console.log('✅ Categories created')

  // ─── Products ──────────────────────────────────────────────
  const productData = [
    { name_uz: 'Sement M400',          name_ru: 'Цемент М400',         name: 'Sement M400',         category_id: categories[0].id, type: PRODUCT_TYPE.WEIGHT },
    { name_uz: 'G\'isht qizil',          name_ru: 'Кирпич красный',      name: "G'isht qizil",        category_id: categories[0].id, type: PRODUCT_TYPE.SIZE },
    { name_uz: 'Qum (yirik)',           name_ru: 'Песок (крупный)',     name: 'Qum (yirik)',          category_id: categories[0].id, type: PRODUCT_TYPE.WEIGHT },
    { name_uz: 'Armirovka 12mm',       name_ru: 'Арматура 12мм',       name: 'Armirovka 12mm',       category_id: categories[4].id, type: PRODUCT_TYPE.LENGTH },
    { name_uz: 'Shifer AAC 8 to\'lqin', name_ru: 'Шифер ААЦ 8 волн',   name: "Shifer AAC 8 to'lqin", category_id: categories[6].id, type: PRODUCT_TYPE.SIZE },
    { name_uz: 'Truba PVC 110mm',      name_ru: 'Труба ПВХ 110мм',     name: 'Truba PVC 110mm',      category_id: categories[1].id, type: PRODUCT_TYPE.LENGTH },
    { name_uz: 'Kran mixer',           name_ru: 'Смеситель кран',      name: 'Kran mixer',           category_id: categories[1].id, type: PRODUCT_TYPE.SIZE },
    { name_uz: 'Kabel VVG 3x2.5',     name_ru: 'Кабель ВВГ 3х2.5',   name: 'Kabel VVG 3x2.5',     category_id: categories[2].id, type: PRODUCT_TYPE.LENGTH },
    { name_uz: 'Rozetka 2P+PE',        name_ru: 'Розетка 2P+PE',       name: 'Rozetka 2P+PE',        category_id: categories[2].id, type: PRODUCT_TYPE.SIZE },
    { name_uz: 'Dekorativ bo\'yoq',     name_ru: 'Декоративная краска', name: "Dekorativ bo'yoq",    category_id: categories[3].id, type: PRODUCT_TYPE.LITR },
    { name_uz: 'Grunt boyoq',          name_ru: 'Грунтовочная краска', name: 'Grunt boyoq',          category_id: categories[3].id, type: PRODUCT_TYPE.LITR },
    { name_uz: 'Plitka devor 30x60',   name_ru: 'Плитка стеновая 30x60', name: 'Plitka devor 30x60', category_id: categories[7].id, type: PRODUCT_TYPE.SIZE },
  ]

  const products: { id: number }[] = []
  for (let i = 0; i < productData.length; i++) {
    const p = await prisma.product.upsert({
      where: { id: i + 1 },
      update: {},
      create: { ...productData[i], work_status: WORK_STATUS.WORKING },
    })
    products.push(p)
  }
  console.log('✅ Products created')

  // ─── Product Items ─────────────────────────────────────────
  const itemData = [
    { name: '25 kg', product_id: products[0].id },
    { name: '50 kg', product_id: products[0].id },
    { name: 'Standart', product_id: products[1].id },
    { name: 'Katta',    product_id: products[1].id },
    { name: '1 kub',   product_id: products[2].id },
    { name: '12mm x 6m', product_id: products[3].id },
    { name: '14mm x 6m', product_id: products[3].id },
    { name: '8 to\'lqin', product_id: products[4].id },
    { name: '110mm x 3m', product_id: products[5].id },
    { name: 'Aralash rang', product_id: products[6].id },
    { name: '3x2.5 x 100m', product_id: products[7].id },
    { name: 'Oq', product_id: products[9].id },
    { name: 'Kulrang', product_id: products[9].id },
    { name: '10 litr', product_id: products[10].id },
    { name: '1m²', product_id: products[11].id },
  ]

  const items: { id: number }[] = []
  for (let i = 0; i < itemData.length; i++) {
    const item = await prisma.productItem.upsert({
      where: { id: i + 1 },
      update: {},
      create: { ...itemData[i], work_status: WORK_STATUS.WORKING },
    })
    items.push(item)
  }
  console.log('✅ Product items created')

  // ─── Shops ─────────────────────────────────────────────────
  const shopData = [
    {
      name: 'Diametr Qurilish Bozori',
      address: 'Toshkent sh., Chilonzor t., Bunyodkor ko\'chasi 12',
      lat: 41.299496,
      lon: 69.240073,
      delivery_amount: 50000,
      yandex_delivery: true,
      market_delivery: true,
      fixed_delivery: true,
      region_id: tashkent.id,
      work_status: WORK_STATUS.WORKING,
    },
    {
      name: 'Stroy Master',
      address: 'Toshkent sh., Yunusobod t., Amir Temur shoh ko\'chasi 108',
      lat: 41.336720,
      lon: 69.296680,
      delivery_amount: 30000,
      yandex_delivery: true,
      market_delivery: false,
      fixed_delivery: true,
      region_id: tashkent.id,
      work_status: WORK_STATUS.WORKING,
    },
    {
      name: 'Qurilish Savdo',
      address: 'Toshkent sh., Shayxontohur t., Bog\'ishamol ko\'chasi 45',
      lat: 41.321580,
      lon: 69.261540,
      delivery_amount: 40000,
      yandex_delivery: false,
      market_delivery: true,
      fixed_delivery: true,
      region_id: tashkent.id,
      work_status: WORK_STATUS.WORKING,
    },
    {
      name: 'Samarqand Qurilish',
      address: 'Samarqand sh., Registon ko\'chasi 5',
      lat: 39.655370,
      lon: 66.975710,
      delivery_amount: 60000,
      yandex_delivery: true,
      market_delivery: true,
      fixed_delivery: false,
      region_id: samarkand.id,
      work_status: WORK_STATUS.WORKING,
    },
  ]

  const shops: { id: number }[] = []
  for (let i = 0; i < shopData.length; i++) {
    const shop = await prisma.shop.upsert({
      where: { id: i + 1 },
      update: {},
      create: shopData[i],
    })
    shops.push(shop)
  }
  console.log('✅ Shops created')

  // ─── Shop Products (prices) ────────────────────────────────
  const shopProductData = [
    // Shop 1 - Diametr
    { shop_id: shops[0].id, product_item_id: items[0].id,  price: 85000  },
    { shop_id: shops[0].id, product_item_id: items[1].id,  price: 158000 },
    { shop_id: shops[0].id, product_item_id: items[2].id,  price: 1200   },
    { shop_id: shops[0].id, product_item_id: items[5].id,  price: 42000  },
    { shop_id: shops[0].id, product_item_id: items[7].id,  price: 28000  },
    { shop_id: shops[0].id, product_item_id: items[8].id,  price: 15500  },
    { shop_id: shops[0].id, product_item_id: items[9].id,  price: 750000 },
    { shop_id: shops[0].id, product_item_id: items[10].id, price: 89000  },
    { shop_id: shops[0].id, product_item_id: items[11].id, price: 75000  },
    { shop_id: shops[0].id, product_item_id: items[13].id, price: 62000  },
    { shop_id: shops[0].id, product_item_id: items[14].id, price: 48000  },
    // Shop 2 - Stroy Master
    { shop_id: shops[1].id, product_item_id: items[0].id,  price: 82000  },
    { shop_id: shops[1].id, product_item_id: items[1].id,  price: 155000 },
    { shop_id: shops[1].id, product_item_id: items[3].id,  price: 1350   },
    { shop_id: shops[1].id, product_item_id: items[4].id,  price: 320000 },
    { shop_id: shops[1].id, product_item_id: items[6].id,  price: 56000  },
    { shop_id: shops[1].id, product_item_id: items[8].id,  price: 14800  },
    { shop_id: shops[1].id, product_item_id: items[12].id, price: 83000  },
    // Shop 3 - Qurilish Savdo
    { shop_id: shops[2].id, product_item_id: items[0].id,  price: 88000  },
    { shop_id: shops[2].id, product_item_id: items[2].id,  price: 1100   },
    { shop_id: shops[2].id, product_item_id: items[5].id,  price: 45000  },
    { shop_id: shops[2].id, product_item_id: items[7].id,  price: 26500  },
    { shop_id: shops[2].id, product_item_id: items[9].id,  price: 790000 },
    { shop_id: shops[2].id, product_item_id: items[11].id, price: 72000  },
    { shop_id: shops[2].id, product_item_id: items[13].id, price: 65000  },
    { shop_id: shops[2].id, product_item_id: items[14].id, price: 45000  },
    // Shop 4 - Samarqand
    { shop_id: shops[3].id, product_item_id: items[0].id,  price: 80000  },
    { shop_id: shops[3].id, product_item_id: items[1].id,  price: 148000 },
    { shop_id: shops[3].id, product_item_id: items[4].id,  price: 290000 },
    { shop_id: shops[3].id, product_item_id: items[7].id,  price: 25000  },
  ]

  for (let i = 0; i < shopProductData.length; i++) {
    await prisma.shopProduct.upsert({
      where: { id: i + 1 },
      update: {},
      create: { ...shopProductData[i], work_status: WORK_STATUS.WORKING, count: 100 },
    })
  }
  console.log('✅ Shop products (prices) created')

  // ─── Ads (banners) ─────────────────────────────────────────
  const adData = [
    {
      title: 'Qurilish materiallari — eng yaxshi narxlarda',
      subtitle: "O'zbekistondagi yetakchi qurilish bozori. 10,000+ mahsulot!",
      type: AD_TYPE.SHOP,
      shop_id: shops[0].id,
      work_status: WORK_STATUS.WORKING,
    },
    {
      title: 'Tez va ishonchli yetkazib berish',
      subtitle: "Butun O'zbekiston bo'ylab tezkor yetkazib berish!",
      type: AD_TYPE.SHOP,
      shop_id: shops[1].id,
      work_status: WORK_STATUS.WORKING,
    },
  ]

  for (let i = 0; i < adData.length; i++) {
    await prisma.ad.upsert({
      where: { id: i + 1 },
      update: {},
      create: adData[i] as any,
    })
  }
  console.log('✅ Ads (banners) created')

  console.log('\n🎉 Seeding complete!')
  console.log(`   📦 ${categories.length} categories`)
  console.log(`   🏗️  ${products.length} products`)
  console.log(`   🔩 ${items.length} product items`)
  console.log(`   🏪 ${shops.length} shops`)
  console.log(`   💰 ${shopProductData.length} shop prices`)
  console.log(`   📢 ${adData.length} ads/banners`)
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
