import type { Gender } from "@/lib/data"

/** Shared by the server page (first render) and the client catalogue (refetches), so both ask the API the same thing. */
export type Filters = Record<string, string[]>

export const PAGE = 24
export const FILTER_KEYS = ["category", "size", "colour", "price", "badge", "fit", "sport"]

/** Price is single-select: the API filters one min/max range */
export const PRICE_BANDS: Record<string, [number | undefined, number | undefined]> = {
  "Under IDR 300,000": [undefined, 299_999],
  "IDR 300,000 to 600,000": [300_000, 600_000],
  "Over IDR 600,000": [600_001, undefined],
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Filters from the URL, plus the category in the path (/women/tops) */
export function initialFilters(category: string, params: Filters): Filters {
  const f: Filters = {}
  for (const key of FILTER_KEYS) if (params[key]?.length) f[key] = params[key]
  if (category !== "all" && !f.category) f.category = [cap(category)]
  return f
}

export function toQuery(gender: Gender, filters: Filters, sort: string, q: string | null, page = 1) {
  const [priceMin, priceMax] = PRICE_BANDS[filters.price?.[0] ?? ""] ?? []
  const list = (key: string) => filters[key]?.join(",") || undefined
  return {
    gender,
    category: list("category"),
    size: list("size"),
    colour: list("colour"),
    badge: list("badge"),
    fit: list("fit"),
    sport: list("sport"),
    priceMin,
    priceMax,
    q: q ?? undefined,
    sort: sort === "recommended" ? undefined : sort,
    page,
    limit: PAGE,
  }
}
