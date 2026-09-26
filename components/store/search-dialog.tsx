"use client"

import Link from "next/link"
import { useDeferredValue, useEffect, useState } from "react"
import { motion } from "motion/react"
import { ArrowUpRight, Search, SearchX, X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { EmptyState } from "@/components/store/empty-state"
import { Price } from "@/components/store/price"
import { ProductImage } from "@/components/store/product-image"
import { useStore } from "@/lib/store"
import { CATEGORIES, POPULAR_SEARCHES, PRODUCTS } from "@/lib/data"

const SYNONYMS: Record<string, string> = { tee: "t-shirt tee", hoody: "hoodie", pants: "jogger pants" }

// ponytail: client-side substring match over mock data; swap for GET /search/suggest (SRCH-2)
const search = (q: string) => {
  const terms = q.toLowerCase().split(/\s+/).map((t) => SYNONYMS[t] ?? t)
  return PRODUCTS.filter((p) => {
    const hay = `${p.name} ${p.category} ${p.sport} ${p.gender}`.toLowerCase()
    return terms.every((t) => t.split(" ").some((w) => hay.includes(w)))
  })
}

export function SearchDialog() {
  const { overlay, open } = useStore()
  const [q, setQ] = useState("")
  const deferred = useDeferredValue(q.trim())
  const results = deferred.length >= 2 ? search(deferred) : []
  const categories = deferred.length >= 2 ? CATEGORIES.filter((c) => c.toLowerCase().includes(deferred.toLowerCase())) : []
  const close = () => open(null)

  // "/" opens search from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]")
      if (e.key === "/" && !typing) {
        e.preventDefault()
        open("search")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <Dialog open={overlay === "search"} onOpenChange={(o) => !o && close()}>
      <DialogContent
        showCloseButton={false}
        className="top-0 max-h-[85dvh] max-w-none translate-y-0 gap-0 overflow-hidden p-0 data-open:slide-in-from-top-4 sm:top-[10dvh] sm:max-w-2xl"
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="flex items-center gap-3 border-b px-5">
          <Search className="size-5 shrink-0" strokeWidth={1.5} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tees, parkas, joggers"
            aria-label="Search products"
            className="h-16 flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="grid size-9 place-items-center hover:bg-mist">
              <X className="size-4" />
            </button>
          )}
          <kbd className="hidden border px-1.5 py-0.5 text-[11px] text-muted-foreground sm:block">Esc</kbd>
        </div>

        <div className="overflow-y-auto p-5">
          {deferred.length < 2 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((s) => (
                  <button key={s} type="button" onClick={() => setQ(s)} className="h-9 border px-4 text-sm transition-colors hover:border-foreground">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 && categories.length === 0 ? (
            <EmptyState icon={<SearchX />} title={`No results for "${deferred}"`} body="Check the spelling or try a broader word like tee, parka or jogger." className="py-8" />
          ) : (
            <div className="space-y-6">
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Link key={c} href={`/women/${c.toLowerCase()}`} onClick={close} className="flex h-9 items-center gap-1 bg-mist px-4 text-sm hover:bg-line">
                      {c} <ArrowUpRight className="size-3.5" />
                    </Link>
                  ))}
                </div>
              )}
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {results.slice(0, 8).map((p, i) => (
                  <motion.li key={p.slug} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Link href={`/product/${p.slug}`} onClick={close} className="group block space-y-2">
                      <div className="overflow-hidden">
                        <ProductImage color={p.colors[0]} alt="" className="transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug group-hover:underline">{p.name}</p>
                      <Price product={p} className="text-sm" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
