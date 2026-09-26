"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getProduct, type Product } from "@/lib/data"
import { checkPromo, lineTotal, promoDiscount } from "@/lib/pricing"

export type CartLine = { slug: string; color: string; size: string; qty: number }
export type Overlay = "bag" | "wishlist" | "search" | "auth" | null

type Store = {
  lines: (CartLine & { product: Product })[]
  count: number
  subtotal: number
  promo: string | null
  discount: number
  applyPromo: (code: string | null) => string | null
  add: (line: Omit<CartLine, "qty">, qty?: number) => void
  setQty: (i: number, qty: number) => void
  remove: (i: number) => CartLine
  clear: () => void

  wishlist: Product[]
  isSaved: (slug: string) => boolean
  setSaved: (slug: string, on: boolean) => void

  overlay: Overlay
  open: (o: Overlay) => void
  quickView: string | null
  openQuickView: (slug: string | null) => void
}

const StoreContext = createContext<Store | null>(null)

const read = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "") as T
  } catch {
    return fallback
  }
}
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

// ponytail: bag + wishlist live in localStorage; swap for /cart and /me/wishlist (BAG-7, PLP-8) once the API exists
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useState<CartLine[]>([])
  const [saved, setSaved] = useState<string[]>([])
  const [overlay, open] = useState<Overlay>(null)
  const [quickView, openQuickView] = useState<string | null>(null)
  const [promo, setPromo] = useState<string | null>(null)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate from storage after mount */
    setRaw(read("fieldwear-bag", []))
    setSaved(read("fieldwear-wishlist", []))
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  // Functional updates so actions fired later (e.g. a toast's Undo) apply to the latest bag, not a stale render
  const updateBag = (fn: (prev: CartLine[]) => CartLine[]) =>
    setRaw((prev) => {
      const next = fn(prev)
      write("fieldwear-bag", next)
      return next
    })
  const setSavedTo = (slug: string, on: boolean) =>
    setSaved((prev) => {
      const next = on ? [slug, ...prev.filter((s) => s !== slug)] : prev.filter((s) => s !== slug)
      write("fieldwear-wishlist", next)
      return next
    })

  const lines = raw.flatMap((l) => {
    const product = getProduct(l.slug)
    return product ? [{ ...l, product }] : []
  })

  const value: Store = {
    lines,
    count: lines.reduce((n, l) => n + l.qty, 0),
    subtotal: lines.reduce((n, l) => n + lineTotal(l), 0),
    promo,
    discount: promoDiscount(lines, promo),
    applyPromo: (code) => {
      if (code === null) {
        setPromo(null)
        return null
      }
      const error = checkPromo(lines, code)
      if (!error) setPromo(code.trim().toUpperCase())
      return error
    },
    add: (line, qty = 1) =>
      updateBag((prev) => {
        const i = prev.findIndex((l) => l.slug === line.slug && l.color === line.color && l.size === line.size)
        if (i === -1) return [...prev, { slug: line.slug, color: line.color, size: line.size, qty }]
        return prev.map((l, j) => (j === i ? { ...l, qty: Math.min(10, l.qty + qty) } : l))
      }),
    setQty: (i, qty) => updateBag((prev) => prev.map((l, j) => (j === i ? { ...l, qty: Math.max(1, Math.min(10, qty)) } : l))),
    remove: (i) => {
      updateBag((prev) => prev.filter((_, j) => j !== i))
      return raw[i]
    },
    clear: () => updateBag(() => []),

    wishlist: saved.flatMap((s) => getProduct(s) ?? []),
    isSaved: (slug) => saved.includes(slug),
    setSaved: setSavedTo,

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
