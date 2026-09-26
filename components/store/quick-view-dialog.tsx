"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Price } from "@/components/store/price"
import { ProductImage } from "@/components/store/product-image"
import { PurchasePanel } from "@/components/store/purchase-panel"
import { useStore } from "@/lib/store"
import { getProduct, type Product } from "@/lib/data"

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

export function QuickViewDialog() {
  const { quickView, openQuickView } = useStore()
  const product = quickView ? getProduct(quickView) : undefined
  const close = () => openQuickView(null)

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
        {product && <QuickViewBody key={product.slug} product={product} onDone={close} />}
      </DialogContent>
    </Dialog>
  )
}
