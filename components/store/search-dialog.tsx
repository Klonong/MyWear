"use client"

import Link from "next/link"
import { useDeferredValue, useEffect, useState } from "react"
import { motion } from "motion/react"
import { ArrowUpRight, Search, SearchX, X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { EmptyState } from "@/components/store/empty-state"
import { Price } from "@/components/store/price"
import { ProductImage } from "@/components/store/product-image"
import { api, messageOf } from "@/lib/api"
import { POPULAR_SEARCHES, type Gender, type Product } from "@/lib/data"
import { useStore } from "@/lib/store"

type Suggestions = { categories: { gender: Gender; name: string; slug: string }[]; products: Product[]; total: number }

export function SearchDialog() {
  const { overlay, open } = useStore()
  const [q, setQ] = useState("")
  const deferred = useDeferredValue(q.trim())
  const [found, setFound] = useState<{ q: string; data?: Suggestions; error?: string } | null>(null)
  const close = () => open(null)

  // Live suggestions after 2 characters, debounced 200ms (SRCH-2)
  useEffect(() => {
    if (deferred.length < 2) return
    const timer = setTimeout(() => {
      api<Suggestions>(`/search/suggest?q=${encodeURIComponent(deferred)}`)
        .then((data) => setFound({ q: deferred, data }))
        .catch((e) => setFound({ q: deferred, error: messageOf(e) }))
    }, 200)
    return () => clearTimeout(timer)
  }, [deferred])

  const current = found?.q === deferred ? found : null
  const results = current?.data?.products ?? []
  const categories = current?.data?.categories ?? []

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
          ) : !current ? (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4" aria-busy="true" aria-label="Searching">
              {Array.from({ length: 4 }, (_, i) => (
                <li key={i} className="space-y-2">
                  <div className="aspect-[4/5] animate-pulse bg-studio" />
                  <div className="h-4 w-4/5 animate-pulse bg-mist" />
                </li>
              ))}
            </ul>
          ) : current.error ? (
            <EmptyState icon={<SearchX />} title="Search isn't available" body={current.error} className="py-8" />
          ) : results.length === 0 && categories.length === 0 ? (
            <EmptyState icon={<SearchX />} title={`No results for "${deferred}"`} body="Check the spelling or try a broader word like tee, parka or jogger." className="py-8" />
          ) : (
            <div className="space-y-6">
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Link key={`${c.gender}-${c.slug}`} href={`/${c.gender}/${c.slug}`} onClick={close} className="flex h-9 items-center gap-1 bg-mist px-4 text-sm capitalize hover:bg-line">
                      {c.gender}&apos;s {c.name.toLowerCase()} <ArrowUpRight className="size-3.5" />
                    </Link>
                  ))}
                </div>
              )}
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {results.map((p, i) => (
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
