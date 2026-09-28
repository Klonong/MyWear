import { HomeView } from "./home-view"
import { getProducts } from "@/lib/api"
import { GENDERS, type Gender, type Product } from "@/lib/data"

export default async function Home() {
  // Each gender's newest pieces plus the sale edit, cached for a minute. If the API is down the page
  // still renders the hero and editorial, and the product rails stay hidden.
  const [genders, sale] = await Promise.all([
    Promise.all(GENDERS.map((gender) => getProducts({ gender, sort: "newest", limit: 24 }).then((r) => r.items).catch(() => [] as Product[]))),
    getProducts({ badge: "Sale", limit: 12 })
      .then((r) => r.items)
      .catch(() => [] as Product[]),
  ])
  const byGender = Object.fromEntries(GENDERS.map((g, i) => [g, genders[i]])) as Record<Gender, Product[]>
  return <HomeView byGender={byGender} sale={sale} />
}
