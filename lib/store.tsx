"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { api, getProducts, refreshSession, setAccessToken, type User } from "@/lib/api"
import type { Product } from "@/lib/data"

/** One line in GET /cart */
export type CartItem = {
  id: string
  skuId: string
  slug: string
  name: string
  color: string
  colorHex: string
  colorTone: string
  size: string
  image?: string
  price: number
  salePrice?: number
  unitPrice: number
  qty: number
  lineTotal: number
  available: number
  maxQty: number
  voucherEligible: boolean
  issue: "sold_out" | "low_stock" | null
}

export type Cart = {
  items: CartItem[]
  count: number
  subtotal: number
  discount: number
  delivery: number
  total: number
  freeDeliveryRemaining: number
  promoCode: string | null
  promoError: string | null
  deliveryOptions: { standard: number; express: number }
}

export type Overlay = "bag" | "wishlist" | "search" | "auth" | "join" | null
export type BagInput = { slug: string; color: string; size: string }
type Credentials = { name?: string; email: string; password: string }

const EMPTY_CART: Cart = {
  items: [],
  count: 0,
  subtotal: 0,
  discount: 0,
  delivery: 0,
  total: 0,
  freeDeliveryRemaining: 500_000,
  promoCode: null,
  promoError: null,
  deliveryOptions: { standard: 0, express: 0 },
}

// Signed-out wishlist: slugs in localStorage, merged into the account on sign-in (PLP-8)
const LOCAL_WISHLIST = "MyWear-wishlist"
const readLocal = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_WISHLIST) ?? "[]") as string[]
  } catch {
    return []
  }
}
const writeLocal = (slugs: string[]) => {
  try {
    if (slugs.length) localStorage.setItem(LOCAL_WISHLIST, JSON.stringify(slugs))
    else localStorage.removeItem(LOCAL_WISHLIST)
  } catch {}
}

type Store = {
  user: User | null
  /** False until the saved session, bag and wishlist have loaded */
  ready: boolean
  signIn: (mode: "login" | "register", credentials: Credentials) => Promise<User>
  signOut: () => Promise<void>

  cart: Cart
  addToBag: (item: BagInput, qty?: number) => Promise<void>
  setQty: (itemId: string, qty: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearBag: () => Promise<void>
  applyPromo: (code: string) => Promise<void>
  removePromo: () => Promise<void>
  refreshCart: () => Promise<void>

  wishlist: Product[]
  isSaved: (slug: string) => boolean
  setSaved: (slug: string, on: boolean) => Promise<void>

  overlay: Overlay
  open: (o: Overlay) => void
  quickView: string | null
  openQuickView: (slug: string | null) => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [cart, setCart] = useState<Cart>(EMPTY_CART)
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [saved, setSavedSlugs] = useState<string[]>([])
  const [overlay, open] = useState<Overlay>(null)
  const [quickView, openQuickView] = useState<string | null>(null)

  const refreshCart = async () => setCart(await api<Cart>("/cart"))

  const showWishlist = (products: Product[]) => {
    setWishlist(products)
    setSavedSlugs(products.map((p) => p.slug))
  }

  const loadWishlist = async (signedIn: boolean) => {
    if (signedIn) return showWishlist(await api<Product[]>("/me/wishlist"))
    const slugs = readLocal()
    setSavedSlugs(slugs)
    if (!slugs.length) return setWishlist([])
    const { items } = await getProducts({ slugs: slugs.join(","), limit: 60 })
    setWishlist(slugs.flatMap((s) => items.find((p) => p.slug === s) ?? []))
  }

  // Restore the session from the refresh cookie, then load the bag and wishlist
  useEffect(() => {
    void (async () => {
      const restored = await refreshSession()
      setUser(restored)
      await Promise.allSettled([refreshCart(), loadWishlist(!!restored)])
      setReady(true)
    })()
    try {
      localStorage.removeItem("MyWear-bag") // pre-API bag; the bag lives on the server now
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value: Store = {
    user,
    ready,
    signIn: async (mode, credentials) => {
      const { accessToken, user: me } = await api<{ accessToken: string; user: User }>(`/auth/${mode}`, { method: "POST", body: credentials })
      setAccessToken(accessToken)
      setUser(me)
      // The API folds the guest bag into the account on sign-in; bring over the local wishlist too
      const local = readLocal()
      const merged = local.length ? await api<Product[]>("/me/wishlist/merge", { method: "POST", body: { slugs: local } }) : await api<Product[]>("/me/wishlist")
      writeLocal([])
      showWishlist(merged)
      await refreshCart()
      return me
    },
    signOut: async () => {
      await api("/auth/logout", { method: "POST" }).catch(() => undefined)
      setAccessToken(null)
      setUser(null)
      showWishlist([])
      await refreshCart().catch(() => setCart(EMPTY_CART))
    },

    cart,
    addToBag: async (item, qty = 1) => setCart(await api<Cart>("/cart/items", { method: "POST", body: { ...item, qty } })),
    setQty: async (itemId, qty) => setCart(await api<Cart>(`/cart/items/${itemId}`, { method: "PATCH", body: { qty } })),
    removeItem: async (itemId) => setCart(await api<Cart>(`/cart/items/${itemId}`, { method: "DELETE" })),
    clearBag: async () => setCart(await api<Cart>("/cart", { method: "DELETE" })),
    applyPromo: async (code) => setCart(await api<Cart>("/cart/promo", { method: "POST", body: { code } })),
    removePromo: async () => setCart(await api<Cart>("/cart/promo", { method: "DELETE" })),
    refreshCart,

    wishlist,
    isSaved: (slug) => saved.includes(slug),
    setSaved: async (slug, on) => {
      const before = saved
      setSavedSlugs(on ? [slug, ...saved.filter((s) => s !== slug)] : saved.filter((s) => s !== slug)) // optimistic heart
      try {
        if (user) await api(`/me/wishlist/${encodeURIComponent(slug)}`, { method: on ? "PUT" : "DELETE" })
        else writeLocal(on ? [slug, ...readLocal().filter((s) => s !== slug)] : readLocal().filter((s) => s !== slug))
        await loadWishlist(!!user)
      } catch (e) {
        setSavedSlugs(before)
        throw e
      }
    },

    overlay,
    open,
    quickView,
    openQuickView,
  }

  return <StoreContext value={value}>{children}</StoreContext>
}

export const useStore = () => {
  const s = useContext(StoreContext)
  if (!s) throw new Error("useStore must be used inside StoreProvider")
  return s
}
