"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Heart, X } from "lucide-react"
import { toast } from "sonner"
import { ProductImage } from "@/components/store/product-image"
import { QuantityStepper } from "@/components/store/quantity-stepper"
import { useStore, type CartLine } from "@/lib/store"
import { formatIDR, type Product } from "@/lib/data"
import { cn } from "@/lib/utils"

/** One bag item. Used full-size on /bag and compact in the bag drawer. Remove and Move to wishlist both toast with Undo. */
export function BagLine({ line, index, compact }: { line: CartLine & { product: Product }; index: number; compact?: boolean }) {
  const { setQty, remove, add, setSaved } = useStore()
  const { product } = line
  const color = product.colors.find((c) => c.name === line.color) ?? product.colors[0]
  const unit = product.salePrice ?? product.price
  const href = `/product/${line.slug}?color=${encodeURIComponent(line.color)}`

  const removeLine = () => {
    const removed = remove(index)
    toast("Removed from bag", {
      description: product.name,
      action: { label: "Undo", onClick: () => add(removed, removed.qty) },
    })
  }

  const moveToWishlist = () => {
    const removed = remove(index)
    setSaved(line.slug, true)
    toast("Moved to wishlist", {
      description: product.name,
      action: { label: "Undo", onClick: () => add(removed, removed.qty) },
    })
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
      className={cn("flex gap-4", compact ? "py-4" : "py-6")}
    >
      <Link href={href} className={cn("shrink-0 overflow-hidden", compact ? "w-20" : "w-28 md:w-36")}>
        <ProductImage color={color} alt={`${product.name}, ${line.color}`} className="transition-transform duration-500 hover:scale-105" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className={cn("leading-snug hover:underline", compact ? "text-sm" : "font-medium")}>
            {product.name}
          </Link>
          {compact ? (
            <button type="button" onClick={removeLine} aria-label={`Remove ${product.name}`} className="-mt-1 -mr-2 grid size-8 shrink-0 place-items-center hover:bg-mist">
              <X className="size-4" />
            </button>
          ) : (
            <p className="tabular shrink-0 font-heading text-lg font-bold">{formatIDR(unit * line.qty)}</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground md:text-sm">
          {line.color}, {line.size}
        </p>
        {!compact && <p className="tabular text-sm text-muted-foreground">{formatIDR(unit)} each</p>}
        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
          <QuantityStepper size={compact ? "sm" : "md"} value={line.qty} onChange={(n) => setQty(index, n)} />
          {compact ? (
            <p className="tabular ml-auto text-sm font-semibold">{formatIDR(unit * line.qty)}</p>
          ) : (
            <>
              <button type="button" onClick={removeLine} className="text-sm underline underline-offset-4 hover:no-underline">
                Remove
              </button>
              <button type="button" onClick={moveToWishlist} className="flex items-center gap-1 text-sm underline underline-offset-4 hover:no-underline">
                <Heart className="size-4" strokeWidth={1.5} /> Move to wishlist
              </button>
            </>
          )}
        </div>
      </div>
    </motion.li>
  )
}
