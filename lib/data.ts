export type Gender = "women" | "men" | "kids"

/** `images` is this colour's photo gallery (first = cover); without photos the card draws a placeholder. */
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
  /** Public product ID, like Uniqlo's style code */
  code?: string
  name: string
  gender: Gender
  category: string
  subcategory?: string
  sport: string
  blurb: string
  /** Overview bullets */
  features?: string[]
  /** Washing information */
  care?: string
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

/** Campaign tiles: product photos from the R2 bucket, each linking to its product */
export const EDITORIAL = [
  {
    title: "The knit edit",
    sub: "Soft knits and fine merino for cooler days.",
    image: "https://pub-b5b9858df58b434298c0e9668c82e05d.r2.dev/products/8916ef05-3dde-4392-9020-657a8d2a7dec.jpg",
    href: "/product/soft-knit-crew-sweater",
  },
  {
    title: "Light down, all day",
    sub: "Packs into its own pouch. Warm without the weight.",
    image: "https://pub-b5b9858df58b434298c0e9668c82e05d.r2.dev/products/8b35c8d0-4076-4162-bd8d-f9ea7e429508.jpg",
    href: "/product/light-down-puffer-jacket",
  },
]

export const POPULAR_SEARCHES = ["Running tee", "AIRism", "Parka", "Jogger", "Kids fleece"]
