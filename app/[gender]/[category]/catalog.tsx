"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, ChevronDown, SearchX, SlidersHorizontal, X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { EmptyState } from "@/components/store/empty-state"
import { ProductCard } from "@/components/store/product-card"
import { CATEGORIES, PRODUCTS, type Gender, type Product } from "@/lib/data"
import { cn } from "@/lib/utils"

type Filters = Record<string, string[]>
type Facet = { key: string; label: string; values: string[]; match: (p: Product, v: string) => boolean }

const PRICE_BANDS: Record<string, (n: number) => boolean> = {
  "Under IDR 300,000": (n) => n < 300000,
  "IDR 300,000 to 600,000": (n) => n >= 300000 && n <= 600000,
  "Over IDR 600,000": (n) => n > 600000,
}

const COLOURS: Record<string, string> = {
  Black: "#111111",
  "Off White": "#f2efe8",
  Navy: "#1f2a44",
  Sage: "#8fa38a",
  "Craft Khaki": "#8a7f63",
}

const FACETS: Facet[] = [
  { key: "category", label: "Category", values: CATEGORIES, match: (p, v) => p.category === v },
  { key: "size", label: "Size", values: ["A/XS", "A/S", "A/M", "A/L", "A/XL"], match: (p, v) => p.sizes.some((s) => s.label === v && s.stock > 0) },
  { key: "colour", label: "Colour", values: Object.keys(COLOURS), match: (p, v) => p.colors.some((c) => c.name === v) },
  { key: "price", label: "Price", values: Object.keys(PRICE_BANDS), match: (p, v) => PRICE_BANDS[v](p.salePrice ?? p.price) },
  { key: "badge", label: "Offers", values: ["New", "Sale", "Limited"], match: (p, v) => p.badge === v },
  { key: "fit", label: "Fit", values: ["Regular", "Relaxed", "Slim", "Tapered"], match: (p, v) => p.fit.startsWith(v) },
  { key: "sport", label: "Sport", values: ["Running", "Training", "Lifestyle"], match: (p, v) => p.sport === v },
]

const SUBTYPES = ["Tee", "Long Sleeve", "Tank", "Half-Zip", "Jacket", "Jogger"]

const SORTS = {
  recommended: "Recommended",
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
}

const PAGE = 24
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

type FacetProps = { facet: Facet; selected: string[]; toggle: (k: string, v: string) => void; count: (k: string, v: string) => number }

/** The options for one facet: size chips, colour swatches, or checkbox rows. Shared by the dropdowns and the All filters drawer. */
function FacetOptions({ facet, selected, toggle, count }: FacetProps) {
  if (facet.key === "size")
    return (
      <div className="grid grid-cols-3 gap-2">
        {facet.values.map((v) => {
          const on = selected.includes(v)
          return (
            <button
              key={v}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(facet.key, v)}
              className={cn(
                "h-11 border text-[13px] transition-colors duration-[120ms]",
                on ? "border-foreground shadow-[inset_0_0_0_1px_var(--ink)]" : "hover:border-foreground/50",
              )}
            >
              {v}
            </button>
          )
        })}
      </div>
    )

  if (facet.key === "colour")
    return (
      <div className="grid grid-cols-3 gap-x-2 gap-y-4">
        {facet.values.map((v) => {
          const on = selected.includes(v)
          const n = count(facet.key, v)
          return (
            <button
              key={v}
              type="button"
              aria-pressed={on}
              aria-label={`${v}, ${n} items`}
              onClick={() => toggle(facet.key, v)}
              className={cn("flex flex-col items-center gap-1.5 text-xs", n === 0 && !on && "opacity-40")}
            >
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-full ring-1 ring-line ring-offset-2 transition-shadow",
                  on && "ring-2 ring-foreground",
                )}
                style={{ background: COLOURS[v] }}
              >
                {on && <Check className={cn("size-4", v === "Off White" ? "text-foreground" : "text-background")} />}
              </span>
              {v}
            </button>
          )
        })}
      </div>
    )

  return (
    <ul className="space-y-0.5">
      {facet.values.map((v) => {
        const n = count(facet.key, v)
        return (
          <li key={v}>
            <label className={cn("flex min-h-10 cursor-pointer items-center gap-3 text-sm", n === 0 && "text-muted-foreground")}>
              <Checkbox checked={selected.includes(v)} onCheckedChange={() => toggle(facet.key, v)} className="size-5" />
              <span className="flex-1">{v}</span>
              <span className="tabular text-xs text-muted-foreground">{n}</span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}

/** One Uniqlo-style filter button in the bar; opens its options in a dropdown. */
function FacetDropdown({
  facet,
  selected,
  toggle,
  count,
  clear,
  total,
  open,
  onOpenChange,
}: FacetProps & { clear: () => void; total: number; open: boolean; onOpenChange: (o: boolean) => void }) {
  const active = selected.length > 0
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "flex h-10 shrink-0 items-center gap-1.5 border px-4 text-sm transition-colors duration-[120ms]",
              active ? "border-foreground bg-foreground text-background" : "hover:border-foreground",
              open && !active && "border-foreground",
            )}
          />
        }
      >
        {facet.label}
        {active && <span className="tabular text-xs opacity-80">({selected.length})</span>}
        <ChevronDown className={cn("size-4 transition-transform duration-[240ms]", open && "rotate-180")} />
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-80 gap-0 p-0 shadow-[0_12px_40px_rgba(17,17,17,.14)]">
        <div className="max-h-[50dvh] overflow-y-auto p-5">
          <FacetOptions facet={facet} selected={selected} toggle={toggle} count={count} />
        </div>
        <div className="flex items-center gap-2 border-t p-3">
          <Button variant="ghost" disabled={!active} onClick={clear} className="h-10 flex-1 text-sm underline underline-offset-4">
            Clear
          </Button>
          <Button onClick={() => onOpenChange(false)} className="h-10 flex-[2] font-semibold">
            Show {total} results
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function Catalog({ gender, category, initial }: { gender: Gender; category: string; initial: Filters }) {
  const [filters, setFilters] = useState<Filters>(() => {
    const f: Filters = {}
    for (const facet of FACETS) if (initial[facet.key]) f[facet.key] = initial[facet.key]
    if (category !== "all" && !f.category) f.category = [cap(category)]
    return f
  })
  const [sort, setSort] = useState<keyof typeof SORTS>((initial.sort?.[0] as keyof typeof SORTS) ?? "recommended")
  const [subtype, setSubtype] = useState<string | null>(null)
  const [shown, setShown] = useState(PAGE)
  const [openFacet, setOpenFacet] = useState<string | null>(null)

  // Keep filters shareable and back-button safe (PLP-4)
  useEffect(() => {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(filters)) if (v.length) q.set(k, v.join(","))
    if (sort !== "recommended") q.set("sort", sort)
    const s = q.toString()
    window.history.replaceState(null, "", s ? `?${s}` : window.location.pathname)
  }, [filters, sort])

  const base = PRODUCTS.filter((p) => p.gender === gender && (!subtype || p.name.toLowerCase().includes(subtype.toLowerCase())))
  const apply = (f: Filters) => base.filter((p) => FACETS.every((facet) => !f[facet.key]?.length || f[facet.key].some((v) => facet.match(p, v))))

  const results = useMemo(() => {
    const list = apply(filters)
    const price = (p: Product) => p.salePrice ?? p.price
    if (sort === "price-asc") list.sort((a, b) => price(a) - price(b))
    if (sort === "price-desc") list.sort((a, b) => price(b) - price(a))
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating)
    if (sort === "newest") list.sort((a, b) => Number(b.badge === "New") - Number(a.badge === "New"))
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, gender, subtype])

  const toggle = (k: string, v: string) =>
    setFilters((f) => {
      const cur = f[k] ?? []
      return { ...f, [k]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] }
    })
  const clearFacet = (k: string) => setFilters((f) => ({ ...f, [k]: [] }))
  const clearAll = () => {
    setFilters({})
    setSubtype(null)
  }
  const count = (k: string, v: string) => apply({ ...filters, [k]: [v] }).length
  const applied = Object.entries(filters).flatMap(([k, vs]) => vs.map((v) => ({ k, v })))
  const title = category === "all" ? `${cap(gender)}'s clothing` : `${cap(gender)}'s ${category}`

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-6 md:px-10 md:pt-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={`/${gender}/all`} />}>{cap(gender)}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{category === "all" ? "All" : cap(category)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mt-3 font-heading text-[2.25rem] leading-none font-bold md:text-[3rem]">{title}</h1>

      {/* Sub-category tiles, like Uniqlo's category shortcuts */}
      <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
        {SUBTYPES.map((t) => {
          const on = subtype === t
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              onClick={() => setSubtype(on ? null : t)}
              className={cn(
                "h-10 shrink-0 px-5 text-sm font-medium transition-colors duration-[120ms] active:scale-[0.98]",
                on ? "bg-foreground text-background" : "bg-mist hover:bg-line/70",
              )}
            >
              {t}
            </button>
          )
        })}
      </div>

      {/* Horizontal filter bar */}
      <div className="sticky top-0 z-30 -mx-4 mt-6 border-y bg-background/95 px-4 backdrop-blur-md md:-mx-10 md:px-10">
        <div className="flex items-center gap-3 py-3">
          <div className="-my-3 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-3 pr-8 [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] [scrollbar-width:none]">
            <Sheet>
              <SheetTrigger
                render={<button type="button" className="flex h-10 shrink-0 items-center gap-2 border border-foreground px-4 text-sm font-semibold transition-colors hover:bg-mist" />}
              >
                <SlidersHorizontal className="size-4" /> All filters
                {applied.length > 0 && <span className="tabular grid size-5 place-items-center rounded-full bg-foreground text-[11px] text-background">{applied.length}</span>}
              </SheetTrigger>
              <SheetContent side="right" className="w-full gap-0 p-0 shadow-[0_0_24px_rgba(17,17,17,.12)] sm:max-w-md">
                <SheetTitle className="border-b px-5 py-4 font-heading text-2xl font-bold">All filters</SheetTitle>
                <div className="flex-1 overflow-y-auto px-5">
                  <Accordion multiple defaultValue={FACETS.map((f) => f.key)}>
                    {FACETS.map((f) => (
                      <AccordionItem key={f.key} value={f.key} className="border-b">
                        <AccordionTrigger className="py-4 text-[15px] font-semibold hover:no-underline">
                          {f.label}
                          {!!filters[f.key]?.length && <span className="ml-1 font-normal text-muted-foreground">({filters[f.key].length})</span>}
                        </AccordionTrigger>
                        <AccordionContent className="pb-5">
                          <FacetOptions facet={f} selected={filters[f.key] ?? []} toggle={toggle} count={count} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
                <SheetFooter className="flex-row border-t p-4">
                  <Button variant="outline" className="h-13 flex-1 border-foreground" onClick={clearAll}>
                    Clear all
                  </Button>
                  <SheetClose render={<Button className="h-13 flex-[2] font-heading text-base font-semibold" />}>Show {results.length} results</SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-line" />

            {FACETS.map((f) => (
              <FacetDropdown
                key={f.key}
                facet={f}
                selected={filters[f.key] ?? []}
                toggle={toggle}
                count={count}
                clear={() => clearFacet(f.key)}
                total={results.length}
                open={openFacet === f.key}
                onOpenChange={(o) => setOpenFacet(o ? f.key : null)}
              />
            ))}
          </div>

          <div className="hidden shrink-0 items-center gap-4 md:flex">
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">
              {results.length} items
            </p>
            <Select items={SORTS} value={sort} onValueChange={(v) => v && setSort(v as keyof typeof SORTS)}>
              <SelectTrigger aria-label="Sort" className="h-10 min-w-52 px-3">
                <span className="text-muted-foreground">Sort by:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {Object.entries(SORTS).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="h-10">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile: count + sort on their own row */}
        <div className="flex items-center justify-between gap-3 border-t py-2 md:hidden">
          <p className="tabular text-sm text-muted-foreground" aria-live="polite">
            {results.length} items
          </p>
          <Select items={SORTS} value={sort} onValueChange={(v) => v && setSort(v as keyof typeof SORTS)}>
            <SelectTrigger aria-label="Sort" className="h-9 border-0 px-0 font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {Object.entries(SORTS).map(([value, label]) => (
                <SelectItem key={value} value={value} className="h-10">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applied filter chips */}
      <AnimatePresence initial={false}>
        {(applied.length > 0 || subtype) && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 pt-5">
              <AnimatePresence initial={false}>
                {[...(subtype ? [{ k: "subtype", v: subtype }] : []), ...applied].map(({ k, v }) => (
                  <motion.button
                    layout
                    key={k + v}
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => (k === "subtype" ? setSubtype(null) : toggle(k, v))}
                    aria-label={`Remove filter ${v}`}
                    className="flex h-8 items-center gap-1.5 border px-3 text-xs font-medium transition-colors hover:border-foreground"
                  >
                    {v} <X className="size-3.5" />
                  </motion.button>
                ))}
              </AnimatePresence>
              <button type="button" onClick={clearAll} className="ml-1 text-xs font-medium underline underline-offset-4 hover:no-underline">
                Clear all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-width grid */}
      <div className="mt-8">
        {results.length === 0 ? (
          <EmptyState icon={<SearchX />} title="No items match" body="Remove a filter or try another size.">
            <Button variant="outline" className="h-12 w-full border-foreground" onClick={clearAll}>
              Clear all filters
            </Button>
          </EmptyState>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {results.slice(0, shown).map((p) => (
                <motion.div
                  layout
                  key={p.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {results.length > 0 && (
          <div className="mt-16 flex flex-col items-center gap-4">
            <p className="tabular text-sm text-muted-foreground">
              Showing {Math.min(shown, results.length)} of {results.length}
            </p>
            {shown < results.length && (
              <Button variant="outline" className="h-13 w-60 border-foreground font-heading text-base font-semibold" onClick={() => setShown(shown + PAGE)}>
                Load more
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
