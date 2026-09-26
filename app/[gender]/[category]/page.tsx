import { notFound } from "next/navigation"
import { Catalog } from "./catalog"
import { GENDERS, type Gender } from "@/lib/data"

export default async function Page({ params, searchParams }: PageProps<"/[gender]/[category]">) {
  const { gender, category } = await params
  if (!GENDERS.includes(gender as Gender)) notFound()
  const sp = await searchParams
  const initial = Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, String(v ?? "").split(",").filter(Boolean)]))
  return <Catalog gender={gender as Gender} category={category} initial={initial} />
}
