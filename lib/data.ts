export type Gender = "women" | "men" | "kids"

/** `image` is a real cutout for this colour; without it the card draws a placeholder. */
export type Color = {
  name: string
  hex: string
  tone: string
  image?: string
  images?: { url: string; alt: string }[]
  /** Stock for this colour (API). Falls back to the product-level sizes. */
  sizes?: { label: string; stock: number }[]
}

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
  categorySlug?: string
  voucherEligible?: boolean
}

export const GENDERS: Gender[] = ["women", "men", "kids"]
export const NAV = ["New", "Women", "Men", "Kids", "Sports", "Lifestyle", "Sale"]
export const CATEGORIES = ["Tops", "Bottoms", "Outerwear", "Knitwear", "Innerwear", "Accessories"]

export const formatIDR = (n: number) => `IDR ${n.toLocaleString("en-US")}`

/** Marketing copy only; the API decides actual delivery fees */
export const FREE_DELIVERY = 500_000

export const sizeRange = (p: Product) => {
  const s = p.sizes.map((x) => x.label.replace("A/", ""))
  return `${s[0]}-${s.at(-1)}`
}

// ponytail: Picsum stand-ins for campaign photography (no product shots yet)
export const photo = (id: number, w = 1200, h = 1500) => `https://picsum.photos/id/${id}/${w}/${h}`

export const EDITORIAL = [
  { title: "Running x Artist", sub: "A limited collab with printmaker Rina Sato.", photo: 786 },
  { title: "The everyday layer", sub: "AIRism basics in new seasonal colours.", photo: 669 },
]

export const POPULAR_SEARCHES = ["Running tee", "AIRism", "Parka", "Jogger", "Kids fleece"]
