"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { ArrowRight, RotateCcw, Store, Truck } from "lucide-react"
import { ProductCard } from "@/components/store/product-card"
import { ProductImage } from "@/components/store/product-image"
import { ProductRail } from "@/components/store/product-rail"
import { Reveal } from "@/components/store/reveal"
import { ScrollHero } from "@/components/store/scroll-hero"
import { SectionHeader } from "@/components/store/section-header"
import { CATEGORIES, EDITORIAL, GENDERS, photo, type Gender, type Product } from "@/lib/data"
import { cn } from "@/lib/utils"

function GenderTabs({ value, onChange }: { value: Gender; onChange: (g: Gender) => void }) {
  return (
    <div role="tablist" aria-label="Shop for" className="flex gap-8 border-b">
      {GENDERS.map((g) => (
        <button
          key={g}
          role="tab"
          aria-selected={value === g}
          onClick={() => onChange(g)}
          className={cn(
            "relative h-12 font-heading text-lg font-semibold tracking-[0.04em] uppercase transition-colors",
            value === g ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {g}
          {value === g && <motion.span layoutId="gender-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground" />}
        </button>
      ))}
    </div>
  )
}

function CategoryChips({ gender, products }: { gender: Gender; products: Product[] }) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-10">
      <SectionHeader title="Shop by category" />
      <div className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-6 md:px-0">
        {CATEGORIES.map((c, i) => (
          <Link key={c} href={`/${gender}/${c.toLowerCase()}`} className="group flex w-24 shrink-0 flex-col items-center gap-3 text-center text-sm font-medium md:w-auto">
            <span className="block aspect-square w-full overflow-hidden rounded-full bg-studio ring-offset-4 transition-shadow group-hover:ring-1 group-hover:ring-foreground">
              {products.length > 0 && (
                <ProductImage color={products[(i * 3) % products.length].colors[0]} alt="" className="bg-transparent transition-transform duration-500 group-hover:scale-110" />
              )}
            </span>
            {c}
          </Link>
        ))}
      </div>
    </section>
  )
}

function Editorial({ gender }: { gender: Gender }) {
  return (
    <section className="mx-auto grid max-w-[1440px] gap-4 px-4 md:grid-cols-12 md:gap-6 md:px-10">
      {EDITORIAL.map((tile, i) => (
        <Link
          key={tile.title}
          href={`/${gender}/all`}
          className={cn("group relative block overflow-hidden bg-studio", i === 0 ? "aspect-[4/5] md:col-span-7 md:aspect-[7/6]" : "aspect-[4/5] md:col-span-5 md:aspect-auto")}
        >
          <Image src={photo(tile.photo, 1200, 1200)} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6 pt-24 text-white md:p-8">
            <h3 className="font-heading text-3xl font-bold md:text-4xl">{tile.title}</h3>
            <p className="mt-1 max-w-[40ch] text-sm text-white/85">{tile.sub}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4">
              Explore <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      ))}
    </section>
  )
}

function Offers({ gender, sale }: { gender: Gender; sale: Product[] }) {
  const list = [...sale.filter((p) => p.gender === gender), ...sale.filter((p) => p.gender !== gender)].slice(0, 3)
  return (
    <section className="mx-auto max-w-360 px-4 md:px-10">
      <div className="grid gap-6 md:grid-cols-4">
        <Link href={`/${gender}/all?badge=Sale`} className="group flex min-h-64 flex-col justify-between bg-foreground p-6 text-background md:p-8">
          <p className="text-sm text-background/70">Limited-time offers</p>
          <div>
            <p className="font-heading text-5xl leading-none font-bold md:text-6xl">Up to 30% off</p>
            <p className="mt-3 text-sm text-background/70">Selected running and training pieces, while stocks last.</p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold">
              Shop the sale <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
        <div className="-mx-4 grid auto-cols-[44%] grid-flow-col gap-3 overflow-x-auto px-4 [scrollbar-none] md:col-span-3 md:mx-0 md:grid-flow-row md:grid-cols-3 md:gap-6 md:px-0">
          {list.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </section>
  )
}

/** Home page UI. Product data comes from the API via app/page.tsx. */
export function HomeView({ byGender, sale }: { byGender: Record<Gender, Product[]>; sale: Product[] }) {
  const [gender, setGender] = useState<Gender>("women")

  useEffect(() => {
    try {
      const saved = localStorage.getItem("MyWear-gender") as Gender | null
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore last tab after mount (HOME-1)
      if (saved && GENDERS.includes(saved)) setGender(saved)
    } catch {}
  }, [])

  const pick = (g: Gender) => {
    setGender(g)
    try {
      localStorage.setItem("MyWear-gender", g)
    } catch {}
  }

  const forGender = byGender[gender]
  const fresh = [...forGender.filter((p) => p.badge === "New" || p.badge === "Limited"), ...forGender.filter((p) => !p.badge)]

  return (
    <div className="space-y-20 md:space-y-28">
      <ScrollHero />
      <Reveal className="space-y-10">
        <div className="mx-auto max-w-360 px-4 md:px-10">
          <GenderTabs value={gender} onChange={pick} />
        </div>
        <CategoryChips gender={gender} products={forGender} />
      </Reveal>
      <Reveal>
        <ProductRail title="New arrivals" products={fresh} href={`/${gender}/all`} />
      </Reveal>
      <Reveal>
        <Editorial gender={gender} />
      </Reveal>
      <Reveal>
        <Offers gender={gender} sale={sale} />
      </Reveal>
      <Reveal>
        <section className="mx-auto max-w-360 px-4 md:px-10">
          <ul className="grid gap-8 sm:grid-cols-3">
            {[
              [Truck, "Free delivery", "On orders over IDR 500,000."],
              [RotateCcw, "Easy returns", "Free within 30 days, in store or by courier."],
              [Store, "Store pickup", "Order online, collect in a few hours."],
            ].map(([Icon, title, body]) => {
              const I = Icon as typeof Truck
              return (
                <li key={title as string} className="flex gap-4">
                  <I className="mt-0.5 size-6 shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="font-semibold">{title as string}</p>
                    <p className="text-sm text-muted-foreground">{body as string}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </Reveal>
    </div>
  )
}
