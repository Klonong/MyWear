export type Gender = "women" | "men" | "kids"

export type Color = { name: string; hex: string; tone: string }

export type Product = {
  slug: string
  name: string
  gender: Gender
  category: string
  sport: string
  blurb: string
  price: number
  salePrice?: number
  rating: number
  reviews: number
  badge?: "New" | "Sale" | "Limited"
  notice?: string
  colors: Color[]
  sizes: { label: string; stock: number }[]
  material: string
  fit: string
}

export const GENDERS: Gender[] = ["women", "men", "kids"]
export const NAV = ["New", "Women", "Men", "Kids", "Sports", "Lifestyle", "Sale"]
export const CATEGORIES = ["Tops", "Bottoms", "Outerwear", "Knitwear", "Innerwear", "Accessories"]

const sizes = (out: string[] = []) =>
  ["XS", "S", "M", "L", "XL"].map((s) => ({ label: `A/${s}`, stock: out.includes(s) ? 0 : s === "L" ? 2 : 12 }))

const khaki = { name: "Craft Khaki", hex: "#8a7f63", tone: "#cfc8b4" }
const black = { name: "Black", hex: "#111111", tone: "#3a3a3a" }
const white = { name: "Off White", hex: "#f2efe8", tone: "#f7f5f0" }
const navy = { name: "Navy", hex: "#1f2a44", tone: "#5c6680" }
const sage = { name: "Sage", hex: "#8fa38a", tone: "#c4d0c0" }

export const PRODUCTS: Product[] = [
  {
    slug: "running-artist-long-sleeve-tee",
    name: "Running x Artist Long Sleeve Tee",
    gender: "women",
    category: "Tops",
    sport: "Running",
    blurb: "Long sleeve tee made for cool morning runs, with a quick-dry knit and an artist print on the back.",
    price: 1090000,
    rating: 4.6,
    reviews: 128,
    badge: "New",
    notice: "Excluded from vouchers & coupons",
    colors: [khaki, black],
    sizes: sizes(["XL"]),
    material: "88% recycled polyester, 12% elastane",
    fit: "Regular fit. Model is 170 cm and wears A/S.",
  },
  {
    slug: "airism-seamless-crew-tee",
    name: "AIRism Seamless Crew Tee",
    gender: "women",
    category: "Tops",
    sport: "Training",
    blurb: "Smooth, breathable crew neck with no side seams.",
    price: 249000,
    rating: 4.8,
    reviews: 412,
    colors: [white, black, sage, navy],
    sizes: sizes(),
    material: "90% nylon, 10% spandex",
    fit: "Relaxed fit.",
  },
  {
    slug: "dry-ex-running-tank",
    name: "Dry-EX Running Tank",
    gender: "women",
    category: "Tops",
    sport: "Running",
    blurb: "Featherweight tank with mesh back panel.",
    price: 399000,
    salePrice: 299000,
    rating: 4.4,
    reviews: 57,
    badge: "Sale",
    colors: [black, sage],
    sizes: sizes(["XS"]),
    material: "100% polyester",
    fit: "Slim fit.",
  },
  {
    slug: "half-zip-training-top",
    name: "Half-Zip Training Top",
    gender: "women",
    category: "Tops",
    sport: "Training",
    blurb: "Brushed-back half zip for warm-ups.",
    price: 599000,
    rating: 4.5,
    reviews: 89,
    badge: "Limited",
    colors: [navy, khaki, white],
    sizes: sizes(),
    material: "92% polyester, 8% elastane",
    fit: "Regular fit.",
  },
  {
    slug: "ultra-stretch-active-jogger",
    name: "Ultra Stretch Active Jogger",
    gender: "women",
    category: "Bottoms",
    sport: "Training",
    blurb: "Tapered jogger with four-way stretch.",
    price: 499000,
    rating: 4.7,
    reviews: 203,
    colors: [black, navy],
    sizes: sizes(),
    material: "87% polyester, 13% spandex",
    fit: "Tapered fit.",
  },
  {
    slug: "pocketable-parka",
    name: "Pocketable UV Protection Parka",
    gender: "women",
    category: "Outerwear",
    sport: "Lifestyle",
    blurb: "Packs into its own pocket. UPF 40+.",
    price: 599000,
    salePrice: 449000,
    rating: 4.3,
    reviews: 76,
    badge: "Sale",
    colors: [sage, black, white],
    sizes: sizes(["M"]),
    material: "100% nylon",
    fit: "Relaxed fit.",
  },
  {
    slug: "dry-ex-crew-tee-men",
    name: "Dry-EX Crew Neck Tee",
    gender: "men",
    category: "Tops",
    sport: "Running",
    blurb: "Quick-dry tee with a smooth hand.",
    price: 299000,
    rating: 4.6,
    reviews: 318,
    badge: "New",
    colors: [black, navy, white],
    sizes: sizes(),
    material: "100% polyester",
    fit: "Regular fit.",
  },
  {
    slug: "blocktech-jacket",
    name: "Blocktech Jacket",
    gender: "men",
    category: "Outerwear",
    sport: "Lifestyle",
    blurb: "Windproof, water-repellent shell.",
    price: 999000,
    rating: 4.5,
    reviews: 141,
    colors: [khaki, black],
    sizes: sizes(["XS"]),
    material: "100% polyester",
    fit: "Regular fit.",
  },
  {
    slug: "sweat-shorts-men",
    name: "Sweat Shorts",
    gender: "men",
    category: "Bottoms",
    sport: "Training",
    blurb: "Soft loopback cotton shorts.",
    price: 299000,
    salePrice: 199000,
    rating: 4.2,
    reviews: 64,
    badge: "Sale",
    colors: [navy, sage],
    sizes: sizes(),
    material: "100% cotton",
    fit: "Regular fit.",
  },
  {
    slug: "kids-airism-tee",
    name: "Kids AIRism Cotton Tee",
    gender: "kids",
    category: "Tops",
    sport: "Lifestyle",
    blurb: "Cool, soft everyday tee for kids.",
    price: 149000,
    rating: 4.8,
    reviews: 97,
    badge: "New",
    colors: [white, sage, navy],
    sizes: sizes(),
    material: "50% cotton, 50% polyester",
    fit: "Regular fit.",
  },
  {
    slug: "kids-fleece-jacket",
    name: "Kids Fleece Full-Zip Jacket",
    gender: "kids",
    category: "Outerwear",
    sport: "Lifestyle",
    blurb: "Warm, light fleece for school runs.",
    price: 299000,
    rating: 4.7,
    reviews: 45,
    colors: [khaki, navy],
    sizes: sizes(),
    material: "100% polyester",
    fit: "Regular fit.",
  },
  {
    slug: "kids-dry-pants",
    name: "Kids Dry Pants",
    gender: "kids",
    category: "Bottoms",
    sport: "Training",
    blurb: "Stretchy pants that dry fast.",
    price: 199000,
    salePrice: 149000,
    rating: 4.4,
    reviews: 22,
    badge: "Sale",
    colors: [black],
    sizes: sizes(),
    material: "100% polyester",
    fit: "Regular fit.",
  },
]

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug)

export const formatIDR = (n: number) => `IDR ${n.toLocaleString("en-US")}`

export { FREE_DELIVERY } from "@/lib/pricing"

export const sizeRange = (p: Product) => {
  const s = p.sizes.map((x) => x.label.replace("A/", ""))
  return `${s[0]}-${s.at(-1)}`
}

// ponytail: Picsum stand-ins for campaign photography (no product shots yet)
export const photo = (id: number, w = 1200, h = 1500) => `https://picsum.photos/id/${id}/${w}/${h}`

export const CAMPAIGN: Record<Gender, { headline: string; sub: string; photo: number }> = {
  women: { headline: "Built for the long run", sub: "Quick-dry layers for cool mornings and late miles.", photo: 177 },
  men: { headline: "Light layers, big days", sub: "Weatherproof shells and tees that keep up.", photo: 1005 },
  kids: { headline: "Ready for recess", sub: "Soft, tough and easy to wash.", photo: 646 },
}

export const EDITORIAL = [
  { title: "Running x Artist", sub: "A limited collab with printmaker Rina Sato.", photo: 786 },
  { title: "The everyday layer", sub: "AIRism basics in new seasonal colours.", photo: 669 },
]

export const POPULAR_SEARCHES = ["Running tee", "AIRism", "Parka", "Jogger", "Kids fleece"]
