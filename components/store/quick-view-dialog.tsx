"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { EmptyState } from "@/components/store/empty-state"
import { Price } from "@/components/store/price"
import { ProductImage } from "@/components/store/product-image"
import { PurchasePanel } from "@/components/store/purchase-panel"
import { api, messageOf } from "@/lib/api"
import type { Product } from "@/lib/data"
import { useStore } from "@/lib/store"

function QuickViewBody({ product, onDone }: { product: Product; onDone: () => void }) {
  const [color, setColor] = useState(product.colors[0])
  return (
    <div className="grid md:grid-cols-2">
      <ProductImage color={color} alt={`${product.name}, ${color.name}`} className="max-md:aspect-[4/3]" />
      <div className="flex flex-col gap-5 p-6 md:p-8">
        <div className="space-y-1.5 pr-8">
          <DialogTitle className="font-heading text-2xl leading-tight font-bold">{product.name}</DialogTitle>
          <DialogDescription className="line-clamp-2">{product.blurb}</DialogDescription>
          <Price product={product} className="text-lg" />
        </div>
        <PurchasePanel product={product} color={color} onColorChange={setColor} onAdded={onDone} />
        <Link href={`/product/${product.slug}`} onClick={onDone} className="group mt-auto flex items-center gap-1 text-sm font-medium">
          View full details <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}

function QuickViewSkeleton() {
  return (
    <div className="grid md:grid-cols-2" aria-busy="true" aria-label="Loading product">
      <div className="aspect-[4/3] animate-pulse bg-studio md:aspect-[4/5]" />
      <div className="space-y-4 p-6 md:p-8">
        <DialogTitle className="sr-only">Loading product</DialogTitle>
        <div className="h-8 w-3/4 animate-pulse bg-mist" />
        <div className="h-4 w-full animate-pulse bg-mist" />
        <div className="h-6 w-1/3 animate-pulse bg-mist" />
        <div className="grid grid-cols-5 gap-2 pt-6">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-11 animate-pulse bg-mist" />
          ))}
        </div>
        <div className="h-13 animate-pulse bg-mist" />
      </div>
    </div>
  )
}

export function QuickViewDialog() {
  const { quickView, openQuickView } = useStore()
  // Keyed by slug, so a slow response for a product the shopper already closed is ignored
  const [loaded, setLoaded] = useState<{ slug: string; product?: Product; error?: string } | null>(null)
  const close = () => openQuickView(null)

  useEffect(() => {
    if (!quickView) return
    let current = true
    api<Product>(`/products/${encodeURIComponent(quickView)}`)
      .then((product) => current && setLoaded({ slug: quickView, product }))
      .catch((e) => current && setLoaded({ slug: quickView, error: messageOf(e) }))
    return () => {
      current = false
    }
  }, [quickView])

  const state = loaded?.slug === quickView ? loaded : null

  return (
    <Dialog open={!!quickView} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
        {state?.product ? (
          <QuickViewBody key={state.product.slug} product={state.product} onDone={close} />
        ) : state?.error ? (
          <>
            <DialogTitle className="sr-only">Product unavailable</DialogTitle>
            <EmptyState title="We couldn't load this item" body={state.error} className="py-12" />
          </>
        ) : (
          <QuickViewSkeleton />
        )}
      </DialogContent>
    </Dialog>
  )
}
