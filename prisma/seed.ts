import { PrismaClient, WORK_STATUS, PRODUCT_TYPE } from '@prisma/client'

const prisma = new PrismaClient()

const regions = [
  { name: "Yunusobod" },
  { name: "Chilonzor" },
  { name: "Mirzo Ulug'bek" },
  { name: "Shayxontohur" },
  { name: "Yakkasaroy" },
  { name: "Uchtepa" },
  { name: "Olmazar" },
  { name: "Sergeli" },
  { name: "Bektemir" },
  { name: "Yashnobod" },
]

const categories = [
  {
    name_uz: "Tsement va qorishma", name_ru: "Цемент и смеси", name: "Tsement va qorishma",
    products: [
      { name_uz: "Tsement M400", name_ru: "Цемент М400", name: "Tsement M400", type: PRODUCT_TYPE.WEIGHT, items: ["50 kg", "25 kg"] },
      { name_uz: "Tsement M500", name_ru: "Цемент М500", name: "Tsement M500", type: PRODUCT_TYPE.WEIGHT, items: ["50 kg", "25 kg"] },
      { name_uz: "Gips qorishma", name_ru: "Гипсовая смесь", name: "Gips qorishma", type: PRODUCT_TYPE.WEIGHT, items: ["30 kg", "5 kg"] },
      { name_uz: "Shtukaturka", name_ru: "Штукатурка", name: "Shtukaturka", type: PRODUCT_TYPE.WEIGHT, items: ["25 kg", "5 kg"] },
      { name_uz: "Plitka kleyi", name_ru: "Плиточный клей", name: "Plitka kleyi", type: PRODUCT_TYPE.WEIGHT, items: ["25 kg", "5 kg"] },
    ]
  },
  {
    name_uz: "G'isht va bloklar", name_ru: "Кирпич и блоки", name: "Gisht va bloklar",
    products: [
      { name_uz: "Qizil g'isht", name_ru: "Красный кирпич", name: "Qizil gisht", type: PRODUCT_TYPE.SIZE, items: ["M100", "M150", "M200"] },
      { name_uz: "Silikat g'isht", name_ru: "Силикатный кирпич", name: "Silikat gisht", type: PRODUCT_TYPE.SIZE, items: ["M150", "M200"] },
      { name_uz: "Gaz beton blok", name_ru: "Газобетонный блок", name: "Gaz beton blok", type: PRODUCT_TYPE.SIZE, items: ["200x300x600", "100x300x600"] },
      { name_uz: "Penobeton blok", name_ru: "Пенобетонный блок", name: "Penobeton blok", type: PRODUCT_TYPE.SIZE, items: ["200x300x600", "150x300x600"] },
    ]
  },
  {
    name_uz: "Armatura va metalloprokat", name_ru: "Арматура и металлопрокат", name: "Armatura",
    products: [
      { name_uz: "Armatura", name_ru: "Арматура", name: "Armatura", type: PRODUCT_TYPE.SIZE, items: ["08 mm", "10 mm", "12 mm", "14 mm", "16 mm"] },
      { name_uz: "Profil truba", name_ru: "Профильная труба", name: "Profil truba", type: PRODUCT_TYPE.SIZE, items: ["20x20x2", "40x40x2", "60x60x3"] },
      { name_uz: "Shveller", name_ru: "Швеллер", name: "Shveller", type: PRODUCT_TYPE.SIZE, items: ["100 mm", "120 mm", "160 mm"] },
      { name_uz: "Katanka sim", name_ru: "Проволока катанка", name: "Katanka", type: PRODUCT_TYPE.SIZE, items: ["06 mm", "08 mm"] },
    ]
  },
  {
    name_uz: "Parket va laminat", name_ru: "Паркет и ламинат", name: "Parket va laminat",
    products: [
      { name_uz: "Laminat 8mm", name_ru: "Ламинат 8мм", name: "Laminat 8mm", type: PRODUCT_TYPE.COLOR, items: ["Eman ochiq", "Eman toq", "Qongiir", "Oq"] },
      { name_uz: "Laminat 12mm", name_ru: "Ламинат 12мм", name: "Laminat 12mm", type: PRODUCT_TYPE.COLOR, items: ["Eman", "Yongiq", "Kulrang"] },
      { name_uz: "Parket taxta", name_ru: "Паркетная доска", name: "Parket taxta", type: PRODUCT_TYPE.COLOR, items: ["Eman", "Teak", "Wenge"] },
      { name_uz: "Linoleum", name_ru: "Линолеум", name: "Linoleum", type: PRODUCT_TYPE.COLOR, items: ["Bir rangli", "Gulli", "Toshdek"] },
    ]
  },
  {
    name_uz: "Boyoq va lak", name_ru: "Краски и лаки", name: "Boyoq va lak",
    products: [
      { name_uz: "Akril boyoq", name_ru: "Акриловая краска", name: "Akril boyoq", type: PRODUCT_TYPE.COLOR, items: ["Oq", "Sariq", "Moviy", "Yashil", "Qizil", "Kulrang"] },
      { name_uz: "Fasad boyoq", name_ru: "Фасадная краска", name: "Fasad boyoq", type: PRODUCT_TYPE.LITR, items: ["3 litr", "5 litr", "15 litr"] },
      { name_uz: "Emal boyoq", name_ru: "Эмаль", name: "Emal boyoq", type: PRODUCT_TYPE.COLOR, items: ["Oq", "Kulrang", "Sariq"] },
      { name_uz: "Parket laki", name_ru: "Лак паркетный", name: "Parket laki", type: PRODUCT_TYPE.LITR, items: ["1 litr", "2.5 litr", "5 litr"] },
      { name_uz: "Grunt", name_ru: "Грунтовка", name: "Grunt", type: PRODUCT_TYPE.LITR, items: ["5 litr", "10 litr", "20 litr"] },
    ]
  },
  {
    name_uz: "Santexnika", name_ru: "Сантехника", name: "Santexnika",
    products: [
      { name_uz: "PP truba", name_ru: "Труба полипропиленовая", name: "PP truba", type: PRODUCT_TYPE.SIZE, items: ["20 mm", "25 mm", "32 mm", "40 mm", "50 mm"] },
      { name_uz: "Unitaz", name_ru: "Унитаз", name: "Unitaz", type: PRODUCT_TYPE.COLOR, items: ["Oq", "Kulrang"] },
      { name_uz: "Rakovinna", name_ru: "Раковина", name: "Rakovinna", type: PRODUCT_TYPE.SIZE, items: ["50 sm", "60 sm", "80 sm"] },
      { name_uz: "Kran smesitel", name_ru: "Смеситель", name: "Kran smesitel", type: PRODUCT_TYPE.COLOR, items: ["Xrom", "Oltin", "Qora"] },
    ]
  },
  {
    name_uz: "Elektr materiallari", name_ru: "Электрические материалы", name: "Elektr materiallari",
    products: [
      { name_uz: "Elektr kabel", name_ru: "Кабель электрический", name: "Elektr kabel", type: PRODUCT_TYPE.SIZE, items: ["1.5 mm2", "2.5 mm2", "4 mm2", "6 mm2", "10 mm2"] },
      { name_uz: "Rozetka", name_ru: "Розетка", name: "Rozetka", type: PRODUCT_TYPE.COLOR, items: ["Oq", "Kulrang", "Qora"] },
      { name_uz: "Vyklyuchatel", name_ru: "Выключатель", name: "Vyklyuchatel", type: PRODUCT_TYPE.COLOR, items: ["Oq", "Qora"] },
      { name_uz: "LED lampa", name_ru: "LED лампа", name: "LED lampa", type: PRODUCT_TYPE.SIZE, items: ["9W E27", "12W E27", "15W E27", "7W GU10"] },
    ]
  },
  {
    name_uz: "Tom materiallari", name_ru: "Кровельные материалы", name: "Tom materiallari",
    products: [
      { name_uz: "Profnastil", name_ru: "Профнастил", name: "Profnastil", type: PRODUCT_TYPE.COLOR, items: ["Qizil", "Yashil", "Kok", "Jigarrang"] },
      { name_uz: "Metallcherepitsa", name_ru: "Металлочерепица", name: "Metallcherepitsa", type: PRODUCT_TYPE.COLOR, items: ["Qizil", "Yashil", "Kok"] },
      { name_uz: "Shifer", name_ru: "Шифер", name: "Shifer", type: PRODUCT_TYPE.SIZE, items: ["7 tolqinli", "8 tolqinli"] },
      { name_uz: "Gidroizolyatsiya", name_ru: "Гидроизоляция", name: "Gidroizolyatsiya", type: PRODUCT_TYPE.SIZE, items: ["1.5 mm", "2 mm", "3 mm"] },
    ]
  },
  {
    name_uz: "Plitka va keramika", name_ru: "Плитка и керамика", name: "Plitka va keramika",
    products: [
      { name_uz: "Pol plitka", name_ru: "Плитка для пола", name: "Pol plitka", type: PRODUCT_TYPE.SIZE, items: ["30x30 sm", "40x40 sm", "60x60 sm", "80x80 sm"] },
      { name_uz: "Devor plitka", name_ru: "Настенная плитка", name: "Devor plitka", type: PRODUCT_TYPE.SIZE, items: ["20x30 sm", "25x50 sm", "30x60 sm"] },
      { name_uz: "Gresit", name_ru: "Керамогранит", name: "Gresit", type: PRODUCT_TYPE.SIZE, items: ["60x60 sm", "80x80 sm", "120x60 sm"] },
      { name_uz: "Mozaika", name_ru: "Мозаика", name: "Mozaika", type: PRODUCT_TYPE.COLOR, items: ["Oq", "Kulrang", "Kok", "Yashil"] },
    ]
  },
  {
    name_uz: "Eshik va derazalar", name_ru: "Двери и окна", name: "Eshik va derazalar",
    products: [
      { name_uz: "MDF eshik", name_ru: "Дверь МДФ", name: "MDF eshik", type: PRODUCT_TYPE.COLOR, items: ["Oq", "Eman", "Wenge", "Kulrang"] },
      { name_uz: "Temir eshik", name_ru: "Металлическая дверь", name: "Temir eshik", type: PRODUCT_TYPE.COLOR, items: ["Qora", "Kumush", "Bronza"] },
      { name_uz: "PVC deraza", name_ru: "Пластиковое окно ПВХ", name: "PVC deraza", type: PRODUCT_TYPE.SIZE, items: ["60x120 sm", "100x120 sm", "120x140 sm", "150x150 sm"] },
    ]
  },
]

const shopsData = [
  { name: "Mirzo Qurilish Markazi",        address: "Mirzo Ulugbek tumani, Amir Temur kochasi 45",    region: "Mirzo Ulug'bek",  lat: 41.3319, lon: 69.3350, inn: "301234567", delivery_amount: 30000 },
  { name: "Grand Stroy Toshkent",          address: "Yunusobod tumani, Yunusobod kochasi 12",          region: "Yunusobod",        lat: 41.3638, lon: 69.3468, inn: "302345678", delivery_amount: 25000 },
  { name: "Chilonzor Qurilish Bozori",     address: "Chilonzor tumani, Qoratosh massivi 7",            region: "Chilonzor",        lat: 41.2995, lon: 69.2120, inn: "303456789", delivery_amount: 20000 },
  { name: "Mega Stroy",                    address: "Shayxontohur tumani, Navoiy kochasi 89",          region: "Shayxontohur",     lat: 41.3123, lon: 69.2689, inn: "304567890", delivery_amount: 35000 },
  { name: "Rustam Qurilish",               address: "Uchtepa tumani, Uchtepa kochasi 23",              region: "Uchtepa",          lat: 41.2878, lon: 69.2034, inn: "305678901", delivery_amount: 20000 },
  { name: "Al-Baraka Building Materials",  address: "Yakkasaroy tumani, Shota Rustaveli kochasi 14",   region: "Yakkasaroy",       lat: 41.3041, lon: 69.2712, inn: "306789012", delivery_amount: 30000 },
  { name: "Toshkent Santexnika Markazi",   address: "Olmazar tumani, Olmazar kochasi 56",              region: "Olmazar",          lat: 41.3289, lon: 69.3112, inn: "307890123", delivery_amount: 15000 },
  { name: "Ibrohim Qurilish Dunyosi",      address: "Sergeli tumani, Sergeli kochasi 3",               region: "Sergeli",          lat: 41.2287, lon: 69.2756, inn: "308901234", delivery_amount: 40000 },
  { name: "Novostroy Plus",                address: "Yashnobod tumani, Yashnobod kochasi 78",          region: "Yashnobod",        lat: 41.3089, lon: 69.3345, inn: "309012345", delivery_amount: 25000 },
  { name: "Pro Stroy Market",              address: "Mirzo Ulugbek tumani, Parkent kochasi 112",       region: "Mirzo Ulug'bek",  lat: 41.3456, lon: 69.3567, inn: "310123456", delivery_amount: 30000 },
  { name: "Baxtiyar Qurilish Savdosi",     address: "Yunusobod tumani, Mustaqqillik kochasi 34",       region: "Yunusobod",        lat: 41.3556, lon: 69.3201, inn: "311234567", delivery_amount: 20000 },
  { name: "Hamid va Sheriklari",           address: "Chilonzor tumani, Buyuk Ipak Yoli 19",            region: "Chilonzor",        lat: 41.2912, lon: 69.2234, inn: "312345678", delivery_amount: 25000 },
  { name: "Stroy City",                    address: "Shayxontohur tumani, Labzak kochasi 67",          region: "Shayxontohur",     lat: 41.3201, lon: 69.2801, inn: "313456789", delivery_amount: 35000 },
  { name: "Toshkent Building Hub",         address: "Bektemir tumani, Sanoat kochasi 5",               region: "Bektemir",         lat: 41.2645, lon: 69.3712, inn: "314567890", delivery_amount: 50000 },
  { name: "Elektron Stroy",               address: "Uchtepa tumani, Kichik Xalqa yoli 8",              region: "Uchtepa",          lat: 41.2923, lon: 69.1978, inn: "315678901", delivery_amount: 20000 },
]

const priceRanges: Record<string, [number, number]> = {
  "Tsement va qorishma":      [25,  80],
  "Gisht va bloklar":         [500, 2500],
  "Armatura":                 [30,  300],
  "Parket va laminat":        [40,  250],
  "Boyoq va lak":             [30,  150],
  "Santexnika":               [50,  800],
  "Elektr materiallari":      [10,  200],
  "Tom materiallari":         [20,  180],
  "Plitka va keramika":       [40,  400],
  "Eshik va derazalar":       [300, 3000],
}

function randomPrice(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min) * 1000
}

async function main() {
  console.log("Seed boshlandi...\n")

  // 1. Regionlar
  const createdRegions: Record<string, number> = {}
  for (let i = 0; i < regions.length; i++) {
    const r = regions[i]
    const region = await prisma.region.upsert({
      where: { id: i + 1 },
      update: { name: r.name },
      create: { name: r.name },
    })
    createdRegions[r.name] = region.id
  }
  console.log(`OK: ${regions.length} ta region`)

  // 2. Kategoriya + Product + ProductItem
  const createdItems: Array<{ id: number; catName: string }> = []

  for (const cat of categories) {
    const category = await prisma.category.create({
      data: { name: cat.name, name_uz: cat.name_uz, name_ru: cat.name_ru, work_status: WORK_STATUS.WORKING },
    })
    for (const prod of cat.products) {
      const product = await prisma.product.create({
        data: { name: prod.name, name_uz: prod.name_uz, name_ru: prod.name_ru, type: prod.type, work_status: WORK_STATUS.WORKING, category_id: category.id },
      })
      for (const itemName of prod.items) {
        const item = await prisma.productItem.create({
          data: { name: itemName, desc: prod.name_uz + " - " + itemName, work_status: WORK_STATUS.WORKING, product_id: product.id },
        })
        createdItems.push({ id: item.id, catName: cat.name })
      }
    }
    console.log(`  OK: ${cat.name_uz}`)
  }

  // 3. Dokonlar
  const shopIds: number[] = []
  for (const shop of shopsData) {
    const regionId = createdRegions[shop.region] || 1
    const s = await prisma.shop.create({
      data: {
        name: shop.name, address: shop.address, region_id: regionId,
        lat: shop.lat, lon: shop.lon, inn: shop.inn,
        delivery_amount: shop.delivery_amount, work_status: WORK_STATUS.WORKING,
        yandex_delivery: true, market_delivery: true, fixed_delivery: true,
        expired: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    })
    shopIds.push(s.id)
  }
  console.log(`OK: ${shopsData.length} ta dokon`)

  // 4. ShopProduct
  let total = 0
  for (const shopId of shopIds) {
    const shuffled = [...createdItems].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.floor(Math.random() * 20) + 20)
    for (const item of selected) {
      const [min, max] = priceRanges[item.catName] || [10, 500]
      await prisma.shopProduct.create({
        data: { shop_id: shopId, product_item_id: item.id, price: randomPrice(min, max), count: Math.floor(Math.random() * 200) + 10, work_status: WORK_STATUS.WORKING },
      })
      total++
    }
  }
  console.log(`OK: ${total} ta shopProduct`)

  // 5. Reklamalar (Bannerlar)
  const adsData = [
    { title: "Diametr Qurilish Bozori", subtitle: "Eng yirik qurilish materiallari markazi" },
    { title: "Tsement va g'isht", subtitle: "Ulgurji narxlarda, tez yetkazib berish" },
    { title: "Temir va armatura", subtitle: "Zavod narxlarda, katta assortiment" },
    { title: "Yog'och va laminat", subtitle: "Keng tanlov, yuqori sifat" },
    { title: "Qurilish asbob-uskunalari", subtitle: "Professional vositalar arzon narxda" },
  ]
  for (const ad of adsData) {
    await prisma.ad.create({
      data: {
        title: ad.title,
        subtitle: ad.subtitle,
        work_status: WORK_STATUS.WORKING,
        expired: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    })
  }
  console.log(`OK: ${adsData.length} ta reklama (banner)`)

  console.log("\nSeed tayyor!")
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
