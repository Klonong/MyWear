import { notFound } from "next/navigation"
import { Catalog } from "./catalog"
import { initialFilters, toQuery } from "./query"
import { api, getProducts } from "@/lib/api"
import { GENDERS, type Gender } from "@/lib/data"

export default async function Page({ params, searchParams }: PageProps<"/[gender]/[category]">) {
  const { gender, category } = await params
  if (!GENDERS.includes(gender as Gender)) notFound()
  const sp = await searchParams
  const initial = Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, String(v ?? "").split(",").filter(Boolean)]))
  const sort = initial.sort?.[0] ?? "recommended"
  const q = initial.q?.[0] ?? null
  // First page renders on the server; the client takes over when filters change
  const [data, categories] = await Promise.all([
    getProducts(toQuery(gender as Gender, initialFilters(category, initial), sort, q)),
    api<{ id: string; slug: string; name: string; parentId: string | null; productCount: number }[]>(`/categories?gender=${gender}`, { revalidate: 60 }),
  ])
  // Shortcut chips, like Uniqlo's: the subcategories of this category (all of them on /all) that have products
  const parent = categories.find((c) => !c.parentId && c.slug === category)
  const subcategories = categories
    .filter((c) => c.parentId && c.productCount > 0 && (category === "all" || c.parentId === parent?.id))
    .map((c) => c.name)
  return <Catalog gender={gender as Gender} category={category} initial={initial} initialData={data} subcategories={subcategories} />
}
