"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ProductCard } from "@/components/store/product-card"
import { SectionHeader } from "@/components/store/section-header"
import type { Product } from "@/lib/data"

/** Titled horizontal product carousel: scroll-snap on touch, arrow buttons on desktop. */
export function ProductRail({ title, products, href }: { title: string; products: Product[]; href?: string }) {
  const track = useRef<HTMLDivElement>(null)
  const scroll = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" })

  if (!products.length) return null
  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-10">
      <SectionHeader title={title} href={href}>
        <div className="hidden gap-1 md:flex">
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => scroll(d)}
              aria-label={d < 0 ? "Previous products" : "Next products"}
              className="grid size-10 place-items-center border transition-colors hover:border-foreground active:scale-95"
            >
              {d < 0 ? <ChevronLeft className="size-5" strokeWidth={1.5} /> : <ChevronRight className="size-5" strokeWidth={1.5} />}
            </button>
          ))}
        </div>
      </SectionHeader>
      <div
        ref={track}
        className="-mx-4 grid snap-x snap-mandatory auto-cols-[44%] grid-flow-col gap-3 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] sm:auto-cols-[30%] md:mx-0 md:auto-cols-[calc((100%-4.5rem)/4)] md:gap-6 md:px-0"
      >
        {products.map((p) => (
          <div key={p.slug} className="snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}
