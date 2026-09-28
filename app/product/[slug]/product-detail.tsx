"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Expand, RotateCcw, Share2, Star, Truck } from "lucide-react"
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
import { ImageZoomDialog } from "@/components/store/image-zoom-dialog"
import { Price } from "@/components/store/price"
import { ProductImage } from "@/components/store/product-image"
import { PurchasePanel } from "@/components/store/purchase-panel"
import type { ReviewList } from "@/lib/api"
import { formatIDR, FREE_DELIVERY, type Color, type Product } from "@/lib/data"
import { cn } from "@/lib/utils"

const VIEWS = ["front", "back", "detail", "side", "lifestyle"]

const FIT_LABEL: Record<string, string> = { runs_small: "Runs small", true_to_size: "True to size", runs_large: "Runs large" }

export function ProductDetail({ product, reviews, initialColor }: { product: Product; reviews: ReviewList | null; initialColor?: string }) {
  const [color, setColor] = useState<Color>(product.colors.find((c) => c.name === initialColor) ?? product.colors[0])
  const [zoom, setZoom] = useState<number | null>(null)
  const [slide, setSlide] = useState(0)
  const [showBar, setShowBar] = useState(false)
  const addRef = useRef<HTMLButtonElement>(null)

  // PDP-14: sticky mobile bar once the main button scrolls away
  useEffect(() => {
    const el = addRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const pickColor = (c: Color) => {
    setColor(c)
    const url = new URL(window.location.href)
    url.searchParams.set("color", c.name)
    window.history.replaceState(null, "", url)
  }

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: product.name, url: window.location.href })
      else {
        await navigator.clipboard.writeText(window.location.href)
        toast("Link copied", { description: "Paste it anywhere to share this item." })
      }
    } catch {}
  }

  const image = (i: number, className?: string) => (
    <button
      type="button"
      onClick={() => setZoom(i)}
      aria-label={`Zoom ${VIEWS[i]} view`}
      className={cn("group relative block w-full cursor-zoom-in overflow-hidden", className)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={color.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <ProductImage
            color={color}
            view={i}
            alt={`${color.name} ${product.name}, ${VIEWS[i]} view`}
            className="transition-transform duration-700 ease-[cubic-bezier(.2,0,0,1)] group-hover:scale-[1.03]"
          />
        </motion.div>
      </AnimatePresence>
      <span className="absolute right-3 bottom-3 grid size-10 place-items-center bg-background opacity-0 transition-opacity group-hover:opacity-100">
        <Expand className="size-4" />
      </span>
    </button>
  )

  return (
    <div className="mx-auto max-w-[1440px] md:grid md:grid-cols-12 md:gap-12 md:px-10 md:pt-8">
      {/* Gallery */}
      <div className="md:col-span-7">
        <div
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:hidden"
          onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        >
          {VIEWS.map((v, i) => (
            <div key={v} className="w-full shrink-0 snap-center">
              {image(i)}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-1.5 py-3 md:hidden" aria-hidden>
          {VIEWS.map((v, i) => (
            <span key={v} className={cn("h-1 rounded-full transition-all duration-300", i === slide ? "w-5 bg-foreground" : "w-1.5 bg-line")} />
          ))}
        </div>
        <div className="hidden gap-2 md:grid md:grid-cols-2">
          {VIEWS.map((v, i) => (
            <div key={v} className={i === 0 ? "col-span-2" : undefined}>
              {image(i)}
            </div>
          ))}
        </div>
      </div>

      {/* Info column */}
      <div className="px-4 md:col-span-5 md:px-0">
        <div className="space-y-8 md:sticky md:top-24">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink render={<Link href={`/${product.gender}/all`} />} className="capitalize">
                      {product.gender}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>/</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{product.sport}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <button type="button" onClick={share} aria-label="Share" className="-mr-2 grid size-10 place-items-center hover:bg-mist">
                <Share2 className="size-4" strokeWidth={1.5} />
              </button>
            </div>
            {product.notice && <p className="inline-block bg-mist px-2 py-1 text-xs font-medium">{product.notice}</p>}
            <h1 className="font-heading text-[2rem] leading-[1.05] font-bold md:text-[2.5rem]">{product.name}</h1>
            <div className="flex items-center gap-4">
              <Price product={product} className="text-xl" />
              <a href="#reviews" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <Star className="size-4 fill-current text-foreground" /> {product.rating}
                <span className="underline underline-offset-4">{product.reviews} reviews</span>
              </a>
            </div>
            <p className="max-w-[60ch] text-[15px] leading-relaxed text-muted-foreground">{product.blurb}</p>
          </div>

          <PurchasePanel product={product} color={color} onColorChange={pickColor} addRef={addRef} />

          <ul className="grid gap-3 bg-mist p-4 text-sm">
            <li className="flex items-center gap-3">
              <Truck className="size-5 shrink-0" strokeWidth={1.5} /> Free delivery over {formatIDR(FREE_DELIVERY)}
            </li>
            <li className="flex items-center gap-3">
              <RotateCcw className="size-5 shrink-0" strokeWidth={1.5} /> Free returns within 30 days
            </li>
          </ul>

          <Accordion className="border-t">
            {[
              ["Description", product.blurb],
              ["Details & materials", product.material],
              ["Size & fit", product.fit],
              ["Delivery & returns", "Standard delivery in 2 to 4 working days. Free returns within 30 days, in store or by courier."],
              ...(product.notice ? [["Vouchers & coupons", "This item can't be used with vouchers or coupon codes at checkout."]] : []),
            ].map(([t, body]) => (
              <AccordionItem key={t} value={t} className="border-b">
                <AccordionTrigger className="py-5 text-[15px] font-semibold hover:no-underline">{t}</AccordionTrigger>
                <AccordionContent className="max-w-[65ch] pb-5 text-[15px] leading-relaxed text-muted-foreground">{body}</AccordionContent>
              </AccordionItem>
            ))}
            <AccordionItem value="reviews" id="reviews" className="border-b">
              <AccordionTrigger className="py-5 text-[15px] font-semibold hover:no-underline">
                <span className="flex items-center gap-2">
                  Reviews ({product.reviews})
                  <span className="flex items-center gap-1 font-normal">
                    <Star className="size-4 fill-current" /> {product.rating}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-5 pb-5 text-[15px]">
                {reviews && Object.keys(reviews.summary.fit).length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Fit:{" "}
                    {Object.entries(reviews.summary.fit)
                      .map(([fit, n]) => `${FIT_LABEL[fit] ?? fit} (${n})`)
                      .join(", ")}
                  </p>
                )}
                {!reviews?.items.length ? (
                  <p className="text-muted-foreground">No written reviews yet. Customers who buy this item can review it from their order.</p>
                ) : (
                  reviews.items.map((r) => (
                    <figure key={r.id} className="space-y-1.5">
                      <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={cn("size-3.5", i < r.rating ? "fill-current" : "text-line")} />
                        ))}
                      </div>
                      <p className="font-semibold">{r.title}</p>
                      <blockquote>&ldquo;{r.body}&rdquo;</blockquote>
                      <figcaption className="text-xs text-muted-foreground">
                        {r.author}, verified buyer. Fit: {FIT_LABEL[r.fit] ?? r.fit}
                      </figcaption>
                    </figure>
                  ))
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <ImageZoomDialog name={product.name} color={color} views={VIEWS} index={zoom} onIndex={setZoom} />

      {/* Mobile sticky add-to-bag */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t bg-background/95 p-3 backdrop-blur-md md:hidden"
          >
            <ProductImage color={color} alt="" className="w-10 shrink-0" />
            <Price product={product} className="flex-1 text-base" />
            <Button onClick={() => addRef.current?.click()} className="h-12 flex-1 font-heading text-base font-semibold">
              Add to bag
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
