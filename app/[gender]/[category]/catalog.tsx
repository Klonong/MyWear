"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, ChevronDown, SearchX, SlidersHorizontal, X } from "lucide-react"
import { toast } from "sonner"
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
import { getProducts, messageOf, type ProductList } from "@/lib/api"
import { CATEGORIES, type Gender } from "@/lib/data"
import { cn } from "@/lib/utils"
import { cap, initialFilters, PRICE_BANDS, toQuery, type Filters } from "./query"

type Facet = { key: string; label: string; values: string[]; hexOf?: (colour: string) => string | undefined }

const COLOURS: Record<string, string> = {
  Black: "#111111",
  "Off White": "#f2efe8",
  Navy: "#1f2a44",
  Sage: "#8fa38a",
  "Craft Khaki": "#8a7f63",
}

const FACETS: Facet[] = [
  { key: "category", label: "Category", values: CATEGORIES },
  { key: "size", label: "Size", values: ["A/XS", "A/S", "A/M", "A/L", "A/XL"] },
  { key: "colour", label: "Colour", values: Object.keys(COLOURS) },
  { key: "price", label: "Price", values: Object.keys(PRICE_BANDS) },
  { key: "badge", label: "Offers", values: ["New", "Sale", "Limited"] },
  { key: "fit", label: "Fit", values: ["Regular", "Relaxed", "Slim", "Tapered"] },
  { key: "sport", label: "Sport", values: ["Running", "Training", "Lifestyle"] },
]

const SUBTYPES = ["Tee", "Long Sleeve", "Tank", "Half-Zip", "Jacket", "Jogger"]

const SORTS = {
  recommended: "Recommended",
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
}

/** Count per option from the API's facets; undefined where the API doesn't count (price) */
type FacetProps = { facet: Facet; selected: string[]; toggle: (k: string, v: string) => void; count: (k: string, v: string) => number | undefined }

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
              aria-label={n === undefined ? v : `${v}, ${n} items`}
              onClick={() => toggle(facet.key, v)}
              className={cn("flex flex-col items-center gap-1.5 text-xs", n === 0 && !on && "opacity-40")}
            >
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-full ring-1 ring-line ring-offset-2 transition-shadow",
                  on && "ring-2 ring-foreground",
                )}
                style={{ background: facet.hexOf?.(v) ?? COLOURS[v] ?? "var(--line)" }}
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
              {n !== undefined && <span className="tabular text-xs text-muted-foreground">{n}</span>}
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

export function Catalog({ gender, category, initial, initialData }: { gender: Gender; category: string; initial: Filters; initialData: ProductList }) {
  const [filters, setFilters] = useState<Filters>(() => initialFilters(category, initial))
  const [sort, setSort] = useState<keyof typeof SORTS>((initial.sort?.[0] as keyof typeof SORTS) ?? "recommended")
  const [subtype, setSubtype] = useState<string | null>(initial.q?.[0] ?? null)
  const [data, setData] = useState(initialData)
  const [items, setItems] = useState(initialData.items)
  const [loading, setLoading] = useState(false)
  const [openFacet, setOpenFacet] = useState<string | null>(null)
  const latest = useRef(0)

  /** Fetch from the API. Only the newest request may update the grid, so fast clicking never shows stale results. */
  const load = (f: Filters, s: string, q: string | null, page = 1) => {
    const id = ++latest.current
    setLoading(true)
    getProducts(toQuery(gender, f, s, q, page))
      .then((next) => {
        if (id !== latest.current) return
        setData(next)
        setItems((prev) => (page === 1 ? next.items : [...prev, ...next.items]))
      })
      .catch((e) => id === latest.current && toast.error(messageOf(e)))
      .finally(() => id === latest.current && setLoading(false))
  }

  /** Apply a change: update state, keep the URL shareable and back-button safe (PLP-4), refetch */
  const update = (next: { filters?: Filters; sort?: keyof typeof SORTS; subtype?: string | null }) => {
    const f = next.filters ?? filters
    const s = next.sort ?? sort
    const q = next.subtype !== undefined ? next.subtype : subtype
    setFilters(f)
    setSort(s)
    setSubtype(q)
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(f)) if (v.length) params.set(k, v.join(","))
    if (s !== "recommended") params.set("sort", s)
    if (q) params.set("q", q)
    const qs = params.toString()
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname)
    load(f, s, q)
  }

  const toggle = (k: string, v: string) => {
    const cur = filters[k] ?? []
    const on = cur.includes(v)
    // price is one range at a time; everything else is multi-select
    const nextValues = k === "price" ? (on ? [] : [v]) : on ? cur.filter((x) => x !== v) : [...cur, v]
    update({ filters: { ...filters, [k]: nextValues } })
  }
  const clearFacet = (k: string) => update({ filters: { ...filters, [k]: [] } })
  const clearAll = () => update({ filters: {}, subtype: null })
  const setSubtypeTo = (t: string | null) => update({ subtype: t })
  const count = (k: string, v: string) => (k === "price" ? undefined : (data.facets[k]?.find((f) => f.value === v)?.count ?? 0))

  // Options: the known list plus anything new the API reports (e.g. a colour added in admin)
  const hexes = new Map(items.flatMap((p) => p.colors.map((c) => [c.name, c.hex] as const)))
  const facets = FACETS.map((f) => ({
    ...f,
    values: [...f.values, ...(data.facets[f.key] ?? []).map((x) => x.value).filter((v) => !f.values.includes(v))],
    ...(f.key === "colour" && { hexOf: (c: string) => COLOURS[c] ?? hexes.get(c) }),
  }))
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
              onClick={() => setSubtypeTo(on ? null : t)}
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
                  <Accordion multiple defaultValue={facets.map((f) => f.key)}>
                    {facets.map((f) => (
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
                  <SheetClose render={<Button className="h-13 flex-[2] font-heading text-base font-semibold" />}>Show {data.total} results</SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-line" />

            {facets.map((f) => (
              <FacetDropdown
                key={f.key}
                facet={f}
                selected={filters[f.key] ?? []}
                toggle={toggle}
                count={count}
                clear={() => clearFacet(f.key)}
                total={data.total}
                open={openFacet === f.key}
                onOpenChange={(o) => setOpenFacet(o ? f.key : null)}
              />
            ))}
          </div>

          <div className="hidden shrink-0 items-center gap-4 md:flex">
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">
              {data.total} items
            </p>
            <Select items={SORTS} value={sort} onValueChange={(v) => v && update({ sort: v as keyof typeof SORTS })}>
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
            {data.total} items
          </p>
          <Select items={SORTS} value={sort} onValueChange={(v) => v && update({ sort: v as keyof typeof SORTS })}>
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
                    onClick={() => (k === "subtype" ? setSubtypeTo(null) : toggle(k, v))}
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
        {data.total === 0 ? (
          <EmptyState icon={<SearchX />} title="No items match" body="Remove a filter or try another size.">
            <Button variant="outline" className="h-12 w-full border-foreground" onClick={clearAll}>
              Clear all filters
            </Button>
          </EmptyState>
        ) : (
          <motion.div layout aria-busy={loading} className={cn("grid grid-cols-2 gap-x-3 gap-y-10 transition-opacity duration-200 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4", loading && "opacity-50")}>
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((p) => (
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

        {data.total > 0 && (
          <div className="mt-16 flex flex-col items-center gap-4">
            <p className="tabular text-sm text-muted-foreground">
              Showing {items.length} of {data.total}
            </p>
            {items.length < data.total && (
              <Button variant="outline" className="h-13 w-60 border-foreground font-heading text-base font-semibold" disabled={loading} onClick={() => load(filters, sort, subtype, data.page + 1)}>
                {loading ? "Loading..." : "Load more"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
